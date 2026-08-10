#!/usr/bin/env python3
"""Import one HTML file into Pixso via local MCP (code_to_design)."""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
import zipfile
from io import BytesIO
from pathlib import Path

DEFAULT_MCP_URL = 'http://127.0.0.1:3667/mcp'
IMPORT_START = '<!-- pixso-import-start -->'
IMPORT_END = '<!-- pixso-import-end -->'
DEFAULT_WIDTH = 375
DEFAULT_HEIGHT = 812

# P-00-splash -> P-00 ; O-03a-delete-video -> O-03a ; DS-00-color -> DS-00
FRAME_ID_RE = re.compile(
    r'^((?:P|H|V|G|DS)-\d{2}|O-\d{2}[a-z]?)',
    re.IGNORECASE,
)


def post(url: str, payload: dict) -> dict:
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
        },
        method='POST',
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read().decode('utf-8'))


def initialize(url: str) -> None:
    post(
        url,
        {
            'jsonrpc': '2.0',
            'id': 1,
            'method': 'initialize',
            'params': {
                'protocolVersion': '2024-11-05',
                'capabilities': {},
                'clientInfo': {'name': 'xgc-ui-plan-to-pixso', 'version': '1.2'},
            },
        },
    )
    post(url, {'jsonrpc': '2.0', 'method': 'notifications/initialized', 'params': {}})


def frame_id_from_stem(stem: str) -> str | None:
    match = FRAME_ID_RE.match(stem)
    if not match:
        return None
    return match.group(1)


def extract_balanced_div(html: str, start: int) -> str | None:
    depth = 0
    i = start
    length = len(html)
    while i < length:
        lower = html[i : i + 6].lower()
        if lower.startswith('<div'):
            depth += 1
            gt = html.find('>', i)
            if gt == -1:
                return None
            i = gt + 1
            continue
        if lower.startswith('</div'):
            depth -= 1
            close = html.find('>', i)
            i = (close + 1) if close != -1 else i + 6
            if depth == 0:
                return html[start:i]
            continue
        i += 1
    return None


def find_div_start(
    html: str,
    *,
    class_token: str | None = None,
    div_id: str | None = None,
    data_frame_id: str | None = None,
) -> int | None:
    for match in re.finditer(r'<div\b[^>]*>', html, re.IGNORECASE):
        tag = match.group(0)
        if data_frame_id and re.search(
            rf'\bdata-frame-id=["\']{re.escape(data_frame_id)}["\']',
            tag,
            re.IGNORECASE,
        ):
            return match.start()
        if div_id and re.search(
            rf'\bid=["\']{re.escape(div_id)}["\']',
            tag,
            re.IGNORECASE,
        ):
            return match.start()
        if class_token and re.search(
            rf'\bclass=["\'][^"\']*\b{re.escape(class_token)}\b',
            tag,
            re.IGNORECASE,
        ):
            return match.start()
    return None


def extract_div(
    html: str,
    *,
    class_token: str | None = None,
    div_id: str | None = None,
    data_frame_id: str | None = None,
) -> str | None:
    start = find_div_start(
        html,
        class_token=class_token,
        div_id=div_id,
        data_frame_id=data_frame_id,
    )
    if start is None:
        return None
    return extract_balanced_div(html, start)


def extract_legacy_markers(html: str) -> str | None:
    start = html.find(IMPORT_START)
    end = html.find(IMPORT_END)
    if start != -1 and end != -1 and end > start:
        return html[start + len(IMPORT_START) : end].strip()
    return None


def resolve_frame_root(html: str, path: Path) -> tuple[str, str]:
    """Locate artboard root div for Pixso import. Returns (outer_html, selector_label)."""
    stem = path.stem
    frame_id = frame_id_from_stem(stem)

    attempts: list[tuple[str, str | None, str | None, str | None]] = [
        (f'div.{stem} (class)', stem, None, None),
    ]
    if frame_id:
        attempts.extend(
            [
                (f'#{frame_id} (id)', None, frame_id, None),
                (f'[data-frame-id="{frame_id}"]', None, None, frame_id),
            ]
        )

    for label, class_token, div_id, data_frame_id in attempts:
        fragment = extract_div(
            html,
            class_token=class_token,
            div_id=div_id,
            data_frame_id=data_frame_id,
        )
        if fragment:
            return fragment, label

    legacy = extract_legacy_markers(html)
    if legacy:
        return legacy, 'pixso-import markers (legacy)'

    if html.strip().startswith('<div'):
        return html.strip(), 'file root <div>'

    raise ValueError(
        f'No artboard root found in {path.name}. '
        f'Expected <div class="{stem}" data-frame-id="{frame_id or "P-xx"}"> … </div>'
    )


def build_pixso_document(fragment: str, width: int, height: int) -> str:
    """Thin wrapper so Pixso does not expand to browser viewport (not the design source of truth)."""
    return (
        '<!DOCTYPE html>\n'
        f'<html lang="zh-CN" style="margin:0;padding:0;width:{width}px;height:{height}px;'
        f'overflow:hidden;background:transparent;">\n'
        '<head><meta charset="UTF-8" />'
        f'<style>html,body{{margin:0;padding:0;width:{width}px;height:{height}px;'
        f'min-width:{width}px;max-width:{width}px;min-height:{height}px;max-height:{height}px;'
        f'overflow:hidden;}}</style></head>\n'
        f'<body style="margin:0;padding:0;width:{width}px;height:{height}px;overflow:hidden;">\n'
        f'{fragment}\n'
        '</body></html>'
    )


def html_to_zip_bytes(document: str) -> list[int]:
    buf = BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as archive:
        archive.writestr('index.html', document)
    return list(buf.getvalue())


def parse_frame_size(fragment: str) -> tuple[int, int]:
    match = re.search(
        r'width:\s*(\d+)px[^;]*;[^"]*height:\s*(\d+)px',
        fragment,
        re.IGNORECASE,
    )
    if match:
        return int(match.group(1)), int(match.group(2))
    return DEFAULT_WIDTH, DEFAULT_HEIGHT


def code_to_design(url: str, *, html_str: str | None = None, html_buffer: list[int] | None = None) -> dict:
    arguments: dict = {}
    if html_str is not None:
        arguments['htmlStr'] = html_str
    if html_buffer is not None:
        arguments['htmlBuffer'] = html_buffer
    return post(
        url,
        {
            'jsonrpc': '2.0',
            'id': 2,
            'method': 'tools/call',
            'params': {
                'name': 'code_to_design',
                'arguments': arguments,
            },
        },
    )


def main() -> int:
    if len(sys.argv) < 2:
        print('Usage: pixso_code_to_design.py <path-to.html> [--zip]', file=sys.stderr)
        return 2
    path = Path(sys.argv[1]).expanduser().resolve()
    use_zip = '--zip' in sys.argv[2:]
    if not path.is_file():
        print(f'Not found: {path}', file=sys.stderr)
        return 1
    mcp_url = os.environ.get('PIXSO_MCP_URL', DEFAULT_MCP_URL)
    raw = path.read_text(encoding='utf-8')
    try:
        fragment, selector = resolve_frame_root(raw, path)
    except ValueError as error:
        print(error, file=sys.stderr)
        return 1
    width, height = parse_frame_size(fragment)
    document = build_pixso_document(fragment, width, height)
    print(
        f'Import: {selector} → {width}x{height}, mode={"zip" if use_zip else "htmlStr"}',
        file=sys.stderr,
    )
    try:
        initialize(mcp_url)
        if use_zip:
            result = code_to_design(mcp_url, html_buffer=html_to_zip_bytes(document))
        else:
            result = code_to_design(mcp_url, html_str=document)
    except urllib.error.HTTPError as error:
        body = error.read().decode('utf-8', errors='replace')
        print(f'Pixso MCP HTTP {error.code}: {body}', file=sys.stderr)
        return 1
    except urllib.error.URLError as error:
        print(f'Pixso MCP unreachable at {mcp_url}: {error}', file=sys.stderr)
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

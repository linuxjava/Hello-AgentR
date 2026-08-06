#!/usr/bin/env node
/**
 * PreToolUse hook: remind AI agent to call load_skills_for_files() before any code edit.
 * Installed by agent-skills-standard (ags sync). Remove via: ags hooks uninstall
 *
 * Contract (Cursor / Claude Code via Cursor third-party hooks):
 * - Exit 0  => stdout MUST be valid JSON, e.g. {"permission":"allow"}
 * - Exit 2  => block (deny)
 * - Reminders go to stderr (or agent_message), NEVER plain text on stdout
 */
const path = require('path');

const REPO_ROOT = process.env.CLAUDE_PROJECT_DIR
  || process.env.CURSOR_PROJECT_DIR
  || path.resolve(__dirname, '../../');
const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit']);
const SKIP_DIRS = [
  path.resolve(REPO_ROOT, '.claude'),
  path.resolve(REPO_ROOT, '.gemini'),
  path.resolve(REPO_ROOT, '.codex'),
  path.resolve(REPO_ROOT, '.github'),
  path.resolve(REPO_ROOT, '.cursor'),
  path.resolve(REPO_ROOT, '.roo'),
  path.resolve(REPO_ROOT, '.trae'),
  path.resolve(REPO_ROOT, '.opencode'),
  path.resolve(REPO_ROOT, '.kiro'),
  path.resolve(REPO_ROOT, '.windsurf'),
  path.resolve(REPO_ROOT, '.agents'),
  path.resolve(REPO_ROOT, '.vscode'),
];
const SKIP_FILES = [
  path.resolve(REPO_ROOT, 'AGENTS.md'),
  path.resolve(REPO_ROOT, 'CLAUDE.md'),
];

function shouldSkip(filePath) {
  try {
    const real = path.resolve(filePath);
    if (SKIP_DIRS.some(d => real.startsWith(d + path.sep) || real === d)) return true;
    if (SKIP_FILES.includes(real)) return true;
    return false;
  } catch {
    return false;
  }
}

/** Always emit valid JSON on stdout before exit 0 (Cursor parses it). */
function allow(agentMessage) {
  const payload = { permission: 'allow' };
  if (agentMessage) {
    // Cursor: optional message to agent; Claude Code third-party may also surface it
    payload.agent_message = agentMessage;
    payload.systemMessage = agentMessage;
  }
  process.stdout.write(JSON.stringify(payload) + '\n');
  process.exit(0);
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');
    if (!EDIT_TOOLS.has(data.tool_name)) {
      allow();
      return;
    }

    const filePath = data.tool_input?.file_path || data.tool_input?.path || '';
    if (!filePath || shouldSkip(filePath)) {
      allow();
      return;
    }

    const fileName = path.basename(filePath);
    const reminder =
      '[SKILL TRIGGER] Editing: ' + fileName + '\n' +
      '-> Call load_skills_for_files(files=[ "' + filePath + '" ]) on the ' +
      'agent-skills-standard MCP. It returns applicable SKILL.md rules, ' +
      'or nothing if no skills match this file type.\n' +
      '-> If this work spans a whole framework or migration, also call ' +
      'get_category_guide(category="...") for the framework-level map.';

    // Human/debug visibility in Hooks output channel
    console.error(reminder);
    allow(reminder);
  } catch (err) {
    console.error('[preedit-skill-loader] ' + (err && err.message ? err.message : String(err)));
    allow();
  }
});

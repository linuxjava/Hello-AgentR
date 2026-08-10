const RIPPLE_SELECTOR = 'button, [role="button"]'
const SKIP_SELECTOR = ':disabled, [disabled], [aria-disabled="true"], [aria-label="关闭遮罩"]'

function resolveTarget(eventTarget: EventTarget | null): HTMLElement | null {
  if (!(eventTarget instanceof Element)) {
    return null
  }
  const candidate = eventTarget.closest(RIPPLE_SELECTOR)
  if (!(candidate instanceof HTMLElement)) {
    return null
  }
  if (candidate.matches(SKIP_SELECTOR)) {
    return null
  }
  return candidate
}

function spawnRipple(host: HTMLElement, clientX: number, clientY: number): void {
  const rect = host.getBoundingClientRect()
  const diameter = Math.max(rect.width, rect.height) * 2
  const ripple = document.createElement('span')
  ripple.className = 'btn-ripple'
  ripple.setAttribute('aria-hidden', 'true')
  ripple.style.width = `${diameter}px`
  ripple.style.height = `${diameter}px`
  ripple.style.left = `${clientX - rect.left - diameter / 2}px`
  ripple.style.top = `${clientY - rect.top - diameter / 2}px`

  host.appendChild(ripple)
  ripple.addEventListener(
    'animationend',
    () => {
      ripple.remove()
    },
    { once: true },
  )
}

/**
 * Installs a document-level pointerdown handler so every interactive button
 * gets a Material-style ink ripple without wrapping each call site.
 */
export function installButtonRipple(): () => void {
  const onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) {
      return
    }
    const host = resolveTarget(event.target)
    if (!host) {
      return
    }
    spawnRipple(host, event.clientX, event.clientY)
  }

  document.addEventListener('pointerdown', onPointerDown, { passive: true })
  return () => {
    document.removeEventListener('pointerdown', onPointerDown)
  }
}

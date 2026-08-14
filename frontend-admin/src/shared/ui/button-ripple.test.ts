import { afterEach, describe, expect, it } from 'vitest'
import { installButtonRipple } from '@/shared/ui/button-ripple'

function pointerDown(el: HTMLElement): void {
  el.dispatchEvent(
    new PointerEvent('pointerdown', {
      button: 0,
      clientX: 12,
      clientY: 12,
      bubbles: true,
    }),
  )
}

describe('installButtonRipple', () => {
  let uninstall: (() => void) | undefined

  afterEach(() => {
    uninstall?.()
    uninstall = undefined
    document.body.replaceChildren()
  })

  it('spawns a ripple on a normal button', () => {
    uninstall = installButtonRipple()
    const btn = document.createElement('button')
    btn.textContent = '保存'
    document.body.appendChild(btn)
    pointerDown(btn)
    expect(btn.querySelector('.btn-ripple')).not.toBeNull()
  })

  it('does not spawn a ripple on listbox options', () => {
    uninstall = installButtonRipple()
    const list = document.createElement('ul')
    list.setAttribute('role', 'listbox')
    const option = document.createElement('button')
    option.setAttribute('role', 'option')
    option.textContent = '重叠分块'
    list.appendChild(option)
    document.body.appendChild(list)
    pointerDown(option)
    expect(option.querySelector('.btn-ripple')).toBeNull()
  })

  it('does not spawn a ripple on a listbox trigger', () => {
    uninstall = installButtonRipple()
    const trigger = document.createElement('button')
    trigger.setAttribute('aria-haspopup', 'listbox')
    trigger.setAttribute('data-no-ripple', '')
    trigger.textContent = '分块策略'
    document.body.appendChild(trigger)
    pointerDown(trigger)
    expect(trigger.querySelector('.btn-ripple')).toBeNull()
  })
})

// src/events.ts
export const EVENTS = {
  MODEL_CLICK: "model-click",
  THEME_PULSE: "theme-pulse",
  HOVER_MODEL: "hover-model",
  USER_CLICK: "user-click", // New event for actual user clicks
} as const

export type ThemePayload = {
  bloom?: boolean
  color?: number // neon hex for convenience
}

const bus = new EventTarget()

export function fireModelClick(detail: ThemePayload = {}) {
  bus.dispatchEvent(new CustomEvent(EVENTS.MODEL_CLICK, { detail }))
  bus.dispatchEvent(new CustomEvent(EVENTS.THEME_PULSE, { detail }))
}

export function onModelClick(handler: (p: ThemePayload) => void) {
  const fn = (e: Event) => handler((e as CustomEvent).detail)
  bus.addEventListener(EVENTS.MODEL_CLICK, fn)
  return () => bus.removeEventListener(EVENTS.MODEL_CLICK, fn)
}

export function onThemePulse(handler: (p: ThemePayload) => void) {
  const fn = (e: Event) => handler((e as CustomEvent).detail)
  bus.addEventListener(EVENTS.THEME_PULSE, fn)
  return () => bus.removeEventListener(EVENTS.THEME_PULSE, fn)
}

export function fireHoverModel(over: boolean) {
  bus.dispatchEvent(new CustomEvent(EVENTS.HOVER_MODEL, { detail: { over } }))
}
export function onHoverModel(handler: (over: boolean) => void) {
  const fn = (e: Event) => handler((e as CustomEvent).detail.over)
  bus.addEventListener(EVENTS.HOVER_MODEL, fn)
  return () => bus.removeEventListener(EVENTS.HOVER_MODEL, fn)
}

export function fireUserClick(detail: ThemePayload = {}) {
  bus.dispatchEvent(new CustomEvent(EVENTS.USER_CLICK, { detail }))
}
export function onUserClick(handler: (p: ThemePayload) => void) {
  const fn = (e: Event) => handler((e as CustomEvent).detail)
  bus.addEventListener(EVENTS.USER_CLICK, fn)
  return () => bus.removeEventListener(EVENTS.USER_CLICK, fn)
}
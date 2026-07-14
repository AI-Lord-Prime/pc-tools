export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: number
  type: ToastType
  message: string
}

let toasts: ToastMessage[] = []
let listeners: ((toasts: ToastMessage[]) => void)[] = []
let idCounter = 0

function notifyListeners() {
  listeners.forEach((fn) => fn([...toasts]))
}

export function subscribe(callback: (toasts: ToastMessage[]) => void) {
  listeners.push(callback)
  callback([...toasts])
  return () => {
    listeners = listeners.filter((fn) => fn !== callback)
  }
}

export function showToast(type: ToastType, message: string, duration = 3000) {
  const id = ++idCounter
  toasts = [...toasts, { id, type, message }]
  notifyListeners()
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    notifyListeners()
  }, duration)
}

export const message = {
  success: (msg: string) => showToast('success', msg),
  error: (msg: string) => showToast('error', msg),
  warning: (msg: string) => showToast('warning', msg),
  info: (msg: string) => showToast('info', msg)
}

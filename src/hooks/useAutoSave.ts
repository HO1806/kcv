import { useEffect, useRef } from 'react'

/**
 * Debounced auto-save. Calls `save(value)` after `delay` ms of stillness.
 * Pass `onError` to be notified when the save throws — errors are otherwise swallowed.
 */
export function useAutoSave<T>(
  value: T,
  save: (v: T) => void | Promise<void>,
  delay = 700,
  onError?: (err: unknown) => void,
) {
  const savedRef = useRef<T>(value)
  const saveRef = useRef(save)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    saveRef.current = save
    onErrorRef.current = onError
  })

  useEffect(() => {
    if (!hasChanged(value, savedRef.current)) return
    const timer = setTimeout(() => {
      savedRef.current = value
      try {
        const result = saveRef.current(value)
        if (result && typeof (result as Promise<void>).then === 'function') {
          ;(result as Promise<void>).catch((err: unknown) => onErrorRef.current?.(err))
        }
      } catch (err) {
        onErrorRef.current?.(err)
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [value, delay])
}

/**
 * Diff detection prefers `updatedAt` (cheap numeric compare) when both values
 * carry it; falls back to JSON.stringify for plain objects.
 */
function hasChanged<T>(next: T, prev: T): boolean {
  const nextUpdatedAt = readUpdatedAt(next)
  const prevUpdatedAt = readUpdatedAt(prev)
  if (nextUpdatedAt !== null && prevUpdatedAt !== null) {
    return nextUpdatedAt !== prevUpdatedAt
  }
  return JSON.stringify(next) !== JSON.stringify(prev)
}

function readUpdatedAt(v: unknown): number | null {
  if (v && typeof v === 'object' && 'updatedAt' in v) {
    const ua = (v as { updatedAt?: unknown }).updatedAt
    if (typeof ua === 'number') return ua
  }
  return null
}

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface DataActionsProps {
  exportLabel: string
  importLabel: string
  importing: boolean
  message: { type: 'success' | 'error'; text: string } | null
  onExport: () => void
  onImport: (file: File) => void
}

/**
 * Two outline action buttons + sonner toasts for data import/export feedback.
 */
export function DataActions({
  exportLabel,
  importLabel,
  importing,
  message,
  onExport,
  onImport,
}: DataActionsProps) {
  const fileRef = useRef<HTMLInputElement | null>(null)

  // Surface upstream messages as toasts. Keep the inline message for ARIA fallback.
  useEffect(() => {
    if (!message) return
    if (message.type === 'success') {
      toast.success(message.text)
    } else {
      toast.error(message.text)
    }
  }, [message])

  function pick() {
    fileRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onImport(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          onClick={onExport}
          className="justify-center"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden>
            download
          </span>
          {exportLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={pick}
          disabled={importing}
          loading={importing}
          className="justify-center"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden>
            upload
          </span>
          {importLabel}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {message && (
        <p
          role="status"
          className="sr-only"
          aria-live="polite"
        >
          {message.text}
        </p>
      )}
    </div>
  )
}

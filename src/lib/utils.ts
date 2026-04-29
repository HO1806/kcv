import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function hashProfile(profile: object): string {
  const str = JSON.stringify(profile)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash.toString(36)
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month] = dateStr.split('-')
  const months: Record<string, string> = {
    '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
    '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Aoû',
    '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc',
  }
  return month ? `${months[month] ?? month} ${year}` : year
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

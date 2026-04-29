/**
 * Fetch a job posting's text content via Jina Reader (https://r.jina.ai).
 * Returns clean markdown, or null on failure (caller should fall back to manual paste).
 * Free anonymous tier: ~200 RPM. Add an X-API-Key header to lift the limit if needed.
 */
const FETCH_TIMEOUT_MS = 15_000

export async function fetchJobDescription(url: string): Promise<string | null> {
  try {
    const trimmed = url.trim()
    if (!trimmed) return null

    // Validate that the input is a parseable URL with an allowed scheme
    // before hitting the proxy.
    let parsed: URL
    try {
      parsed = new URL(trimmed)
    } catch {
      return null
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      const jinaUrl = `https://r.jina.ai/${encodeURIComponent(trimmed)}`
      const res = await fetch(jinaUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
          'X-Return-Format': 'markdown',
        },
        signal: controller.signal,
      })

      if (!res.ok) return null

      const text = await res.text()
      return text.trim().slice(0, 10_000)
    } finally {
      clearTimeout(timer)
    }
  } catch {
    return null
  }
}

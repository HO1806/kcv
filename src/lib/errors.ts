/**
 * Converts a raw Gemini SDK error into a user-friendly French message.
 * Prevents raw JSON quota blobs, HTTP noise, or stack traces from reaching the UI.
 *
 * Free-tier limits (Gemini 2.0/2.5 Flash): 10 RPM, 250 RPD, 250k TPM.
 */
export function parseGeminiError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)

  if (
    msg.includes('429') ||
    msg.toLowerCase().includes('quota') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.toLowerCase().includes('too many requests')
  ) {
    const retryMatch =
      msg.match(/retry in ([\d.]+)\s*s/i) ||
      msg.match(/retryDelay["'\s:]+(\d+\.?\d*)s/i)
    if (retryMatch) {
      const seconds = Math.ceil(Number(retryMatch[1]))
      return `Limite de requêtes Gemini atteinte (10/min, 250/jour sur le tier gratuit). Réessayez dans ${seconds} seconde${seconds > 1 ? 's' : ''}.`
    }
    return 'Limite de requêtes Gemini atteinte (10/min, 250/jour sur le tier gratuit). Attendez quelques minutes puis réessayez.'
  }

  if (
    msg.includes('API key not valid') ||
    msg.includes('API_KEY_INVALID') ||
    (msg.includes('400') && msg.toLowerCase().includes('key'))
  ) {
    return 'Clé API invalide. Vérifiez votre clé dans les Paramètres.'
  }

  if (msg.includes('403') || msg.includes('PERMISSION_DENIED')) {
    return 'Accès refusé. Vérifiez que votre clé API est activée pour Gemini.'
  }

  if (msg.includes('503') || msg.includes('UNAVAILABLE')) {
    return 'Le service Gemini est temporairement indisponible. Réessayez dans quelques instants.'
  }

  if (msg.includes('404') || msg.includes('NOT_FOUND') || msg.includes('is not found for API version')) {
    return 'Modèle Gemini introuvable. La version utilisée n\'est plus disponible — mettez à jour l\'application.'
  }

  if (
    msg.toLowerCase().includes('failed to fetch') ||
    msg.toLowerCase().includes('networkerror') ||
    msg.toLowerCase().includes('fetch error')
  ) {
    return 'Erreur réseau. Vérifiez votre connexion internet.'
  }

  // JSON parse errors usually mean the API returned HTML (auth wall, outage, blocked region)
  if (
    err instanceof SyntaxError ||
    msg.includes('not valid JSON') ||
    msg.includes('Unexpected token')
  ) {
    return 'Réponse Gemini invalide. Le service a peut-être renvoyé une page d\'erreur — réessayez dans un instant.'
  }

  // Strip SDK prefix like "[GoogleGenerativeAIError]: " and return first line only
  const firstLine = msg.split('\n')[0].replace(/^\[.*?\]:\s*/, '').slice(0, 200).trim()
  return firstLine || 'Une erreur est survenue. Veuillez réessayer.'
}

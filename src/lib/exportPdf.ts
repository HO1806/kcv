const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297

export async function exportElementAsPdf(element: HTMLElement, filename: string): Promise<void> {
  // Defer html2canvas + jsPDF (~247 kB) until export is actually triggered.
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  // Temporarily position off-screen at full size so html2canvas can measure layout.
  // The element normally has display:none which gives it zero dimensions.
  // Do NOT use visibility:hidden — html2canvas skips invisible elements.
  const prev = element.getAttribute('style') ?? ''
  element.setAttribute(
    'style',
    `display:block !important; position:fixed !important; top:0 !important; left:-9999px !important; width:794px !important; z-index:-1 !important;`,
  )

  // Two rAF ticks so the browser lays out and paints the newly visible element.
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

  let canvas: HTMLCanvasElement
  try {
    canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
    })
  } finally {
    // Always restore original style, even when html2canvas throws.
    element.setAttribute('style', prev)
  }

  if (canvas.width === 0 || canvas.height === 0) {
    throw new Error('Le rendu du CV est vide — réessayez.')
  }

  const imgWidth = A4_WIDTH_MM
  const imgHeight = (canvas.height * A4_WIDTH_MM) / canvas.width

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  let yOffset = 0
  let remainingHeight = imgHeight

  while (remainingHeight > 0) {
    if (yOffset > 0) pdf.addPage()

    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      -yOffset,
      imgWidth,
      imgHeight,
    )

    yOffset += A4_HEIGHT_MM
    remainingHeight -= A4_HEIGHT_MM
  }

  pdf.save(filename)
}

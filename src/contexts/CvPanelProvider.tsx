import { useState } from 'react'
import { CvPanelContext, type PanelCv } from './CvPanelContext'
import type { BaseCV } from '../types'

export function CvPanelProvider({ children }: { children: React.ReactNode }) {
  const [panelCv, setPanelCv] = useState<PanelCv>(null)
  const [baseCv, setBaseCv] = useState<BaseCV | null>(null)
  const [showDiff, setShowDiff] = useState<boolean>(false)
  return (
    <CvPanelContext.Provider
      value={{ panelCv, setPanelCv, baseCv, setBaseCv, showDiff, setShowDiff }}
    >
      {children}
    </CvPanelContext.Provider>
  )
}

import { createContext, useContext } from 'react'
import type { BaseCV, JobApplication } from '../types'

export type PanelCv = BaseCV | JobApplication | null
export type PanelMode = 'live' | 'generated' | 'adapted'

export interface CvPanelContextValue {
  panelCv: PanelCv
  setPanelCv: (cv: PanelCv) => void
  baseCv: BaseCV | null
  setBaseCv: (cv: BaseCV | null) => void
  showDiff: boolean
  setShowDiff: (show: boolean) => void
}

export const CvPanelContext = createContext<CvPanelContextValue>({
  panelCv: null,
  setPanelCv: () => {},
  baseCv: null,
  setBaseCv: () => {},
  showDiff: false,
  setShowDiff: () => {},
})

export function useCvPanel(): CvPanelContextValue {
  return useContext(CvPanelContext)
}

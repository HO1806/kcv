import type { ApplicationStatus } from '../../types'

export type StatusFilter = ApplicationStatus | 'all'

export const STATUS_FILTERS: StatusFilter[] = ['all', 'saved', 'applied', 'interview', 'offer', 'rejected']

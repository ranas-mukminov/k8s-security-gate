export type ScanStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export interface Finding {
  id: string
  severity: SeverityLevel
  line: number
  message: string
  fix?: string
  category?: string
}

export interface ScanJob {
  id: string
  createdAt: string
  status: ScanStatus
  filename: string
  originalYaml: string
  fixedYaml?: string
  reportJson?: Finding[]
  score?: number
}

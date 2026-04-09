export type CeilingMaterial = 'drywall' | 'concrete' | 'wood' | 'other'

export interface Measurements {
  ceilingHeight:   number   // feet
  roomDepth:       number   // feet
  roomWidth:       number   // feet
  ceilingMaterial: CeilingMaterial | ''
}

export interface ValidationIssue {
  field: keyof Measurements
  severity: 'error' | 'warning'
  message: string
  recommendation: string
}

export interface ValidationResult {
  status: 'compatible' | 'conditional' | 'incompatible'
  issues: ValidationIssue[]
}

export interface Component {
  name: string
  category: 'Essential' | 'Recommended' | 'InBox'
  included: boolean
  required: boolean
  reason: string
  note?: string
  image?: string
}

export interface RotationTransform {
  axis: 'x' | 'y' | 'z'
  min: number
  max: number
  unit: 'degrees'
  default: number
}

export interface PartTransform {
  rotation?: RotationTransform
}

export interface PartCapabilities {
  rotate: boolean
  translate: boolean
  scale: boolean
}

export interface PartAction {
  id: string
  label: string
  type?: 'transform' | 'animation'
  // transform action
  transform?: {
    rotation?: Partial<Record<'x' | 'y' | 'z', number>>
  }
  // animation action
  animationName?: string
  durationMs: number
}

export interface ContractPart {
  nodeName: string
  label: string
  type: 'hinge' | 'static'
  transform?: PartTransform
  capabilities: PartCapabilities
  actions?: PartAction[]
}

export interface LightConfig {
  color: string
  intensity: number
}

export interface LightingConfig {
  type: 'normal' | 'custom'
  ambient?: LightConfig
  key?: LightConfig
  fill?: LightConfig
}

export interface Contract {
  product: string
  material: {
    sheetUrl: string
    default: string
  }
  lighting?: LightingConfig
  parts: Record<string, ContractPart>
}

export interface MaterialDefinition {
  id: string
  label: string
  color: string
  roughness: number
  metalness: number
  textureUrl?: string
}

export type MaterialSheet = Record<string, MaterialDefinition>

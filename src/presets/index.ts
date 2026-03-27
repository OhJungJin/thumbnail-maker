import type { CustomStyle, StylePreset } from '../core/types'
import { pixarPreset } from './pixar'

/**
 * Registry of all available style presets
 */
const presets: Record<StylePreset, CustomStyle> = {
  'pixar-3d': pixarPreset,
  // Future presets will be added here
  'watercolor': pixarPreset,     // Placeholder - will be replaced in Phase 2
  'illustration': pixarPreset,   // Placeholder - will be replaced in Phase 2
  'minimal': pixarPreset         // Placeholder - will be replaced in Phase 2
}

/**
 * Get a preset by name
 */
export function getPreset(name: StylePreset): CustomStyle | undefined {
  return presets[name]
}

/**
 * Check if a preset name is valid
 */
export function isValidPreset(name: string): name is StylePreset {
  return name in presets
}

export { pixarPreset } from './pixar'

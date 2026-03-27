import { describe, it, expect } from 'vitest'
import { getPreset, isValidPreset } from '../../src/presets'

describe('preset registry', () => {
  it('should return pixar-3d preset', () => {
    const preset = getPreset('pixar-3d')

    expect(preset).toBeDefined()
    expect(preset.name).toBe('pixar-3d')
  })

  it('should return undefined for unknown preset', () => {
    const preset = getPreset('unknown-preset' as any)

    expect(preset).toBeUndefined()
  })

  it('should validate known presets', () => {
    expect(isValidPreset('pixar-3d')).toBe(true)
  })

  it('should reject unknown presets', () => {
    expect(isValidPreset('unknown')).toBe(false)
  })
})

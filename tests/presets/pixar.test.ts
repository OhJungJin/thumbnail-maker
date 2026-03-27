import { describe, it, expect } from 'vitest'
import { pixarPreset } from '../../src/presets/pixar'

describe('pixarPreset', () => {
  it('should generate prompt with title', () => {
    const prompt = pixarPreset.template({ title: 'React Hooks Guide' })

    expect(prompt).toContain('React Hooks Guide')
    expect(prompt).toContain('Pixar')
    expect(prompt).toContain('3D')
  })

  it('should include summary when provided', () => {
    const prompt = pixarPreset.template({
      title: 'React Hooks',
      summary: 'Learn useState and useEffect'
    })

    expect(prompt).toContain('Learn useState and useEffect')
  })

  it('should truncate long summaries to 100 characters', () => {
    const longSummary = 'A'.repeat(200)
    const prompt = pixarPreset.template({
      title: 'Test',
      summary: longSummary
    })

    expect(prompt).not.toContain('A'.repeat(200))
    expect(prompt).toContain('A'.repeat(100))
  })

  it('should have correct preset name', () => {
    expect(pixarPreset.name).toBe('pixar-3d')
  })
})

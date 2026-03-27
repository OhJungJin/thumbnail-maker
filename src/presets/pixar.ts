import type { CustomStyle, PromptOptions } from '../core/types'

/**
 * Pixar 3D animation style preset
 * Creates cute, colorful 3D rendered images in Pixar movie style
 */
export const pixarPreset: CustomStyle = {
  name: 'pixar-3d',
  template: (options: PromptOptions): string => {
    const summaryContext = options.summary
      ? `Context: ${options.summary.substring(0, 100)}`
      : ''

    return `Cute 3D Pixar animation style illustration about "${options.title}".
Bright warm colors, soft lighting, high quality render, professional CGI,
Pixar movie style, playful and friendly atmosphere,
${summaryContext}`.trim()
  }
}

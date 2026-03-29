import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import type {
  ThumbnailConfig,
  GenerateOptions,
  GenerateResult,
  CustomStyle,
  ImageSize
} from './types'
import { FalProvider } from '../providers/fal'
import { getPreset, isValidPreset } from '../presets'
import { downloadImage } from '../utils/download'

const DEFAULT_IMAGE_SIZE: ImageSize = { width: 1200, height: 630 }

/**
 * Main class for generating AI thumbnails
 */
export class ThumbnailGenerator {
  private provider: FalProvider
  private style: CustomStyle
  private imageSize: ImageSize
  private outputDir: string
  private cache: boolean
  private providerName: string

  constructor(config: ThumbnailConfig) {
    this.providerName = config.provider
    this.provider = new FalProvider(config.apiKey)
    this.imageSize = config.imageSize ?? DEFAULT_IMAGE_SIZE
    this.outputDir = config.outputDir
    this.cache = config.cache ?? true

    // Resolve style
    if (typeof config.style === 'string') {
      if (!isValidPreset(config.style)) {
        throw new Error(`Unknown style preset: ${config.style}`)
      }
      const preset = getPreset(config.style)
      if (!preset) {
        throw new Error(`Failed to load preset: ${config.style}`)
      }
      this.style = preset
    } else {
      this.style = config.style
    }
  }

  /**
   * Generate a single thumbnail
   */
  async generate(options: GenerateOptions): Promise<GenerateResult> {
    const outputPath = join(this.outputDir, options.slug, 'thumbnail.png')
    const urlPath = `/${options.slug}/thumbnail.png`

    // Check cache
    if (this.cache && existsSync(outputPath)) {
      return {
        path: outputPath,
        url: urlPath,
        cached: true,
        provider: this.providerName,
        style: this.style.name
      }
    }

    // Generate prompt
    const prompt = this.style.template({
      title: options.title,
      summary: options.summary,
      tags: options.tags
    })

    // Call provider
    const response = await this.provider.generate({
      prompt,
      imageSize: this.imageSize
    })

    // Download image
    const imageBuffer = await downloadImage(response.imageUrl)
    if (!imageBuffer) {
      throw new Error('Failed to download generated image')
    }

    // Save to disk
    const outputDir = join(this.outputDir, options.slug)
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true })
    }
    writeFileSync(outputPath, imageBuffer)

    return {
      path: outputPath,
      url: urlPath,
      cached: false,
      provider: this.providerName,
      style: this.style.name
    }
  }
}

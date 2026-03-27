/**
 * Configuration for ThumbnailGenerator
 */
export interface ThumbnailConfig {
  /** AI provider to use */
  provider: 'fal'
  /** API key for the provider */
  apiKey: string
  /** Style preset name or custom style */
  style: StylePreset | CustomStyle
  /** Output image dimensions */
  imageSize?: ImageSize
  /** Directory to save generated images */
  outputDir: string
  /** Skip generation if file exists (default: true) */
  cache?: boolean
  /** Provider-specific options */
  providerOptions?: FalProviderOptions
}

/**
 * Built-in style preset names
 */
export type StylePreset = 'pixar-3d' | 'watercolor' | 'illustration' | 'minimal'

/**
 * Custom style definition
 */
export interface CustomStyle {
  name: string
  template: (options: PromptOptions) => string
}

/**
 * Options passed to prompt template
 */
export interface PromptOptions {
  title: string
  summary?: string
  tags?: string[]
}

/**
 * Image dimensions
 */
export interface ImageSize {
  width: number
  height: number
}

/**
 * Options for generating a single thumbnail
 */
export interface GenerateOptions {
  /** Main title for the thumbnail */
  title: string
  /** Optional summary/description */
  summary?: string
  /** URL-safe identifier (used for filename) */
  slug: string
  /** Optional tags for context */
  tags?: string[]
}

/**
 * Result of thumbnail generation
 */
export interface GenerateResult {
  /** Absolute file path */
  path: string
  /** Web-accessible path */
  url: string
  /** Whether image was from cache */
  cached: boolean
  /** Provider used */
  provider: string
  /** Style applied */
  style: string
}

/**
 * Fal.ai specific options
 */
export interface FalProviderOptions {
  /** Number of inference steps (default: 28) */
  num_inference_steps?: number
  /** Prompt adherence (default: 3.5) */
  guidance_scale?: number
  /** Safety filter tolerance (default: '2') */
  safety_tolerance?: string
}

/**
 * Provider generate request
 */
export interface ProviderGenerateRequest {
  prompt: string
  imageSize: ImageSize
  options?: FalProviderOptions
}

/**
 * Provider generate response
 */
export interface ProviderGenerateResponse {
  imageUrl: string
}

/**
 * Fal.ai API response structure
 */
export interface FalApiResponse {
  images: Array<{ url: string }>
}

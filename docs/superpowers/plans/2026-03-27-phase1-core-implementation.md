# Phase 1: Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement core thumbnail generation functionality with Fal.ai provider and Pixar 3D style preset.

**Architecture:** Provider abstraction pattern with pluggable providers and style presets. ThumbnailGenerator class orchestrates generation workflow, delegates to provider for API calls, and handles caching/file operations.

**Tech Stack:** TypeScript, tsup (build), Vitest (test), Node.js native fetch

---

## File Structure

```
src/
├── index.ts                    # Public exports
├── core/
│   ├── types.ts                # All TypeScript interfaces
│   └── generator.ts            # ThumbnailGenerator class
├── providers/
│   ├── base.ts                 # BaseProvider with retry logic
│   └── fal.ts                  # FalProvider implementation
├── presets/
│   ├── index.ts                # Preset registry
│   └── pixar.ts                # Pixar 3D prompt template
└── utils/
    └── download.ts             # Image download utility

tests/
├── generator.test.ts           # Generator unit tests
├── providers/
│   └── fal.test.ts             # Fal provider tests
└── presets/
    └── pixar.test.ts           # Preset tests
```

---

## Task 1: Type Definitions

**Files:**
- Create: `src/core/types.ts`

- [ ] **Step 1: Create types file with all interfaces**

```typescript
// src/core/types.ts

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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors (may warn about missing src/index.ts, that's OK)

- [ ] **Step 3: Commit**

```bash
git add src/core/types.ts
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 2: Pixar Preset

**Files:**
- Create: `src/presets/pixar.ts`
- Create: `tests/presets/pixar.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/presets/pixar.test.ts
import { describe, it, expect } from 'vitest'
import { pixarPreset } from '../src/presets/pixar'

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/presets/pixar.test.ts`
Expected: FAIL - Cannot find module '../src/presets/pixar'

- [ ] **Step 3: Create pixar preset implementation**

```typescript
// src/presets/pixar.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/presets/pixar.test.ts`
Expected: PASS - All 4 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/presets/pixar.ts tests/presets/pixar.test.ts
git commit -m "feat: add pixar-3d preset"
```

---

## Task 3: Preset Registry

**Files:**
- Create: `src/presets/index.ts`
- Create: `tests/presets/registry.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/presets/registry.test.ts
import { describe, it, expect } from 'vitest'
import { getPreset, isValidPreset } from '../src/presets'

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/presets/registry.test.ts`
Expected: FAIL - Cannot find module '../src/presets'

- [ ] **Step 3: Create preset registry**

```typescript
// src/presets/index.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/presets/registry.test.ts`
Expected: PASS - All 4 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/presets/index.ts tests/presets/registry.test.ts
git commit -m "feat: add preset registry"
```

---

## Task 4: Download Utility

**Files:**
- Create: `src/utils/download.ts`
- Create: `tests/utils/download.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/utils/download.test.ts
import { describe, it, expect, vi } from 'vitest'
import { downloadImage } from '../src/utils/download'

describe('downloadImage', () => {
  it('should download image and return buffer', async () => {
    const mockImageData = new Uint8Array([0x89, 0x50, 0x4E, 0x47]) // PNG header

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(mockImageData.buffer)
    })

    const result = await downloadImage('https://example.com/image.png')

    expect(result).toBeInstanceOf(Buffer)
    expect(result?.length).toBe(4)
  })

  it('should return null on fetch failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404
    })

    const result = await downloadImage('https://example.com/not-found.png')

    expect(result).toBeNull()
  })

  it('should return null on network error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const result = await downloadImage('https://example.com/image.png')

    expect(result).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/utils/download.test.ts`
Expected: FAIL - Cannot find module '../src/utils/download'

- [ ] **Step 3: Create download utility**

```typescript
// src/utils/download.ts

/**
 * Download an image from URL and return as Buffer
 * @param url - URL of the image to download
 * @returns Buffer containing image data, or null on failure
 */
export async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch {
    return null
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/utils/download.test.ts`
Expected: PASS - All 3 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/utils/download.ts tests/utils/download.test.ts
git commit -m "feat: add image download utility"
```

---

## Task 5: Base Provider

**Files:**
- Create: `src/providers/base.ts`
- Create: `tests/providers/base.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/providers/base.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BaseProvider } from '../src/providers/base'
import type { ProviderGenerateRequest, ProviderGenerateResponse } from '../src/core/types'

class TestProvider extends BaseProvider {
  public callCount = 0

  protected async doGenerate(request: ProviderGenerateRequest): Promise<ProviderGenerateResponse> {
    this.callCount++
    if (this.callCount < 3) {
      throw new Error('Transient error')
    }
    return { imageUrl: 'https://example.com/image.png' }
  }
}

class FailingProvider extends BaseProvider {
  protected async doGenerate(): Promise<ProviderGenerateResponse> {
    throw new Error('Permanent failure')
  }
}

describe('BaseProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should retry on transient failures', async () => {
    const provider = new TestProvider('test-key')

    const generatePromise = provider.generate({
      prompt: 'test',
      imageSize: { width: 1200, height: 630 }
    })

    // Fast-forward through retry delays
    await vi.runAllTimersAsync()

    const result = await generatePromise
    expect(result.imageUrl).toBe('https://example.com/image.png')
    expect(provider.callCount).toBe(3)
  })

  it('should throw after max retries', async () => {
    const provider = new FailingProvider('test-key', { maxRetries: 2 })

    const generatePromise = provider.generate({
      prompt: 'test',
      imageSize: { width: 1200, height: 630 }
    })

    await vi.runAllTimersAsync()

    await expect(generatePromise).rejects.toThrow('Permanent failure')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/providers/base.test.ts`
Expected: FAIL - Cannot find module '../src/providers/base'

- [ ] **Step 3: Create base provider with retry logic**

```typescript
// src/providers/base.ts
import type { ProviderGenerateRequest, ProviderGenerateResponse } from '../core/types'

export interface BaseProviderOptions {
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number
  /** Initial retry delay in ms (default: 1000) */
  retryDelay?: number
}

/**
 * Abstract base class for AI image providers
 * Implements retry logic with exponential backoff
 */
export abstract class BaseProvider {
  protected apiKey: string
  protected maxRetries: number
  protected retryDelay: number

  constructor(apiKey: string, options: BaseProviderOptions = {}) {
    this.apiKey = apiKey
    this.maxRetries = options.maxRetries ?? 3
    this.retryDelay = options.retryDelay ?? 1000
  }

  /**
   * Generate an image with retry logic
   */
  async generate(request: ProviderGenerateRequest): Promise<ProviderGenerateResponse> {
    let lastError: Error | undefined

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.doGenerate(request)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1)
          await this.sleep(delay)
        }
      }
    }

    throw lastError
  }

  /**
   * Provider-specific implementation
   */
  protected abstract doGenerate(request: ProviderGenerateRequest): Promise<ProviderGenerateResponse>

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/providers/base.test.ts`
Expected: PASS - All 2 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/providers/base.ts tests/providers/base.test.ts
git commit -m "feat: add base provider with retry logic"
```

---

## Task 6: Fal Provider

**Files:**
- Create: `src/providers/fal.ts`
- Create: `tests/providers/fal.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/providers/fal.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FalProvider } from '../src/providers/fal'

describe('FalProvider', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.useRealTimers()
  })

  it('should call Fal.ai API with correct parameters', async () => {
    const mockResponse = {
      images: [{ url: 'https://fal.ai/generated/image.png' }]
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const provider = new FalProvider('test-api-key')
    const result = await provider.generate({
      prompt: 'A cute cat',
      imageSize: { width: 1200, height: 630 }
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'https://fal.run/fal-ai/flux-pro/v1.1',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'Key test-api-key',
          'Content-Type': 'application/json'
        }
      })
    )

    const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body)
    expect(callBody.prompt).toBe('A cute cat')
    expect(callBody.image_size).toEqual({ width: 1200, height: 630 })
    expect(callBody.num_images).toBe(1)

    expect(result.imageUrl).toBe('https://fal.ai/generated/image.png')
  })

  it('should use custom provider options', async () => {
    const mockResponse = {
      images: [{ url: 'https://fal.ai/generated/image.png' }]
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const provider = new FalProvider('test-api-key')
    await provider.generate({
      prompt: 'A cute cat',
      imageSize: { width: 800, height: 600 },
      options: {
        num_inference_steps: 50,
        guidance_scale: 5.0,
        safety_tolerance: '3'
      }
    })

    const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body)
    expect(callBody.num_inference_steps).toBe(50)
    expect(callBody.guidance_scale).toBe(5.0)
    expect(callBody.safety_tolerance).toBe('3')
  })

  it('should throw on API error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401
    })

    const provider = new FalProvider('invalid-key', { maxRetries: 1 })

    await expect(
      provider.generate({
        prompt: 'test',
        imageSize: { width: 1200, height: 630 }
      })
    ).rejects.toThrow('Fal.ai API error: 401')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/providers/fal.test.ts`
Expected: FAIL - Cannot find module '../src/providers/fal'

- [ ] **Step 3: Create Fal provider implementation**

```typescript
// src/providers/fal.ts
import { BaseProvider, type BaseProviderOptions } from './base'
import type {
  ProviderGenerateRequest,
  ProviderGenerateResponse,
  FalApiResponse
} from '../core/types'

const FAL_API_URL = 'https://fal.run/fal-ai/flux-pro/v1.1'

/**
 * Fal.ai FLUX Pro v1.1 provider
 */
export class FalProvider extends BaseProvider {
  constructor(apiKey: string, options?: BaseProviderOptions) {
    super(apiKey, options)
  }

  protected async doGenerate(request: ProviderGenerateRequest): Promise<ProviderGenerateResponse> {
    const response = await fetch(FAL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: request.prompt,
        image_size: request.imageSize,
        num_inference_steps: request.options?.num_inference_steps ?? 28,
        guidance_scale: request.options?.guidance_scale ?? 3.5,
        num_images: 1,
        safety_tolerance: request.options?.safety_tolerance ?? '2'
      })
    })

    if (!response.ok) {
      throw new Error(`Fal.ai API error: ${response.status}`)
    }

    const data = await response.json() as FalApiResponse
    return {
      imageUrl: data.images[0].url
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/providers/fal.test.ts`
Expected: PASS - All 3 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/providers/fal.ts tests/providers/fal.test.ts
git commit -m "feat: add Fal.ai provider"
```

---

## Task 7: Thumbnail Generator

**Files:**
- Create: `src/core/generator.ts`
- Create: `tests/generator.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/generator.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ThumbnailGenerator } from '../src/core/generator'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn()
}))

describe('ThumbnailGenerator', () => {
  const mockFetch = vi.fn()
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = mockFetch
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('should generate thumbnail with correct prompt', async () => {
    vi.mocked(existsSync).mockReturnValue(false)

    mockFetch
      // Fal.ai API call
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          images: [{ url: 'https://fal.ai/image.png' }]
        })
      })
      // Image download
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(new Uint8Array([0x89, 0x50, 0x4E, 0x47]).buffer)
      })

    const generator = new ThumbnailGenerator({
      provider: 'fal',
      apiKey: 'test-key',
      style: 'pixar-3d',
      outputDir: '/tmp/images'
    })

    const result = await generator.generate({
      title: 'React Hooks Guide',
      slug: 'react-hooks-guide'
    })

    expect(result.path).toBe('/tmp/images/react-hooks-guide/thumbnail.png')
    expect(result.url).toBe('/react-hooks-guide/thumbnail.png')
    expect(result.cached).toBe(false)
    expect(result.provider).toBe('fal')
    expect(result.style).toBe('pixar-3d')

    // Verify Fal.ai was called with Pixar prompt
    const falCall = mockFetch.mock.calls[0]
    const body = JSON.parse(falCall[1].body)
    expect(body.prompt).toContain('React Hooks Guide')
    expect(body.prompt).toContain('Pixar')
  })

  it('should return cached result when file exists', async () => {
    vi.mocked(existsSync).mockReturnValue(true)

    const generator = new ThumbnailGenerator({
      provider: 'fal',
      apiKey: 'test-key',
      style: 'pixar-3d',
      outputDir: '/tmp/images'
    })

    const result = await generator.generate({
      title: 'Cached Post',
      slug: 'cached-post'
    })

    expect(result.cached).toBe(true)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should skip cache when cache option is false', async () => {
    vi.mocked(existsSync).mockReturnValue(true)

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          images: [{ url: 'https://fal.ai/image.png' }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(new Uint8Array([0x89, 0x50, 0x4E, 0x47]).buffer)
      })

    const generator = new ThumbnailGenerator({
      provider: 'fal',
      apiKey: 'test-key',
      style: 'pixar-3d',
      outputDir: '/tmp/images',
      cache: false
    })

    const result = await generator.generate({
      title: 'Force Regenerate',
      slug: 'force-regenerate'
    })

    expect(result.cached).toBe(false)
    expect(mockFetch).toHaveBeenCalled()
  })

  it('should use custom style template', async () => {
    vi.mocked(existsSync).mockReturnValue(false)

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          images: [{ url: 'https://fal.ai/image.png' }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(new Uint8Array([0x89, 0x50, 0x4E, 0x47]).buffer)
      })

    const generator = new ThumbnailGenerator({
      provider: 'fal',
      apiKey: 'test-key',
      style: {
        name: 'custom',
        template: (opts) => `Custom style: ${opts.title}`
      },
      outputDir: '/tmp/images'
    })

    await generator.generate({
      title: 'Custom Post',
      slug: 'custom-post'
    })

    const falCall = mockFetch.mock.calls[0]
    const body = JSON.parse(falCall[1].body)
    expect(body.prompt).toBe('Custom style: Custom Post')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/generator.test.ts`
Expected: FAIL - Cannot find module '../src/core/generator'

- [ ] **Step 3: Create generator implementation**

```typescript
// src/core/generator.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/generator.test.ts`
Expected: PASS - All 4 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/core/generator.ts tests/generator.test.ts
git commit -m "feat: add ThumbnailGenerator class"
```

---

## Task 8: Main Exports

**Files:**
- Create: `src/index.ts`

- [ ] **Step 1: Create main export file**

```typescript
// src/index.ts

// Core
export { ThumbnailGenerator } from './core/generator'

// Types
export type {
  ThumbnailConfig,
  GenerateOptions,
  GenerateResult,
  StylePreset,
  CustomStyle,
  PromptOptions,
  ImageSize,
  FalProviderOptions
} from './core/types'

// Presets
export { getPreset, isValidPreset, pixarPreset } from './presets'
```

- [ ] **Step 2: Verify build works**

Run: `npm run build`
Expected: Build succeeds, creates dist/ with index.js, index.mjs, index.d.ts

- [ ] **Step 3: Run all tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/index.ts
git commit -m "feat: add main exports"
```

---

## Task 9: CLI Stub

**Files:**
- Create: `src/cli.ts`

- [ ] **Step 1: Create minimal CLI stub**

```typescript
// src/cli.ts
import { Command } from 'commander'

const program = new Command()

program
  .name('ai-thumbnail')
  .description('AI-powered thumbnail generator')
  .version('0.1.0')

program
  .command('generate')
  .description('Generate a thumbnail')
  .requiredOption('--title <title>', 'Title for the thumbnail')
  .requiredOption('--slug <slug>', 'URL slug (used for filename)')
  .option('--provider <provider>', 'AI provider', 'fal')
  .option('--api-key <key>', 'API key (or set FAL_API_KEY env var)')
  .option('--style <style>', 'Style preset', 'pixar-3d')
  .option('--output <dir>', 'Output directory', './public/images')
  .option('--summary <summary>', 'Optional summary')
  .action(async (options) => {
    const { ThumbnailGenerator } = await import('./index')

    const apiKey = options.apiKey || process.env.FAL_API_KEY
    if (!apiKey) {
      console.error('Error: API key required. Use --api-key or set FAL_API_KEY')
      process.exit(1)
    }

    const generator = new ThumbnailGenerator({
      provider: options.provider,
      apiKey,
      style: options.style,
      outputDir: options.output
    })

    try {
      const result = await generator.generate({
        title: options.title,
        slug: options.slug,
        summary: options.summary
      })

      console.log(`Thumbnail generated: ${result.path}`)
      console.log(`URL: ${result.url}`)
      console.log(`Cached: ${result.cached}`)
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

program.parse()
```

- [ ] **Step 2: Verify build includes CLI**

Run: `npm run build`
Expected: dist/cli.js and dist/cli.mjs created with shebang

- [ ] **Step 3: Test CLI help**

Run: `node dist/cli.js --help`
Expected: Shows help with generate command

- [ ] **Step 4: Commit**

```bash
git add src/cli.ts
git commit -m "feat: add CLI stub"
```

---

## Task 10: Vitest Configuration

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Create vitest config**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/cli.ts']
    }
  }
})
```

- [ ] **Step 2: Run all tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add vitest.config.ts
git commit -m "chore: add vitest configuration"
```

---

## Task 11: Final Verification

**Files:** None (verification only)

- [ ] **Step 1: Clean build**

Run: `rm -rf dist && npm run build`
Expected: Build succeeds

- [ ] **Step 2: Type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run all tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 4: Test CLI**

Run: `node dist/cli.js generate --help`
Expected: Shows generate command options

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: Phase 1 complete - core functionality"
```

---

## Summary

Phase 1 delivers:
- TypeScript type definitions
- Pixar 3D preset with prompt template
- Preset registry (extensible for future presets)
- Image download utility
- Base provider with retry logic
- Fal.ai provider implementation
- ThumbnailGenerator class
- CLI stub
- Unit tests for all components

Next: Phase 1.5 (Monorepo conversion + demo site scaffolding)

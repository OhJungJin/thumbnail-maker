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

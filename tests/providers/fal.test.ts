import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FalProvider } from '../../src/providers/fal'

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

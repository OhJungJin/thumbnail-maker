import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BaseProvider } from '../../src/providers/base'
import type { ProviderGenerateRequest, ProviderGenerateResponse } from '../../src/core/types'

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

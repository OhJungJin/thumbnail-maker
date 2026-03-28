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

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

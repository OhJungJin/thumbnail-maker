import { describe, it, expect, vi } from 'vitest'
import { downloadImage } from '../../src/utils/download'

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

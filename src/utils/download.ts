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

# @rodang/thumbnail-maker

> AI-powered thumbnail generator for blogs, CMS, and content platforms

Generate beautiful, consistent thumbnails using AI image generation APIs. Designed for Notion blogs, static site generators, and any content platform that needs automated thumbnail creation.

## Features

- 🎨 **Multiple Style Presets**: Pixar 3D, Watercolor, Illustration, Minimal
- 🔌 **Multi-Provider Support**: Fal.ai FLUX Pro (more coming soon)
- 🚀 **CLI & Programmatic API**: Use from command line or Node.js code
- 💾 **Smart Caching**: Avoid regenerating existing thumbnails
- ⚡ **Batch Processing**: Generate multiple thumbnails concurrently
- 📦 **TypeScript First**: Full type definitions included
- 🎯 **SEO Optimized**: Default 1200x630 size for social media

## Installation

```bash
# As a dependency
npm install @rodang/thumbnail-maker

# Global CLI
npm install -g @rodang/thumbnail-maker
```

## Quick Start

### Programmatic Usage

```javascript
import { ThumbnailGenerator } from '@rodang/thumbnail-maker'

const generator = new ThumbnailGenerator({
  provider: 'fal',
  apiKey: process.env.FAL_API_KEY,
  style: 'pixar-3d',
  outputDir: './public/images'
})

const result = await generator.generate({
  title: 'Getting Started with React Hooks',
  summary: 'Learn how to use useState and useEffect',
  slug: 'react-hooks-guide',
  tags: ['React', 'JavaScript']
})

console.log(result.path)  // ./public/images/react-hooks-guide/thumbnail.png
console.log(result.url)   // /images/react-hooks-guide/thumbnail.png
```

### CLI Usage

```bash
ai-thumbnail generate \
  --provider fal \
  --api-key $FAL_API_KEY \
  --title "My Blog Post" \
  --slug "my-blog-post" \
  --style pixar-3d \
  --output ./public/images
```

## API Reference

### ThumbnailGenerator

#### Constructor Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `provider` | `'fal'` | ✅ | - | AI provider to use |
| `apiKey` | `string` | ✅ | - | API key for the provider |
| `style` | `StylePreset \| CustomStyle` | ✅ | - | Preset name or custom template |
| `imageSize` | `{ width, height }` | ❌ | `{ width: 1200, height: 630 }` | Output image dimensions |
| `outputDir` | `string` | ✅ | - | Directory to save images |
| `cache` | `boolean` | ❌ | `true` | Skip generation if file exists |
| `providerOptions` | `object` | ❌ | `{}` | Provider-specific options |

#### Methods

##### `generate(options: GenerateOptions): Promise<GenerateResult>`

Generate a single thumbnail.

**Parameters**:
```typescript
interface GenerateOptions {
  title: string       // Main title for the thumbnail
  summary?: string    // Optional summary/description
  slug: string        // URL-safe identifier (used for filename)
  tags?: string[]     // Optional tags for context
}
```

**Returns**:
```typescript
interface GenerateResult {
  path: string        // Absolute file path
  url: string         // Web-accessible path
  cached: boolean     // Whether image was cached
  provider: string    // Provider used
  style: string       // Style applied
}
```

##### `generateBatch(items: GenerateOptions[], options?: BatchOptions): Promise<GenerateResult[]>`

Generate multiple thumbnails with concurrency control.

**Parameters**:
```typescript
interface BatchOptions {
  concurrency?: number          // Max concurrent requests (default: 3)
  skipExisting?: boolean        // Skip if file exists (default: true)
  onProgress?: (completed: number, total: number) => void
}
```

## Style Presets

### Built-in Presets

1. **`pixar-3d`**: Cute 3D Pixar animation style with warm colors
2. **`watercolor`**: Soft watercolor painting style
3. **`illustration`**: Modern illustration with clean lines
4. **`minimal`**: Minimalist geometric design

### Custom Styles

```javascript
const generator = new ThumbnailGenerator({
  provider: 'fal',
  apiKey: process.env.FAL_API_KEY,
  style: {
    name: 'cyberpunk',
    template: (options) =>
      `Cyberpunk neon style illustration about "${options.title}".
       Dark background, bright neon colors, futuristic, high-tech.`
  },
  outputDir: './public/images'
})
```

## Providers

### Fal.ai (FLUX Pro v1.1)

**Setup**:
1. Get API key from [fal.ai](https://fal.ai)
2. Set `FAL_API_KEY` environment variable

**Cost**: ~$0.003 per image

**Provider Options**:
```javascript
{
  provider: 'fal',
  apiKey: process.env.FAL_API_KEY,
  providerOptions: {
    num_inference_steps: 28,      // Generation steps (default: 28)
    guidance_scale: 3.5,           // Prompt adherence (default: 3.5)
    safety_tolerance: '2'          // Safety filter (default: '2')
  }
}
```

## Examples

### Notion Blog Integration

```javascript
import { ThumbnailGenerator } from '@rodang/thumbnail-maker'

const generator = new ThumbnailGenerator({
  provider: 'fal',
  apiKey: process.env.FAL_API_KEY,
  style: 'pixar-3d',
  outputDir: './public/images/blog'
})

// In your Notion sync script
async function syncPost(notionPage) {
  const images = notionPage.images || []

  // Generate AI thumbnail if no images
  if (images.length === 0) {
    const result = await generator.generate({
      title: notionPage.title,
      summary: notionPage.summary,
      slug: notionPage.slug,
      tags: notionPage.tags
    })

    images.push(result.url)
  }

  return { ...notionPage, images }
}
```

### Batch Processing

```javascript
const posts = [
  { title: 'Post 1', slug: 'post-1' },
  { title: 'Post 2', slug: 'post-2' },
  { title: 'Post 3', slug: 'post-3' }
]

const results = await generator.generateBatch(posts, {
  concurrency: 2,
  onProgress: (completed, total) => {
    console.log(`Progress: ${completed}/${total}`)
  }
})
```

## CLI Reference

```bash
ai-thumbnail generate [options]

Options:
  --provider <provider>   AI provider (default: "fal")
  --api-key <key>        API key
  --title <title>        Title for the thumbnail
  --summary <summary>    Optional summary
  --slug <slug>          URL slug (used for filename)
  --tags <tags>          Comma-separated tags
  --style <style>        Style preset (default: "pixar-3d")
  --output <dir>         Output directory (default: "./public/images")
  --config <path>        Config file path
  -h, --help            Display help
```

### Config File

Create `thumbnail.config.js`:

```javascript
export default {
  provider: 'fal',
  apiKey: process.env.FAL_API_KEY,
  style: 'pixar-3d',
  imageSize: { width: 1200, height: 630 },
  outputDir: './public/images',
  cache: true
}
```

Use with CLI:

```bash
ai-thumbnail generate --config ./thumbnail.config.js --title "My Post" --slug "my-post"
```

## Requirements

- Node.js >= 18.0.0
- API key for chosen provider (Fal.ai, etc.)

## License

MIT © Rodang

## Contributing

Contributions welcome! Please open an issue or PR.

## Roadmap

- [ ] DALL-E 3 provider
- [ ] Replicate FLUX provider
- [ ] Image post-processing (watermarks, overlays)
- [ ] More style presets
- [ ] Text overlay support

---

**For detailed implementation roadmap, see [PLAN.md](./PLAN.md)**

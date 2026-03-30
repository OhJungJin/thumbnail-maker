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

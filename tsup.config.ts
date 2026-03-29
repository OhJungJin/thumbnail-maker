import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts'
  },
  format: ['cjs', 'esm'],
  dts: {
    entry: 'src/index.ts'
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: true,
  esbuildOptions: (options, context) => {
    if (context.format === 'esm') {
      options.banner = options.banner || {}
      options.banner.js = '#!/usr/bin/env node\n'
    }
  }
})

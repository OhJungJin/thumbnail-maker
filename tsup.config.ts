import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts'
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: true,
  banner: {
    js: (context) => {
      if (context.format === 'esm' && context.path.includes('cli')) {
        return '#!/usr/bin/env node\n'
      }
      return ''
    }
  }
})

# @rodang/thumbnail-maker - Implementation Plan

## Project Status

**Current Phase**: Phase 0 (Initial Setup) ✅
**Version**: 0.1.0 (Pre-release)
**Last Updated**: 2026-03-23

---

## Overview

This package extracts and enhances the AI thumbnail generation functionality from the `rodang-blog` project, transforming it into a reusable npm package with enterprise-grade features.

### Original Implementation

**Source**: `/Users/jungjin/Documents/code/rodang-blog/scripts/sync-notion.mjs` (lines 173-234)

**Current Limitations**:
- Hardcoded Fal.ai provider (no alternatives)
- Single Pixar 3D style (no customization)
- No retry logic for API failures
- Basic caching (file existence check only)
- Embedded in sync script (not reusable)
- No TypeScript types

### Goals

Transform the inline implementation into a production-ready package with:

1. **Multi-Provider Architecture**: Support Fal.ai, DALL-E, Replicate
2. **Style System**: Multiple presets + custom templates
3. **Robust Error Handling**: Retry logic, detailed errors
4. **Developer Experience**: TypeScript, CLI, comprehensive docs
5. **Production Ready**: Testing, caching, batch processing

---

## Architecture

### Core Principles

1. **Provider Abstraction**: Plugin-style provider system
2. **Preset Registry**: Extensible style system
3. **Type Safety**: Full TypeScript coverage
4. **Zero Breaking Changes**: Maintain backward compatibility
5. **Progressive Enhancement**: Add features without complexity

### Component Diagram

```
┌─────────────────────────────────────────────┐
│           ThumbnailGenerator                │
│  (Orchestrates generation workflow)         │
└────────────┬────────────────────────────────┘
             │
             ├──> ProviderInterface
             │    ├── FalProvider (Phase 1)
             │    ├── DalleProvider (Phase 3)
             │    └── ReplicateProvider (Phase 3)
             │
             ├──> Preset Registry
             │    ├── pixar-3d (Phase 1)
             │    ├── watercolor (Phase 2)
             │    ├── illustration (Phase 2)
             │    └── minimal (Phase 2)
             │
             └──> Utilities
                  ├── download (Image fetching)
                  └── prompt (Prompt building)
```

---

## Implementation Phases

### Phase 0: Project Initialization ✅ **COMPLETE**

**Objective**: Set up development environment and repository

**Completed Tasks**:
- ✅ Create project directory `/Users/jungjin/Documents/code/thumbnail-maker`
- ✅ Initialize npm package (`npm init`)
- ✅ Create initial file structure
- ✅ Set up TypeScript configuration
- ✅ Configure tsup build system
- ✅ Create README.md (user documentation)
- ✅ Create PLAN.md (this file)
- ✅ Initialize git repository
- ✅ Create GitHub repository

**Deliverables**:
- GitHub repository with README and PLAN
- Local development environment ready
- No implementation code yet (documentation-first approach)

---

### Phase 1: Core Functionality (Fal.ai + Pixar) ⬅️ **NEXT**

**Objective**: Replicate existing rodang-blog functionality with better architecture

**Tasks**:

1. **Type Definitions** (`src/core/types.ts`)
   - Define all TypeScript interfaces
   - Export core types for consumers
   - Document type usage with JSDoc

2. **Base Provider** (`src/providers/base.ts`)
   - Abstract `BaseProvider` class
   - Retry logic with exponential backoff
   - Error handling utilities

3. **Fal.ai Provider** (`src/providers/fal.ts`)
   - Implement `FalProvider extends BaseProvider`
   - Match existing API call in sync-notion.mjs
   - Support configurable options (steps, guidance, etc.)

4. **Pixar Preset** (`src/presets/pixar.ts`)
   - Extract prompt template from sync-notion.mjs
   - Make it a reusable function
   - Add JSDoc documentation

5. **Preset Registry** (`src/presets/index.ts`)
   - Registry map for presets
   - `getPresetPrompt()` helper function

6. **Core Generator** (`src/core/generator.ts`)
   - `ThumbnailGenerator` class
   - `generate()` method (single image)
   - Caching logic (file existence check)
   - Image download utility
   - Directory creation

7. **Main Export** (`src/index.ts`)
   - Export `ThumbnailGenerator`
   - Export types
   - Export presets

**Success Criteria**:
- Can generate Pixar 3D thumbnails via API
- Caching works (skips existing files)
- TypeScript types compile correctly
- Matches behavior of original sync-notion.mjs code

**Testing**:
```javascript
import { ThumbnailGenerator } from './dist/index.js'

const gen = new ThumbnailGenerator({
  provider: 'fal',
  apiKey: process.env.FAL_API_KEY,
  style: 'pixar-3d',
  outputDir: './test-output'
})

await gen.generate({
  title: 'Test Post',
  slug: 'test-post'
})
```

---

### Phase 2: Enhanced Features

**Objective**: Add style presets, batch processing, and CLI

**Tasks**:

1. **Additional Presets**
   - `watercolor.ts`: Soft watercolor style
   - `illustration.ts`: Modern illustration style
   - `minimal.ts`: Minimalist geometric style
   - Update preset registry

2. **Batch Processing**
   - `generateBatch()` method
   - Concurrency control (limit parallel requests)
   - Progress callbacks
   - Error aggregation

3. **CLI Implementation** (`src/cli.ts`)
   - Use `commander` for argument parsing
   - `generate` command
   - Support `--config` file option
   - Proper error messages and help text

4. **Build Configuration**
   - Ensure CLI has shebang (`#!/usr/bin/env node`)
   - Test binary installation

**Success Criteria**:
- All 4 presets work
- Can generate 10+ thumbnails in batch
- CLI executable works globally
- Progress tracking works

**Testing**:
```bash
npm run build
./dist/cli.js generate --help
ai-thumbnail generate --provider fal --title "Test" --slug "test"
```

---

### Phase 3: Multi-Provider Support

**Objective**: Add DALL-E and Replicate providers

**Tasks**:

1. **DALL-E Provider** (`src/providers/dalle.ts`)
   - Implement OpenAI DALL-E 3 API
   - Handle different response format
   - Map options to DALL-E parameters

2. **Replicate Provider** (`src/providers/replicate.ts`)
   - Implement Replicate FLUX API
   - Handle prediction polling
   - Map options to Replicate parameters

3. **Provider Factory**
   - Update `initProvider()` in generator.ts
   - Add provider validation

**Success Criteria**:
- Can switch providers with config change
- Each provider generates valid images
- Error messages are provider-specific

---

### Phase 4: rodang-blog Integration

**Objective**: Replace inline code in rodang-blog with package

**Tasks**:

1. **Local Package Install**
   ```bash
   cd /Users/jungjin/Documents/code/rodang-blog
   npm install /Users/jungjin/Documents/code/thumbnail-maker
   ```

2. **Refactor sync-notion.mjs**
   - Import `ThumbnailGenerator`
   - Replace `generateAIThumbnail()` function (lines 173-234)
   - Verify caching behavior preserved
   - Test with actual Notion sync

3. **Integration Testing**
   ```bash
   cd /Users/jungjin/Documents/code/rodang-blog
   npm run sync-notion
   ```

**Success Criteria**:
- Notion sync still works
- Thumbnails generated with same quality
- Code is cleaner and more maintainable
- No regressions in rodang-blog

---

### Phase 5: Testing & Documentation

**Objective**: Production-ready quality assurance

**Tasks**:

1. **Unit Tests** (`tests/generator.test.ts`)
   - Mock provider responses
   - Test caching logic
   - Test batch processing
   - Test error handling

2. **Integration Tests**
   - Real API calls (with test API keys)
   - Verify all presets
   - Verify all providers

3. **Documentation**
   - JSDoc comments in all public APIs
   - Update README with examples
   - Create examples/ directory
     - `basic.js`
     - `rodang-blog.js`
     - `batch.js`

**Success Criteria**:
- Test coverage > 80%
- All examples run successfully
- Documentation is clear and complete

---

### Phase 6: npm Publication

**Objective**: Publish to npm registry

**Tasks**:

1. **Pre-publish Checklist**
   - Verify package.json metadata
   - Check all files in `files` array
   - Test installation from tarball
   - Ensure no secrets in code

2. **npm Account Setup**
   ```bash
   npm login
   ```

3. **Publish**
   ```bash
   npm publish --access public
   ```

4. **Verify Publication**
   - Install from npm: `npm install @rodang/thumbnail-maker`
   - Test in fresh project
   - Check npm page

**Success Criteria**:
- Package available on npm
- Can install globally and locally
- All features work from npm installation

---

### Phase 7: Advanced Features (Future)

**Objective**: Enhance beyond initial scope

**Potential Features**:

1. **Image Post-Processing**
   - Add watermarks
   - Apply overlays
   - Resize/crop

2. **Text Overlay Support**
   - Render title text on image
   - Custom fonts
   - Positioning options

3. **Caching Enhancements**
   - Hash-based cache keys
   - TTL/expiration
   - Cache storage options (disk, S3, etc.)

4. **More Presets**
   - Photography style
   - Abstract art
   - Comic book style
   - Vintage poster style

5. **Provider Features**
   - Model selection per provider
   - Cost tracking
   - Rate limiting

---

## Technical Specifications

### Dependencies

**Production**:
- `commander@^12.0.0` - CLI framework (only for CLI builds)

**Development**:
- `typescript@^5.9.2` - Type checking and compilation
- `tsup@^8.0.2` - Fast bundler for TypeScript
- `vitest@^1.3.1` - Testing framework
- `@types/node@^20.11.19` - Node.js type definitions

**Runtime** (Zero dependencies for library):
- Node.js >= 18.0.0 (native `fetch`)

### Build Outputs

```
dist/
├── index.js           # CJS library
├── index.mjs          # ESM library
├── index.d.ts         # TypeScript types
├── cli.js             # CJS CLI (with shebang)
├── cli.mjs            # ESM CLI (with shebang)
└── *.map              # Source maps
```

### API Design Principles

1. **Sensible Defaults**: Works with minimal configuration
2. **Progressive Disclosure**: Simple for basic use, powerful for advanced
3. **Type Safety**: Full TypeScript support
4. **Error Messages**: Clear, actionable error messages
5. **Performance**: Minimal overhead, efficient caching

---

## Migration Path for rodang-blog

### Before (Current State)

```javascript
// 60+ lines of inline code in sync-notion.mjs
async function generateAIThumbnail(title, summary, slug, imagesDir) {
  // Hardcoded Fal.ai API call
  // Hardcoded Pixar prompt
  // No retry logic
  // Basic caching
}
```

### After (With Package)

```javascript
// 3-line import and setup
import { ThumbnailGenerator } from '@rodang/thumbnail-maker'

const thumbnailGenerator = new ThumbnailGenerator({
  provider: 'fal',
  apiKey: process.env.FAL_API_KEY,
  style: 'pixar-3d',
  outputDir: join(__dirname, '../public/images/blog')
})

// 10-line function
async function generateAIThumbnail(title, summary, slug, imagesDir) {
  const result = await thumbnailGenerator.generate({ title, summary, slug })
  return result.url
}
```

**Benefits**:
- 47+ lines of code removed
- Reusable across projects
- Better error handling
- Type safety
- Testable
- Maintainable

---

## Cost Analysis

### API Costs (per image)

| Provider | Model | Cost |
|----------|-------|------|
| Fal.ai | FLUX Pro v1.1 | ~$0.003 |
| OpenAI | DALL-E 3 (HD) | ~$0.080 |
| Replicate | FLUX Schnell | ~$0.003 |

**Recommendation**: Fal.ai for production (low cost, high quality)

### Cost Savings from Caching

With caching enabled:
- First generation: $0.003
- Subsequent uses: $0 (cached)

For a blog with 100 posts:
- Without caching: $0.30
- With caching: $0.003 (only new posts)

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
describe('ThumbnailGenerator', () => {
  it('should initialize with valid config')
  it('should generate thumbnail with Fal provider')
  it('should use cache when available')
  it('should handle API errors gracefully')
  it('should generate batch thumbnails')
  it('should respect concurrency limits')
})

describe('Presets', () => {
  it('should generate pixar-3d prompt')
  it('should generate watercolor prompt')
  it('should accept custom templates')
})

describe('Providers', () => {
  it('should retry on transient failures')
  it('should throw on permanent failures')
  it('should handle rate limits')
})
```

### Integration Tests

```typescript
describe('Integration', () => {
  it('should generate real image from Fal.ai', { timeout: 30000 })
  it('should cache subsequent requests')
  it('should work with all presets')
})
```

### Manual Testing Checklist

- [ ] Install package locally in rodang-blog
- [ ] Run Notion sync with new package
- [ ] Verify thumbnails match previous quality
- [ ] Test with missing API key (error handling)
- [ ] Test with invalid slug (error handling)
- [ ] Test CLI installation globally
- [ ] Test CLI help messages
- [ ] Test batch processing with 10 posts

---

## Risk Assessment

### High Risk

1. **API Changes**: Fal.ai API could change
   - **Mitigation**: Version-lock API endpoints, add tests

2. **Rate Limiting**: Batch processing could hit limits
   - **Mitigation**: Concurrency control, retry logic

### Medium Risk

1. **Breaking Changes**: TypeScript interface changes
   - **Mitigation**: Semantic versioning, changelog

2. **Dependency Issues**: Node.js version incompatibility
   - **Mitigation**: Lock to Node 18+, test on multiple versions

### Low Risk

1. **Build Errors**: tsup configuration issues
   - **Mitigation**: Lock tsup version, test builds in CI

---

## Success Metrics

### Phase 1 Success
- ✅ Generates Pixar 3D thumbnails
- ✅ Caching works
- ✅ TypeScript compiles without errors
- ✅ Matches original behavior

### Final Success
- ✅ Published on npm
- ✅ Used in rodang-blog production
- ✅ Test coverage > 80%
- ✅ 3+ style presets
- ✅ CLI works globally
- ✅ Documentation complete

---

## Timeline

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0 | ✅ Complete | Setup and documentation |
| Phase 1 | ⏳ Next | Core functionality (Fal.ai + Pixar) |
| Phase 2 | 📋 Planned | Enhanced features (presets, batch, CLI) |
| Phase 3 | 📋 Planned | Multi-provider support |
| Phase 4 | 📋 Planned | rodang-blog integration |
| Phase 5 | 📋 Planned | Testing & documentation |
| Phase 6 | 📋 Planned | npm publication |

---

## Next Steps

After Phase 0 completion:

1. Review README and PLAN on GitHub
2. Get feedback from stakeholders
3. Proceed with Phase 1 implementation (core functionality)
4. Begin with type definitions and provider abstraction

---

## References

### Source Code
- **Original Implementation**: `/Users/jungjin/Documents/code/rodang-blog/scripts/sync-notion.mjs` (lines 173-234)
- **Target Integration**: Same file, refactored

### External Documentation
- [Fal.ai FLUX Pro API](https://fal.ai/models/fal-ai/flux-pro)
- [tsup Documentation](https://tsup.egoist.dev/)
- [Commander.js Guide](https://github.com/tj/commander.js)

---

**Phase 0 Status**: ✅ COMPLETE
**Next Phase**: Phase 1 - Core Functionality (Fal.ai + Pixar)

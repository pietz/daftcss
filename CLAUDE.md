# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Daft CSS is a semantic-first CSS framework with shadcn/ui-quality aesthetics. It styles raw HTML — no JavaScript, no required utility classes, no JSX components. Requires modern browsers (Chrome 123+, Firefox 129+, Safari 18+) for native support of `light-dark()`, OKLCH colors, CSS nesting, `color-mix()`, the Popover API, and `@starting-style`.

## Commands

```bash
npm run build    # Build daft.css/daft.min.css to dist/ and mirror to docs/dist/
npm run watch    # Watch src/ and rebuild dist/ only
npm run dev      # Serve docs/ folder locally (landing + examples)
```

## Architecture

### Build System

Uses `lightningcss-cli` directly (no custom build script). Entry point is `src/daft.css` which imports all partials using CSS `@import` with `@layer` for specificity management.

**Important:** Do NOT specify browser targets in the build command. Without targets, LightningCSS:
- Bundles and minifies only (no transforms)
- Preserves modern CSS like `light-dark()` as-is
- Keeps output small (~55KB vs larger transformed builds with polyfills)

If you add targets for older browsers, LightningCSS will inject `--lightningcss-light/dark` polyfill variables and expand every `light-dark()` call into verbose fallback patterns.

### CSS Layer Order

Layers are defined in `src/daft.css` and control cascade priority:
```
tokens → reset → base → layout → content → forms → components → slides → utilities
```

### Source Structure

- `src/base/` - Variables (design tokens), reset, root theme selection, document defaults
- `src/content/` - Typography, code blocks, embedded content (images, video)
- `src/layout/` - Container, grid, landmarks (header/main/footer), overflow
- `src/forms/` - Input, checkbox/radio/switch, range slider, validation states
- `src/components/` - Button, card, table, accordion, dropdown, modal, nav, progress, tooltip, group, badge, avatar, alert, sidebar, tree
- `src/slides/` - HTML-native presentation deck styles
- `src/utilities/` - Helper classes

**Utilities must not target bare HTML tags.** A selector like `a.something` or `button.something` in the utilities layer will override component variants of the same class (utilities sits after components in the cascade). If a tag-prefixed rule is needed, place it in `content/` or `base/` so the components layer can override it cleanly.

### Design Token System

Hierarchical system in `src/base/variables.css`:

1. **Core variables** - Control the entire design system:
   - `--spacing`, `--radius`, `--font-size-base`, `--component-height`
   - `--line-height`, `--transition`, `--font-sans`, `--font-mono`

2. **Derived variables** - Calculated from core:
   - `--spacing-xs`, `--spacing-sm`, `--spacing-lg`, `--spacing-xl`
   - `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`
   - `--text-xs` through `--text-4xl` (scale-based)
   - `--line-height-sm`, `--line-height-lg`

3. **Semantic tokens** - Colors and contextual values:
   - `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--border`

Theme switching uses `light-dark()` function with `color-scheme` property. Override via `data-theme="light|dark"` attribute.

### Key Patterns

- Semantic HTML styling without classes (buttons, inputs, tables work out of the box)
- Optional classes for variants: `.secondary`, `.outline`, `.ghost`, `.destructive`
- Role-based switches: `<input type="checkbox" role="switch">`
- Data attributes for features: `data-tooltip`, `data-placement`, `data-theme`

### Size Naming Convention

Daft uses two naming styles for sizes, mapped to two different shapes of API:

- **Component variants → full words.** When a component has a binary "is this bigger or smaller than default" toggle, use `.small` and `.large` (bare class = default). Examples: `.button.small`, `.badge.large`, `.avatar.small`. Reads naturally in HTML.
- **Utility & token scales → abbreviations.** When sizing expresses a multi-step t-shirt scale, use `-xs`, `-sm`, bare (= default), `-lg`, `-xl`, `-2xl`, …. Examples: `.text-sm`, `.rounded-lg`, `.shadow`, `--spacing-xs`. Words don't scale (`.text-extra-small` is unreadable).

When adding a new component or utility, pick the side based on shape, not aesthetic preference.

## Adding New Components or Features

When adding a new component or feature to the library:

1. **Create the CSS** in the appropriate `src/` directory
2. **Import it** in `src/daft.css` with the correct layer
3. **Update `docs/components/index.html`** with usage examples
4. **Update docs/reference surfaces** as needed: `README.md`, `DOCS.md`, `skills/daftcss/SKILL.md`, `skills/daftcss/REFERENCE.md`, and relevant `docs/examples/*`
5. **Run `npm run build`** to verify it compiles and mirror `dist/` to `docs/dist/`

## Deployment

- Website-only changes deploy through GitHub Pages when pushed to the repository. Do not publish npm or create a GitHub release for docs-only changes.
- Library releases publish to npm through GitHub Actions trusted publishing. Do not run `npm publish` locally.
- Do not commit, tag, push, publish, or create releases unless explicitly asked.

## Release & Publishing Process

When the user asks to publish a new version, follow these steps in order. Never skip steps or batch them without acknowledgement — each is a separate trust boundary.

### 1. Version bump

Update the version in these places (they must match):
- `package.json` → `"version": "x.y.z"`
- `package-lock.json` → root package version metadata
- `src/daft.css` → header comment `* Daft CSS vx.y.z`
- `docs/index.html` → footer version span (`v1.x.y`)
- `docs/**/*.html` → every `<link rel="stylesheet" href="/dist/daft.css?v=x.y.z">` cache-buster query

Keep `package.json` repository metadata present and exact:

```json
"repository": {
  "type": "git",
  "url": "https://github.com/pietz/daftcss"
}
```

npm provenance checks this URL against the GitHub Actions source repository.

The cache-buster bump is what guarantees the deployed landing pages pick up the new CSS immediately — without it, browsers (and the GH Pages edge cache) can serve a stale build for hours. Quick one-liner from the repo root:

```bash
grep -rl 'dist/daft.css?v=' docs | xargs sed -i '' "s|dist/daft.css?v=[0-9.]*|dist/daft.css?v=NEW_VERSION|g"
```

SemVer guidance for this project:
- **Patch (1.6.x)** — bug fixes, additive helpers, no behavior change for existing markup
- **Minor (1.x.0)** — new component, new utility class, behavior changes that aren't user-visible breaks
- **Major (x.0.0)** — removed classes, renamed selectors, changed default behavior that could break existing pages

### 2. Build

```bash
npm run build
```

Verify `dist/daft.css` and `dist/daft.min.css` regenerated. Check the minified size hasn't ballooned unexpectedly.

### 3. Visual smoke test

Run a quick check on `docs/index.html` or `docs/components/index.html` via `agent-browser` to catch regressions, especially for layout/grid/component changes.

### 4. Update documentation

Whenever the framework gains or loses a class, the following files must reflect it:
- `README.md` — Components section + Utility table
- `DOCS.md` — Components or Utilities sections
- `skills/daftcss/SKILL.md` — Component idioms (one-liners)
- `skills/daftcss/REFERENCE.md` — Component examples + utility lists

### 5. Git commit + tag + push

```bash
git add -A
git commit -m "vx.y.z - <one-line summary>

- <bullet>
- <bullet>"
git tag -a vx.y.z -m "vx.y.z"
git push origin main
git push origin vx.y.z
```

Never commit/push without explicit user request. Never amend a published commit — make a new one.

### 6. Publish to npm through GitHub Actions

Publishing is handled by `.github/workflows/release.yml` using npm Trusted Publishing and provenance. Do not publish from the local CLI.

When a `v*` tag is pushed, the `Release` workflow runs automatically. It checks out the tag, runs `npm ci`, runs `npm run build`, skips cleanly if the package version already exists on npm, and otherwise runs:

```bash
npm publish --provenance
```

For an already-pushed tag, trigger the workflow manually:

```bash
gh workflow run release.yml -f ref=vx.y.z
gh run watch --exit-status
```

Verify npm after the workflow:

```bash
npm view daftcss version
```

### 7. Create the GitHub Release

```bash
gh release create vx.y.z --title "vx.y.z — <short title>" --notes "$(cat <<'EOF'
## Highlights

- <bullet>
- <bullet>

## Changes

- <bullet>
EOF
)"
```

This is **easy to forget** — the npm publish does not create a GitHub release. Verify with `gh release list` afterward.

### Common mistakes

- Forgetting to bump `src/daft.css` header or `docs/index.html` version after `package.json`
- Forgetting `package.json.repository.url` — npm provenance will reject trusted publishing
- Expecting local `npm publish` to work — releases publish from GitHub Actions now
- Skipping the GitHub release step — npm-only releases leave users without a readable changelog
- Using `git commit --amend` after the commit was pushed — create a new commit instead

## Visual Testing with Agent Browser

Use the `agent-browser` skill to visually verify CSS changes. This is especially useful for checking color variants, theme switching, and responsive layouts.

### Basic Workflow

```bash
# Open an HTML file directly (no server needed)
agent-browser open "file:///Users/pietz/Private/daftcss/docs/components/index.html"

# Take screenshots to verify visual output
agent-browser screenshot --full /tmp/screenshot.png

# Get interactive elements for interaction
agent-browser snapshot -i

# Interact with elements (use refs from snapshot)
agent-browser click @e1          # Click element
agent-browser fill @e2 "text"    # Fill input

# Check computed styles
agent-browser eval "getComputedStyle(document.querySelector('.my-class')).backgroundColor"

# Close when done
agent-browser close
```

### Tips

- Use `file://` URLs to test HTML files without a server
- Take `--full` screenshots for full page captures
- Use `eval` to check computed CSS values for debugging
- Create temporary test HTML files in `examples/` for specific features, then delete them after verification

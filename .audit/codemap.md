# Codemap

## File Manifest

| Area | Files | Purpose |
|------|-------|---------|
| `src/base/` | `variables.css`, `reset.css`, `root.css`, `document.css` | Design tokens, reset, theme-island mechanism, document defaults |
| `src/content/` | `typography.css`, `embedded.css`, `code.css` | Prose, headings, links, media, code/pre/kbd styling |
| `src/layout/` | `container.css`, `grid.css`, `landmarks.css`, `overflow.css` | Containers, weighted grid, semantic page landmarks, overflow/table wrappers |
| `src/forms/` | `input.css`, `checkbox.css`, `range.css`, `validation.css` | Native input/select/textarea/file/color, checkbox/radio/switch, range, validation states |
| `src/components/` | accordion, alert, avatar, badge, button, card, dropdown, group, loading, modal, nav, progress, sidebar, table, tooltip, tree | Semantic components and small class variants |
| `src/slides/` | `slides.css` | Optional slide/deck layer included in the default bundle |
| `src/utilities/` | `helpers.css` | Utility escape hatch: color, visibility, text, layout atoms, spacing, border, background, shadow, transition, animation |
| `docs/` | site pages, component catalog, examples, `docs/dist/` | Static docs and examples served by `npm run dev` |
| root docs | `README.md`, `DOCS.md`, `SLIDES.md`, `AGENTS.md`, `CLAUDE.md`, `skills/daftcss/*` | Public docs, internal guidance, and agent skill reference |

## Architecture Overview

Daft CSS is a single-entry CSS framework. `src/daft.css` defines the cascade layer order and imports partials into those layers. `npm run build` uses Lightning CSS directly to bundle and minify `src/daft.css`, then copies the generated files to `docs/dist/`.

The core product model is semantic-first CSS: native elements (`button`, `article`, `details`, `dialog`, `progress`, form controls, tables) receive polished defaults, with small role/data/class APIs for cases native HTML cannot express. The design-token model lives mostly in `src/base/variables.css`: Tier 0 root knobs drive Tier 1 scales and Tier 2 component tokens.

## Convention Fingerprint

- CSS is organized by semantic area and imported through `src/daft.css`.
- Cascade order is explicit: `tokens`, `reset`, `base`, `layout`, `content`, `forms`, `components`, `slides`, `utilities`.
- Modern CSS is intentional: `light-dark()`, OKLCH, nesting, `:has()`, Popover API, `@starting-style`, and discrete transition behavior are preserved.
- Theme switching uses `[data-theme] { color-scheme: ... }`; colors generally live in variables with `light-dark()`.
- Components prefer native selectors and ARIA/role states over required classes.
- Classes are reserved for variants (`.secondary`, `.outline`, `.ghost`, `.destructive`) and layout/utilities (`.container`, `.grid`, `.span-N`, `.stack`, `.cluster`).
- Generated `dist/` and `docs/dist/` are checked in and expected to match source builds.
- There are no tests; build is the main automated check.

## Dependency Graph

CSS dependency direction is one-way through `src/daft.css` imports. No partial imports other partials directly.

High-connectivity nodes:

- `src/base/variables.css` is consumed everywhere through custom properties.
- `src/daft.css` is the only source entrypoint.
- `src/utilities/helpers.css` is broad and overlaps with layout concerns.
- `src/components/sidebar.css` affects global body/page layout despite living under components.

## Risk Hotspots

### Large/Complex Files

- `src/utilities/helpers.css` (391 lines) — broad utility surface and duplicate ownership of `.overflow-auto`.
- `src/forms/input.css` (247 lines) — dense selector logic for many input types.
- `src/slides/slides.css` (210 lines) — first-class layer but not fully reflected in maintainer docs.
- `src/content/typography.css` (210 lines) — broad semantic prose rules.

### Contract/Docs Hotspots

- Token docs and homepage snippets need to stay synchronized with `src/base/variables.css`.
- Modal docs use Popover API language that implies true modal behavior.
- Slide docs/examples use `class="card"` even though cards are bare `<article>`.
- Docs/examples use many inline styles and utility chains, blurring copyable Daft API vs docs-site presentation.

### Uncommitted/Untracked Notes

- `.antigravitycli/` is untracked local tooling state.
- `docs/index-peer.html` is untracked and contains stale visible version labels.
- `.audit/` was created for this audit.

## Static Analysis Summary

See `.audit/static-analysis.md`.

## Coverage Notes

The audit covered the full repository at a structural level, all source CSS entrypoints, representative source files from every `src/` area, package/build configuration, top-level docs, skill docs, and docs/examples. No code changes were made.

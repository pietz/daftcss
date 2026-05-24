# Daft CSS Codebase Audit

## Theme: Product Contract Drift

**Remediation path:** Treat `src/base/variables.css` and semantic HTML selectors as the canonical API, then sync docs/examples/agent guidance back to that source of truth.
**Estimated effort:** medium

### P1: Popover-backed "modals" are documented as true modals

**Priority:** P1 | **Complexity:** medium | **Validity:** high

**Location:** `src/components/modal.css:3`, `DOCS.md:739`, `README.md:225`, `docs/components/index.html:786`
**Evidence:** The CSS and docs call `<dialog popover>` the preferred no-JS modal path. Popover-backed dialogs are top-layer overlays, but they do not provide the same modal/inert/focus-trap behavior as `dialog.showModal()`.
**Impact:** Users can put destructive confirmations or blocking flows into a pattern that looks modal but behaves non-modally.
**Suggestion:** Rename the no-JS pattern to "popover dialog" or "overlay"; recommend `showModal()` for true modal flows. Update README, DOCS, component demo, and skill docs together.
**Validation:** Add manual/browser checks for tab order, ESC, backdrop, and background interaction for both "true modal" and "popover dialog" examples.

### P1: Slide docs teach a nonexistent `.card` class

**Priority:** P1 | **Complexity:** low | **Validity:** high

**Location:** `SLIDES.md:3`, `SLIDES.md:85`, `docs/slides/index.html:70`, `docs/examples/slides/index.html:63`
**Evidence:** Slide docs say layouts compose from `.card` and examples use `<article class="card">`, while `src/components/card.css` styles bare `article` and the Daft skill explicitly says card is `<article>` with no class.
**Impact:** This directly contradicts the semantic-first API and teaches a false component class.
**Suggestion:** Replace slide examples with bare `<article>` and describe cards as Daft's `<article>` card surface. Add a simple grep check for `class="card"`.
**Validation:** Grep docs for `.card`, rebuild, and visually smoke-test slide examples.

### P2: Token docs are stale against the actual variable graph

**Priority:** P2 | **Complexity:** low | **Validity:** high

**Location:** `DOCS.md:86`, `DOCS.md:97`, `docs/index.html:719`, `AGENTS.md:50`, `skills/daftcss/REFERENCE.md:20`
**Evidence:** Docs mention `--font-scale`, but text sizes derive directly from `--font-size-base`; docs list `--component-height` as `2.25rem` or `2.5rem`, while source uses `2rem`; docs list `--secondary`, but source does not define it.
**Impact:** Retheming is Daft's main customization promise. Stale token docs make copy-pasted overrides fail or behave unexpectedly.
**Suggestion:** Make `src/base/variables.css` the canonical token source and update README, DOCS, homepage, AGENTS/CLAUDE, and skill reference from it.
**Validation:** Grep docs for nonexistent tokens (`--font-scale`, `--secondary`) and compare documented defaults to `variables.css`.

### P2: Docs/examples are drifting toward utility-heavy and inline-style-heavy markup

**Priority:** P2 | **Complexity:** medium | **Validity:** high

**Location:** `docs/index.html:191`, `docs/index.html:239`, `docs/index.html:407`, `docs/index.html:909`, `docs/components/index.html:16`
**Evidence:** The docs site uses many utility chains, inline styles, custom docs CSS, and demo scripts near copyable examples.
**Impact:** The framework still works semantically, but the showcase increasingly implies that polished Daft UIs require utility glue and custom styling.
**Suggestion:** Separate copyable Daft examples from docs-site presentation. Move repeated inline styles into docs-only CSS and keep snippets as semantic as possible.
**Validation:** Track an inline-style budget for copyable examples and grep docs for `style=`.

## Theme: Variable Hierarchy

**Remediation path:** Preserve the current three-tier model, but add a few missing semantic/component/state tokens where users would otherwise need selector overrides.
**Estimated effort:** medium

### P1: Documented `--secondary` token is missing

**Priority:** P1 | **Complexity:** low | **Validity:** high

**Location:** `DOCS.md:97`, `DOCS.md:111`, `src/base/variables.css:116`, `src/components/button.css:70`, `src/components/badge.css:28`
**Evidence:** Docs say `--secondary` is a separate knob, but source defines no `--secondary` or `--secondary-foreground`; `.secondary` buttons and badges use `--accent`.
**Impact:** Users cannot retune secondary surfaces independently from hover/accent surfaces, which breaks the intended hierarchy.
**Suggestion:** Add `--secondary: var(--muted)` and `--secondary-foreground: var(--foreground)`, then route `.secondary` variants through them while keeping `--accent` for hover surfaces.
**Validation:** Override `--secondary` in a demo and confirm secondary buttons/badges change without changing ghost hover/dropdown hover.

### P2: Code block dark mode bypasses the theme-island model

**Priority:** P2 | **Complexity:** low | **Validity:** high

**Location:** `src/content/code.css:46`, `src/base/root.css:6`
**Evidence:** Most theme colors live in `variables.css` with `light-dark()`, but `pre` uses `[data-theme="dark"]` and `prefers-color-scheme` selectors with hard-coded `oklch(0.18 0 0)`.
**Impact:** Code blocks are less predictable inside theme islands and duplicate theme logic outside the central mechanism.
**Suggestion:** Add a `--code-background` token using `light-dark()` and let `pre` consume it.
**Validation:** Put dark and light theme islands on one page and verify `pre` follows each island.

### P2: Common component dimensions are local literals instead of targeted Tier 2 tokens

**Priority:** P2 | **Complexity:** medium | **Validity:** high

**Location:** `src/components/modal.css:52`, `src/components/dropdown.css:51`, `src/components/table.css:19`, `src/components/loading.css:24`, `src/forms/range.css:17`
**Evidence:** Modal width, dropdown min width, table row/header height, spinner sizes, spinner speed, and range track dimensions are hard-coded.
**Impact:** Users can tune global spacing/radius/height but still need selector overrides for common component feel changes.
**Suggestion:** Add a small set of public Tier 2 tokens only for likely theming needs: `--modal-width`, `--dropdown-min-width`, `--table-header-height`, `--loading-spinner-size`, `--range-track-height`, etc.
**Validation:** Override each new token in a focused example and verify no selectors are required.

### P3: Interaction tint strengths are repeated ad hoc

**Priority:** P3 | **Complexity:** medium | **Validity:** high

**Location:** `src/components/button.css:75`, `src/components/tree.css:98`, `src/components/alert.css:40`, `src/components/table.css:38`
**Evidence:** Hover, active, selected, destructive, and alert tint percentages are repeated locally.
**Impact:** A retheme that wants stronger or subtler state colors must override selectors rather than tune a small state scale.
**Suggestion:** Consider a compact state/tint scale such as `--hover-tint`, `--selected-tint`, `--subtle-tint`, `--subtle-tint-hover`, and `--subtle-tint-active`.
**Validation:** Apply one high-contrast state scale and inspect tree rows, table rows, buttons, and alerts.

## Theme: Source Organization and Workflow

**Remediation path:** Keep the source split, but clarify ownership boundaries and make local docs development use the same CSS file that docs load.
**Estimated effort:** medium

### P2: `npm run watch` does not update the CSS served by docs

**Priority:** P2 | **Complexity:** low | **Validity:** high

**Location:** `package.json:11`, `package.json:12`, `package.json:13`, `docs/index.html:10`
**Evidence:** Build copies `dist/*` to `docs/dist/*`, but watch writes only `dist/daft.css`; docs served from `docs/` load `/dist/daft.css`, i.e. `docs/dist/daft.css`.
**Impact:** During local docs work, examples can show stale CSS.
**Suggestion:** Add a docs watch output to `docs/dist/daft.css`, or change dev serving so docs load root `dist`.
**Validation:** Run watch, edit a temporary CSS rule, and confirm the served docs CSS changes.

### P2: Sidebar lives as a component but owns page layout

**Priority:** P2 | **Complexity:** medium | **Validity:** high

**Location:** `src/components/sidebar.css:4`, `src/components/sidebar.css:89`, `src/components/sidebar.css:100`, `src/components/sidebar.css:113`
**Evidence:** Sidebar rules set body-level variables, fixed placement, sibling margins for `header/nav/main/footer`, and mobile drawer behavior.
**Impact:** Layout behavior, component internals, and mobile overlay behavior are bundled into one component file, making future cascade changes harder to reason about.
**Suggestion:** Split body placement/sibling-margin rules into `src/layout/sidebar.css`, keeping sidebar interior styles and `.sidebar-toggle` in components.
**Validation:** Smoke-test both sidebar placement modes on desktop and mobile.

### P2: Utilities are broad enough to duplicate layout ownership

**Priority:** P2 | **Complexity:** medium | **Validity:** high

**Location:** `src/utilities/helpers.css:143`, `src/utilities/helpers.css:153`, `src/utilities/helpers.css:253`, `src/layout/overflow.css:6`
**Evidence:** Utilities include flex, stack, cluster, gap, spacing, overflow, borders, surfaces, shadows, transitions, and animation; `.overflow-auto` also appears in layout.
**Impact:** The utility escape hatch risks becoming a second layout system, which pulls against "a few well-chosen classes, not a utility framework."
**Suggestion:** Decide which utilities are official layout primitives and move/split them accordingly. Give `.overflow-auto` one owner.
**Validation:** Compare generated CSS order and docs examples after any split.

### P3: `slides` is a real layer but missing from maintainer guidance

**Priority:** P3 | **Complexity:** low | **Validity:** high

**Location:** `src/daft.css:8`, `src/daft.css:53`, `AGENTS.md:34`, `AGENTS.md:39`
**Evidence:** Source defines and imports a `slides` layer, but AGENTS/CLAUDE guidance omits it from layer order and source structure.
**Impact:** Future agents/contributors may put slide fixes in the wrong layer or miss the feature entirely.
**Suggestion:** Sync maintainer docs with `src/daft.css`, and decide whether slides remains in the default bundle or becomes a separate entrypoint.
**Validation:** Build and inspect layer order after docs/source updates.

## Theme: Accessibility, Compatibility, and Supply Chain

**Remediation path:** Make modern-browser assumptions explicit, and avoid docs/runtime patterns that look safer than they are.
**Estimated effort:** medium

### P2: ARIA-only disabled/busy states can still be keyboard-activated

**Priority:** P2 | **Complexity:** low | **Validity:** high

**Location:** `src/components/button.css:49`, `src/components/loading.css:14`
**Evidence:** `[aria-disabled="true"]` and `[aria-busy="true"]` use `pointer-events: none`, opacity, or cursor states. This blocks pointer input but does not disable focus or Enter/Space activation.
**Impact:** A control can look unavailable while still firing keyboard actions.
**Suggestion:** Document these as visual states only. Encourage `disabled aria-busy="true"` on native controls when the action must be blocked.
**Validation:** Add a tiny regression/demo page that tabs to busy/aria-disabled buttons and verifies intended activation behavior.

### P2: Components docs load third-party CDN JavaScript without SRI

**Priority:** P2 | **Complexity:** low | **Validity:** high

**Location:** `docs/components/index.html:12`
**Evidence:** Highlight.js CSS/JS is loaded from `cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/...` without exact version pinning or integrity attributes.
**Impact:** This is the main concrete supply-chain exposure in an otherwise static CSS project.
**Suggestion:** Vendor the assets, pin an immutable version with SRI, or remove runtime highlighting.
**Validation:** Grep for remote scripts without `integrity` and test component docs rendering.

### P2: Compatibility claims need an explicit guard

**Priority:** P2 | **Complexity:** medium | **Validity:** medium-high

**Location:** `src/components/sidebar.css:125`, `src/components/modal.css:69`, `README.md:483`, `docs/index.html:699`
**Evidence:** The framework intentionally uses very new features: Popover API, `:popover-open`, `@starting-style`, `overlay`, `allow-discrete`, container query units, and modern color functions.
**Impact:** The modern-only choice is coherent, but unsupported features degrade at runtime and there is no compatibility smoke test for the declared browser floor.
**Suggestion:** Maintain a tracked browser feature matrix and run browser smoke tests for modal/sidebar/theme examples in the declared minimum browsers.
**Validation:** Verify modal, mobile sidebar, theme islands, and slides in Chromium, Firefox, and WebKit.

### P3: Build metadata and dev tooling are slightly stale/floating

**Priority:** P3 | **Complexity:** low | **Validity:** high

**Location:** `package.json:3`, `package-lock.json:3`, `package-lock.json:25`, `package.json:13`
**Evidence:** `package.json` is `1.12.3`, but `package-lock.json` still says `1.9.0`; `lightningcss-cli` is semver-ranged; `npx serve docs` can fetch an unpinned CLI.
**Impact:** Current output is reproducible, but release metadata and local dev tooling are looser than ideal for a CSS build whose output is the product.
**Suggestion:** Refresh lock metadata, consider pinning Lightning CSS exactly, and add/pin `serve` as a dev dependency if `npm run dev` is part of normal workflow.
**Validation:** Run `npm ci`, rebuild, and compare `dist/` and `docs/dist/`.

## Questions

1. Should slides remain in `daft.min.css` by default, or should it become a separate optional entrypoint?
2. Do you want Daft to expose a real Pico compatibility layer for small carryovers like `.contrast`, or keep the Pico comparison explicitly "inspired by" rather than "drop-in"?
3. Should utility layout primitives like `.stack` and `.cluster` be considered first-class layout API, or merely escape hatches?

## Structural Health Summary

### Overall Assessment

The source core is clean and still aligned with the semantic-first goal. The biggest deterioration is around the edges: docs, examples, token reference, and a few newer features have drifted faster than the underlying architecture.

### Top Systemic Issues

1. Documentation is no longer reliably generated from or checked against the source token/API surface.
2. The variable hierarchy is conceptually strong, but a few missing tokens force users to drop too low in the cascade.
3. Newer features (`slides`, `sidebar`, popover dialogs) need clearer ownership and product language before they calcify.

### Findings Overview

| Priority | Count |
|----------|-------|
| P0 | 0 |
| P1 | 3 |
| P2 | 12 |
| P3 | 5 |

**Lenses applied:** variable hierarchy, architecture, product alignment, security/performance/compatibility | **Scope:** full repo

### Coverage

Reviewed full source structure, build configuration, docs site, top-level docs, skill docs, representative component/form/layout/content files, and generated output consistency. No implementation changes were made.

### Recommended Next Steps

1. Fix the `--secondary` token contract and sync token docs.
2. Rename/split the popover-dialog vs true-modal story.
3. Remove `.card` from slide docs/examples.
4. Fix docs watch output so local previews use fresh CSS.
5. Decide sidebar/slides/utility ownership boundaries.
6. Add a small docs/API lint checklist: nonexistent tokens/classes, inline style budget in examples, remote scripts without SRI.

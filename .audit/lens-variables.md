# Variable Hierarchy and Theming Architecture Audit

Scope: `AGENTS.md`, `README.md`, `DOCS.md`, `skills/daftcss/THEMING.md`, `src/base/variables.css`, `src/base/root.css`, `src/daft.css`, and representative CSS from `src/components`, `src/forms`, `src/content`, and `src/layout`.

Overall assessment: the architecture mostly supports the stated goal. The main token graph is clear: Tier 0 values drive scales, scales drive component tokens, and theme switching is elegantly centralized through `light-dark()` plus cascaded `color-scheme`. The biggest gaps are not structural collapse, but missing documented surfaces and local literals in components that force selector overrides for common rethemes.

## P1: Documented `--secondary` token is missing and secondary components are tied to `--accent`

**Priority:** P1 | **Complexity:** low | **Validity:** high

**Evidence:**
- `DOCS.md:97` documents `--secondary` as the "Secondary button background".
- `DOCS.md:111` says `--accent`, `--secondary`, and `--muted` are "exposed as separate knobs" so ghost hover, secondary button, and disabled surfaces can be retuned independently.
- `src/base/variables.css:116` defines `--accent: var(--muted)`, but there is no `--secondary` or `--secondary-foreground`.
- `src/components/button.css:70-79` styles `.secondary` buttons with `--accent`.
- `src/components/badge.css:28` styles `.badge.secondary` with `--accent`.

**Impact:** a user following the docs can set `--secondary` and see no effect. More importantly, the intended override surface does not exist: changing secondary button fills requires changing `--accent`, which also changes ghost hover surfaces and dropdown item hover states. That breaks the "highest tier that works" theming rule.

**Suggestion:** add a real semantic token pair:

```css
:root {
  --secondary: var(--muted);
  --secondary-foreground: var(--foreground);
}
```

Then route secondary variants through those tokens:

- `.secondary` buttons: `background-color: var(--secondary); color: var(--secondary-foreground);`
- `.badge.secondary`: `--badge-tint: var(--secondary); --badge-on-tint: var(--secondary-foreground);`
- Consider whether `progress.secondary` should use `--secondary` or stay as a muted-foreground semantic.

Keep `--accent` for hover/active surfaces. This matches the documentation without adding a large variable graph.

## P2: Code block dark-mode styling bypasses the theme-island model

**Priority:** P2 | **Complexity:** low | **Validity:** high

**Evidence:**
- `src/base/root.css:6-10` says all color values live in `variables.css` and `light-dark()` resolves from cascaded `color-scheme`.
- `src/content/code.css:47-54` special-cases dark code block backgrounds with `[data-theme="dark"] pre` and `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) pre { ... } }`.
- The media selector is rooted at `:root`, so in a system-dark browser it can still match `pre` elements inside a light theme island unless a more specific local rule overrides it.

**Impact:** code blocks are the one audited color surface that does not fully participate in the central theme mechanism. It also duplicates theme logic outside `root.css`, making theme islands less predictable and violating the file's own architecture comment.

**Suggestion:** move the code surface into variables and consume it directly:

```css
:root {
  --code-background: light-dark(var(--muted), oklch(0.18 0 0));
}

pre {
  background-color: var(--code-background);
}
```

Inline `code`, `kbd`, and `samp` can continue using `--muted` unless they need their own documented component token.

## P2: Several component geometry values are local literals instead of component tokens

**Priority:** P2 | **Complexity:** medium | **Validity:** high

**Evidence:**
- `src/components/modal.css:52` and `src/components/modal.css:77` hard-code modal width at `32rem`.
- `src/components/dropdown.css:51` hard-codes dropdown `min-width: 10rem`.
- `src/components/table.css:19` hard-codes header cell height at `2.5rem`.
- `src/components/card.css:128` hard-codes busy-card `min-height: 8rem`.
- `src/components/loading.css:24-30` and `src/components/loading.css:37-44` hard-code spinner sizes, border width, and speed.
- `src/forms/range.css:7`, `src/forms/range.css:17`, `src/forms/range.css:25`, and `src/forms/range.css:35` hard-code range control and track dimensions.

**Impact:** the Tier 2 model exists for common component feel values like radius, height, and shadow, but not for several equally component-specific dimensions. A retheme can globally change `--spacing`, `--component-height`, or `--radius`, yet still needs selector overrides for modal width, dropdown width, spinner scale, range track thickness, and table density.

**Suggestion:** add only the component tokens that map to likely theming needs:

```css
:root {
  --modal-width: 32rem;
  --dropdown-min-width: 10rem;
  --table-header-height: calc(var(--component-height) + 0.5rem);
  --loading-spinner-size: 1.5rem;
  --loading-spinner-size-inline: 1rem;
  --loading-spinner-border-width: var(--outline-width);
  --range-height: calc(var(--component-height) * 0.75);
  --range-track-height: calc(var(--control-size) * 0.5);
}
```

This keeps Tier 2 targeted rather than turning every literal into a public API.

## P2: Interaction tint strengths are repeated as ad hoc percentages

**Priority:** P2 | **Complexity:** medium | **Validity:** high

**Evidence:**
- `src/base/variables.css:171-172` defines global `--hover-opacity` and `--active-opacity`.
- `src/components/button.css:75-79` uses separate local mixes for secondary hover/active: `80%/5%` and `70%/10%`.
- `src/components/button.css:86-93` uses destructive tint steps of `10%`, `20%`, and `30%`.
- `src/components/alert.css:40`, `src/components/alert.css:51-55` uses status tint strengths of `60%`, `12%`, `35%`, and `85%`.
- `src/components/table.css:38`, `src/components/table.css:60`, and `src/components/table.css:64` use `50%`, `30%`, and `60%`.
- `src/components/tree.css:98` and `src/components/tree.css:118` use `8%` and `12%`.
- `src/content/typography.css:98`, `src/content/typography.css:110`, and `src/base/document.css:29` define more local mix strengths for links, marks, and selection.

**Impact:** the color system is semantically named, but a major part of the visual feel is still hard-coded in selectors. A brand or accessibility retheme that wants stronger hover states, subtler tinted alerts, or higher-contrast selected rows cannot use a small number of knobs; it must override selectors or redefine many component-level colors.

**Suggestion:** introduce a small state/tint scale, not a large one:

```css
:root {
  --hover-tint: 8%;
  --selected-tint: 12%;
  --subtle-tint: 10%;
  --subtle-tint-hover: 20%;
  --subtle-tint-active: 30%;
  --surface-mix: 60%;
}
```

Then use these in tree/table/alert/destructive patterns. Keep `--hover-opacity` and `--active-opacity` for solid surfaces where opacity against transparent is the desired behavior.

## P3: Token taxonomy is slightly ambiguous after Tier 2

**Priority:** P3 | **Complexity:** low | **Validity:** medium

**Evidence:**
- `src/base/variables.css:119-164` labels Tier 2 component tokens.
- `src/base/variables.css:166-191` then defines interaction state and icon tokens outside the documented three-tier structure.
- `skills/daftcss/THEMING.md:7-13` presents only Tier 0, Tier 1, and Tier 2, with the rule to start at the highest tier that works.

**Impact:** this is not currently causing broken styles, but it makes it less clear whether tokens like `--hover-opacity`, `--focus-ring-width`, `--icon-size`, and `--icon-select-chevron` are intended as root knobs, derived scale tokens, or component tokens. That ambiguity matters because theming guidance depends on knowing which tokens are stable public API.

**Suggestion:** document these as a fourth public group, for example "global state and asset tokens", or fold them into Tier 1 as derived primitives. I would avoid making them Tier 0; otherwise the "small handful of top-level knobs" grows too quickly.

## P3: Select chevron color is not connected to semantic color tokens

**Priority:** P3 | **Complexity:** low | **Validity:** high

**Evidence:**
- `src/base/variables.css:191` defines `--icon-select-chevron` as a data URI with hard-coded stroke `%236b7280`.
- `src/forms/input.css:71-74` uses that image for `select`.

**Impact:** changing `--muted-foreground`, `--foreground`, or theme colors does not retint the native select chevron. The token can be overridden manually, but it is disconnected from the semantic color graph by default.

**Suggestion:** prefer the same mask pattern used by dropdown/tree chevrons, with `background-color: var(--muted-foreground)` or `currentColor`, if browser behavior allows it for select backgrounds. If a background image is still necessary, document `--icon-select-chevron` as an escape hatch rather than a semantic token.

## Positive Findings

- `src/base/variables.css:21-47` gives a compact, understandable Tier 0 set: spacing, radius, component height, typography, animation, and core semantic colors.
- `src/base/variables.css:54-95` derives spacing, radius, typography, transitions, and component-height scales from those root knobs. This supports density, roundness, and type-scale rethemes without selector work.
- `src/base/root.css:13-23` keeps `data-theme` as a mechanism rather than a duplicated palette, which is the right architecture for `light-dark()` theme islands.
- `src/daft.css:7-57` keeps tokens in the first cascade layer and component rules in later layers, so downstream variable overrides remain the intended customization path.
- Representative components mostly consume the hierarchy well: buttons use `--button-height`, `--button-radius`, `--button-shadow`; cards use `--card`, `--card-radius`, `--card-shadow`; inputs use `--input`, `--input-height`, and `--input-background`.

## Recommended Order

1. Add and wire the missing `--secondary` token pair. This fixes a documented API mismatch and restores independent control over secondary surfaces.
2. Move code block dark-mode color into a `--code-background` token using `light-dark()`. This repairs theme-island consistency.
3. Add a small set of component geometry tokens for modal, dropdown, range, loading, and table dimensions.
4. Add a compact tint/state scale only where repeated percentages express theming intent. Avoid tokenizing incidental layout math.
5. Clarify in `THEMING.md` whether interaction and icon tokens are public theme API, derived primitives, or escape hatches.

# Product / Concept Alignment Audit

Scope: `README.md`, `DOCS.md`, `AGENTS.md`, `CLAUDE.md`, `skills/daftcss/*`, `docs/**`, component examples, and the CSS surface in `src/**`.

Focus: semantic-first promise, docs drift, examples that teach non-semantic patterns, missing docs for newer features, and promise-vs-behavior mismatches.

## Summary

Daft's core implementation is still strongly aligned with the semantic-first concept: native elements, ARIA states, roles, and small data attributes drive most component styling. The main drift is in the documentation/examples layer. Several docs now teach stale or nonexistent APIs, and the showcase pages increasingly use utility chains, inline styles, and small scripts in a way that blurs the "just semantic HTML + a stylesheet" message.

Findings by priority:

| Priority | Count |
| --- | ---: |
| P1 | 1 |
| P2 | 4 |
| P3 | 3 |

## P1: Slide docs teach a nonexistent `.card` class

**Evidence**

- `SLIDES.md:3` says slide layouts compose from Daft primitives including `.card`.
- `SLIDES.md:85-87`, `docs/slides/index.html:70-78`, and `docs/examples/slides/index.html:63-72` use `<article class="card">`.
- `src/components/card.css:6-14` styles bare `article`; there is no `.card` selector in `src`.
- `skills/daftcss/SKILL.md:31` explicitly says card is `<article>` with no class, and `skills/daftcss/SKILL.md:86` lists `<div class="card">` as a mistake.

**Impact**

This directly undercuts the semantic-first API. Users and agents copying slide examples learn that cards require a class, while the framework's actual card primitive is the native `<article>`. It also creates false confidence that `.card` works generally.

**Suggestion**

Replace slide examples with bare `<article>`, remove `.card` from slide prose/comments, and describe cards as "Daft's `<article>` card surface." Add a quick docs grep/check for `class="card"` so this does not regress.

## P2: Token docs and homepage examples are stale against `variables.css`

**Evidence**

- `docs/index.html:719-731` teaches `--font-scale` and derived text variables based on it, but `src/base/variables.css:67-75` derives text sizes directly from `--font-size-base`; `--font-scale` does not exist.
- `AGENTS.md:50-52` and `CLAUDE.md:50-52` also list `--font-scale` as a core variable.
- `DOCS.md:86` and `skills/daftcss/REFERENCE.md:20,63` say `--component-height` is `2.25rem`; `src/base/variables.css:23` sets it to `2rem`.
- `skills/daftcss/REFERENCE.md:69-78` lists `--button-radius` / `--input-radius` as `--radius-md` and `--button-shadow` as `--shadow-xs`; `src/base/variables.css:124-147` uses `--radius-lg` for button/input radius and `none` for button shadow.

**Impact**

Retheming docs are central to Daft's product promise. Stale token names and defaults cause copy-pasted customizations to do nothing or to produce different results than documented. This is especially risky for the agent skill docs, because agents will repeat the wrong design model.

**Suggestion**

Make `src/base/variables.css` the canonical token source and sync all token tables/snippets from it. First fixes: remove `--font-scale`, change `--component-height` docs to `2rem`, update component token defaults, and update the homepage "Theme tokens" snippet to show the real derivation model.

## P2: Showcase/docs pages increasingly model utility-heavy and inline-style-heavy HTML

**Evidence**

- The README promise is "Style raw HTML -- no JavaScript, no required utility classes, no JSX components" at `README.md:3`, and says classes should be "a few well-chosen" variants/layout helpers at `README.md:20-21`.
- The docs site uses many utility chains and inline styles in copy-adjacent examples, e.g. `docs/index.html:191`, `docs/index.html:239`, `docs/index.html:354-370`, `docs/index.html:407-460`, `docs/index.html:507-531`, and `docs/index.html:613-628`.
- A repo-wide docs scan found 102 `style="..."` instances in `docs/*.html`, `docs/components/index.html`, `docs/examples/*/index.html`, and `docs/slides/index.html`.
- `docs/components/index.html:16-102` includes custom CSS to render sidebar diagrams and layout helpers inside the component reference.

**Impact**

Some custom CSS is normal for the marketing/docs shell, but the current pages blur which markup is Daft API and which is one-off presentation glue. Users and agents can reasonably conclude that polished Daft UIs require utility chains and inline layout patches, weakening the semantic-first concept.

**Suggestion**

Separate "copyable Daft markup" from "docs-site-only presentation." Keep component/example snippets as semantic as possible, move repeated inline styles into named docs-only CSS, and add a short note where a demo uses custom docs styling. Consider a lightweight docs lint budget for inline styles in copyable examples.

## P2: Pico comparison still uses unsupported Pico-era classes while saying "same markup"

**Evidence**

- `docs/examples/pico-comparison/index.html:18` says the page is "same markup, drop-in stylesheet, side-by-side comparison."
- The same file uses unsupported `.contrast` at `docs/examples/pico-comparison/index.html:184`, `docs/examples/pico-comparison/index.html:189`, and `docs/examples/pico-comparison/index.html:374`.
- `rg` found no `.contrast` implementation in `src`.
- `README.md:43` says Daft is not a drop-in replacement for Pico.

**Impact**

The page demonstrates the opposite of the documented positioning: it implies Pico markup ports directly, while unsupported classes silently no-op. This can mislead evaluators and produce examples where visual variants are missing.

**Suggestion**

Either make the comparison intentionally compatibility-focused and implement/map the small Pico carryovers, or rename the page to "Pico-inspired port" and replace unsupported classes with Daft equivalents. At minimum, annotate unsupported Pico classes in the comparison.

## P2: The no-JavaScript promise needs clearer boundaries in docs/examples

**Evidence**

- `README.md:3`, `README.md:11`, and `README.md:24` frame Daft as no-JavaScript, including interactive components.
- `DOCS.md:739-763` correctly documents popover-based modals as no-JS, but the next "bare `<dialog>`" example uses inline JavaScript at `DOCS.md:771-773`.
- Docs/example pages include JS for theme toggles and demos, e.g. `docs/index.html:909-950`, `docs/components/index.html:818-830`, `docs/examples/landing/index.html:262-268`, `docs/examples/dashboard/index.html:235-241`, `docs/examples/product/index.html:288-295`, and `docs/examples/demo/index.html:193-200`.

**Impact**

The implementation still supports no-JS components, but the docs mix "Daft requires no JS" with JS-powered docs affordances. That is easy to misread as "Daft examples need small scripts," especially for users scanning examples rather than reading principles.

**Suggestion**

Keep scripts for docs-site features if needed, but label them as docs/demo-only. For `DOCS.md`, move the `showModal()` example under a clearly named "JS-compatible native dialog fallback" section, after the no-JS path, and avoid inline `onclick` in the main component docs.

## P3: Agent-facing docs are behind the actual source structure

**Evidence**

- `src/daft.css:8` defines layer order as `tokens, reset, base, layout, content, forms, components, slides, utilities`.
- `AGENTS.md:34` and `CLAUDE.md:34` omit the `slides` layer.
- `AGENTS.md:43` and `CLAUDE.md:43` list components only through `group`, missing newer `badge`, `avatar`, `alert`, `sidebar`, and `tree`.
- `AGENTS.md:78` and `AGENTS.md:90` point to `docs/components.html`; the actual component page is `docs/components/index.html`. `CLAUDE.md:87` has the correct path, but `CLAUDE.md:124,190` still mention `docs/components.html`.

**Impact**

These files steer future coding agents. Stale layer/component/path guidance increases the chance that future feature work updates the wrong docs, misses the slide layer, or fails visual verification.

**Suggestion**

Sync `AGENTS.md` and `CLAUDE.md` with `src/daft.css`, the current `src/components/*` list, and `docs/components/index.html`. Consider making one file canonical and deriving the other, or at least auditing them during release.

## P3: README is less complete than the current component/API surface

**Evidence**

- `README.md:128-136` documents button variants but omits `.link` and `.full-width`, both documented in `DOCS.md:321-350` and implemented in `src/components/button.css:125-176`.
- `README.md` has no progress section, while `src/components/progress.css:5-84` implements native `<progress>` plus `.secondary`, `.success`, `.warning`, and `.destructive` variants; `DOCS.md:830-857` documents these.
- `README.md:41` lists extras as "Tooltips, dropdowns, button groups, badges" but the current extras also include tree, sidebar, avatar, alerts, progress, and slides.

**Impact**

The README is the top-of-funnel promise. Missing newer features makes the framework look smaller/older than it is, and users may not discover semantic APIs that would prevent custom code.

**Suggestion**

Keep the README concise, but update the component overview and extras list to reflect the current surface. Add short entries for progress and the missing button variants, or explicitly say the README is a quick tour and link to the full catalog.

## P3: Slide docs contain a stale demo path

**Evidence**

- `SLIDES.md:31` says the complete demo lives at `examples/slides.html`.
- The repo has `docs/examples/slides/index.html` and `docs/slides/index.html`; there is no `examples/slides.html`.

**Impact**

Low functional risk, but it is a trust leak in a newer feature's dedicated docs.

**Suggestion**

Point `SLIDES.md` to `docs/examples/slides/` or `docs/slides/`, whichever is intended as canonical.

## Notes / Non-Issues

- The built CSS size is currently `58,939` bytes for `dist/daft.min.css`. The docs site badge says `57 KB` (`docs/index.html:195`), while README copy says `~55 KB` (`README.md:12,35,51`). This is close enough to be marketing rounding, but if size is a differentiator, use one convention consistently.
- The CSS core itself continues to favor semantic selectors: cards are `article`, alerts are `role="alert"` / `role="status"`, switches are `input[type="checkbox"][role="switch"]`, modals use `dialog[popover]`, and active/current state uses ARIA.

## Recommended Next Steps

1. Fix the `.card` slide drift first; it is the clearest semantic-first contradiction.
2. Sync token docs from `src/base/variables.css`, especially `--font-scale`, `--component-height`, radii, and button shadow defaults.
3. Clean up copyable examples so they demonstrate semantic-first Daft markup, with docs-only CSS/JS clearly separated.
4. Decide whether the Pico comparison is a compatibility story or an inspiration story, then adjust markup/copy accordingly.
5. Refresh `AGENTS.md`, `CLAUDE.md`, and the Daft skill reference so future agents preserve the intended API.

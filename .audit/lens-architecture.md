## Architecture Lens Audit

Scope: `/Users/pietz/Private/daftcss`

Focus: architecture, module boundaries, source organization, duplication, generated artifacts, and build cleanliness.

Inspection date: 2026-05-22

## Summary

Daft CSS has a clean core architecture: one explicit `src/daft.css` entrypoint, layered source partials, direct LightningCSS bundling, and reproducible generated output. The main risks are not in the build artifact itself, but in boundary drift around newer features (`sidebar`, `slides`) and a dev workflow gap where watched CSS changes do not reach the docs site that the examples load.

## Findings

### P2: `npm run watch` updates the package build but not the docs build

**Priority:** P2  
**Complexity:** low  
**Validity:** high

**Evidence:**
- `package.json:11` builds `dist/daft.css`, `dist/daft.min.css`, then copies both to `docs/dist/`.
- `package.json:12` watches only `src/daft.css` to `dist/daft.css`.
- `package.json:13` serves the `docs` directory.
- Docs pages load `/dist/daft.css`, for example `docs/index.html:10`, which resolves to `docs/dist/daft.css` when served from `docs`.

**Impact:** During local docs development, `npm run watch` can rebuild `dist/daft.css` while the served examples continue using stale `docs/dist/daft.css`. That makes visual testing unreliable and can hide or invent regressions.

**Suggestion:** Change the watch/dev workflow so the watched output is the same file the docs server serves. Options:
- Add a docs watch script that writes `docs/dist/daft.css`.
- Or run two watch outputs, one to `dist/daft.css` and one to `docs/dist/daft.css`.
- Or make docs load the root `dist` output through the dev server setup instead of maintaining a mirrored copy.

**Validation:** Run the chosen watch script, edit a harmless CSS comment or temporary rule, and confirm the served `docs/dist/daft.css` changes without running the full build.

### P2: Sidebar is owned as a component but performs page layout

**Priority:** P2  
**Complexity:** medium  
**Validity:** high

**Evidence:**
- `src/components/sidebar.css:4` describes the sidebar as a "body-level page/application sidebar".
- `src/components/sidebar.css:15` writes `--sidebar-offset-top` on `body`.
- `src/components/sidebar.css:89` starts desktop placement rules.
- `src/components/sidebar.css:100` to `src/components/sidebar.css:117` changes sibling `header`, `nav`, `main`, and `footer` margins based on sidebar placement.
- `src/layout/grid.css:11` to `src/layout/grid.css:12` points readers to `layout/sidebar.css`, but the file actually lives at `src/components/sidebar.css`.

**Impact:** This blurs the repo's layout/component boundary. Future sidebar changes may accidentally mix global document layout, component appearance, and mobile drawer behavior in one module, which makes cascade ordering and ownership harder to reason about.

**Suggestion:** Move or split ownership:
- Put body placement, sibling margins, and offset rules in `src/layout/sidebar.css` imported in the `layout` layer.
- Keep sidebar internals, link styling, labels, and `.sidebar-toggle` affordances in `src/components/sidebar.css`.
- Update the stale grid comment after the boundary is explicit.

**Validation:** Build and visually smoke-test the documented sidebar examples at desktop and mobile widths, especially the two placement modes.

### P2: The `slides` layer is real source architecture but absent from project guidance

**Priority:** P2  
**Complexity:** low  
**Validity:** high

**Evidence:**
- `src/daft.css:8` defines the layer order as `tokens, reset, base, layout, content, forms, components, slides, utilities`.
- `src/daft.css:53` to `src/daft.css:54` imports `src/slides/slides.css` into the `slides` layer.
- `AGENTS.md:34` documents the layer order without `slides`.
- `AGENTS.md:39` to `AGENTS.md:44` documents the source structure without `src/slides/`.

**Impact:** Contributors following the repo guidance will miss one cascade layer and one source directory. That increases the chance of putting slide-related fixes in utilities/components or changing layer order without realizing that slides intentionally sits after components and before utilities.

**Suggestion:** Update `AGENTS.md` and the equivalent maintainer docs to include `slides`. Also decide whether slides is a first-class part of the framework or an optional/prototype bundle. If optional, consider a separate entrypoint such as `src/daft-slides.css` so app users do not inherit deck-specific selectors by default.

**Validation:** Confirm the documented layer list exactly matches `src/daft.css`, then run a build and inspect that `@layer slides` still appears between components and utilities.

### P2: Utility ownership is broad enough to duplicate layout responsibilities

**Priority:** P2  
**Complexity:** medium  
**Validity:** high

**Evidence:**
- `src/utilities/helpers.css` is 391 lines and covers color modifiers, visibility, text, sticky/glass surfaces, flex layout, spacing, overflow, borders, backgrounds, shadows, interaction, transitions, animation, and print rules.
- Layout primitives live in utilities: `.flex` at `src/utilities/helpers.css:143`, `.cluster` at `src/utilities/helpers.css:153`, `.stack` at `src/utilities/helpers.css:160`, gaps at `src/utilities/helpers.css:182` to `src/utilities/helpers.css:203`, and margin/padding helpers at `src/utilities/helpers.css:211` to `src/utilities/helpers.css:249`.
- `.overflow-auto` is defined in `src/layout/overflow.css:6`, extended in `src/layout/overflow.css:16`, referenced by table styles at `src/components/table.css:82`, and redefined in `src/utilities/helpers.css:253`.

**Impact:** The repo's principle is "a few well-chosen classes, not a utility framework", but `helpers.css` is becoming a catch-all utility layer. The duplicate `.overflow-auto` ownership means behavior depends on layer order, and future helpers can quietly override layout modules.

**Suggestion:** Draw a sharper line:
- Keep semantic one-off helpers in `utilities`.
- Move layout primitives (`stack`, `cluster`, gaps, flex alignment) to `src/layout/` if they are considered part of the layout API.
- Give `.overflow-auto` one owner. If utilities should expose the class, move table-specific behavior out of `layout/overflow.css` or rename the layout wrapper to avoid collision.
- Consider splitting `helpers.css` into focused files once the API categories are stable.

**Validation:** After any split, compare generated CSS order and run docs examples that use `.overflow-auto`, `.stack`, `.cluster`, `.sticky`, and `.glass`.

### P3: Documentation advertises a `--secondary` token that source does not define

**Priority:** P3  
**Complexity:** low  
**Validity:** high

**Evidence:**
- `DOCS.md:97` lists `--secondary` as "Secondary button background".
- `DOCS.md:111` says `--accent`, `--secondary`, and `--muted` are exposed as separate knobs.
- `src/base/variables.css:41` to `src/base/variables.css:47` defines semantic colors but has no `--secondary`.
- `src/base/variables.css:115` to `src/base/variables.css:117` defines `--accent` and `--accent-foreground`.
- The secondary button variant uses `var(--accent)` at `src/components/button.css:70` to `src/components/button.css:72`.

**Impact:** Users who override `--secondary` will see no effect. This is a source/docs contract drift, and it matters because design tokens are the main customization API.

**Suggestion:** Either add a real `--secondary` / `--secondary-foreground` token and wire `.secondary` variants to it, or update docs to say secondary variants currently use `--accent`.

**Validation:** Add a tiny docs/example snippet or visual check where overriding the documented secondary token visibly changes a secondary button.

### P3: Stray generated/scratch artifacts are visible in the working tree

**Priority:** P3  
**Complexity:** low  
**Validity:** high

**Evidence:**
- `git status --short --ignored --untracked-files=all` reports untracked `.antigravitycli/7fa823cc-fafc-4c14-9c98-924fa3c8e46f.json`.
- The same status reports untracked `docs/index-peer.html`.
- `docs/index-peer.html:182` shows badge version `1.12.2` while `package.json:3` and `src/daft.css:2` are `1.12.3`.
- `docs/index-peer.html:721` also shows `v1.12.2`.

**Impact:** Untracked docs-like pages and tool directories create audit noise and can confuse local preview behavior. The stale version in `docs/index-peer.html` suggests it is either an abandoned generated artifact or a page that skipped the release/version workflow.

**Suggestion:** Decide whether these are intentional:
- If `docs/index-peer.html` is needed, track it and include it in the version bump checklist.
- If it is scratch output, move it outside `docs/` or add a targeted ignore.
- Add `.antigravitycli/` to `.gitignore` if that directory is local tooling state.

**Validation:** `git status --short --ignored --untracked-files=all` should show only expected ignored dependencies and no docs-like scratch files.

## Build Cleanliness Notes

- Rebuilding with `./node_modules/.bin/lightningcss --bundle src/daft.css -o /tmp/daft-audit.css` matched `dist/daft.css`.
- Rebuilding with `./node_modules/.bin/lightningcss --bundle --minify src/daft.css -o /tmp/daft-audit.min.css` matched `dist/daft.min.css`.
- `dist/daft.css` and `docs/dist/daft.css` are byte-identical; same for the minified files.
- The built CSS preserves modern syntax such as `light-dark()`, `:has()`, `:popover-open`, and `@starting-style`; no `--lightningcss-light/dark` fallback expansion was observed.

## Recommended Next Steps

1. Fix the watch/docs output mismatch first; it directly affects daily development confidence.
2. Make the sidebar boundary explicit, either by moving it into layout or splitting layout behavior from component styling.
3. Update project guidance for the `slides` layer and decide whether slides belongs in the default framework bundle.
4. Resolve the `--secondary` token contract drift before users start depending on the documented knob.
5. Clean up or ignore local/generated artifacts so future audits and releases start from a quieter tree.

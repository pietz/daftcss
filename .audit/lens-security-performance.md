# Security, Performance, Compatibility, and Build Risk Lens

Scope: `/Users/pietz/Private/daftcss`

Focus: CSS feature compatibility, output size, risky selectors, accessibility-sensitive component behavior, build configuration, supply-chain exposure, and generated docs/dist consistency.

## Findings

### P1: Popover-backed "modals" are documented as modal, but Popover API behavior is non-modal

**Priority:** P1 | **Category:** compatibility / accessibility | **Complexity:** medium | **Validity:** high

**Location:** `src/components/modal.css:3`, `DOCS.md:739`, `README.md:225`, `skills/daftcss/SKILL.md:33`, `docs/components/index.html:789`

**Evidence:**
- `src/components/modal.css:3-7` says the component supports "no-JS modals" and marks `<dialog popover>` as the preferred no-JS path.
- `DOCS.md:739-765`, `README.md:225-238`, `skills/daftcss/SKILL.md:33`, and the components demo all teach `<button popovertarget="...">` plus `<dialog popover>` as the modal pattern.
- MDN documents Popover API popovers as non-modal; `<dialog popover>` is valid, but it combines popover control with dialog semantics rather than `showModal()` modal behavior.

**Impact:** Users can reasonably put destructive confirmations, auth prompts, checkout steps, or other blocking flows into this pattern and assume the background is inert and focus is constrained. With popover behavior, the rest of the page can still be reachable/interactable depending on browser and assistive technology behavior. This is an accessibility failure mode and can become a product safety issue for critical confirmations.

**Suggestion:** Split the docs and naming:
- Call `<dialog popover>` a "popover dialog" or "no-JS overlay", not a modal.
- Recommend bare `<dialog>` + `showModal()` for true modal flows.
- Keep Popover API guidance for menus, drawers, teaching UI, and low-risk overlays.
- Update the Daft skill/reference examples so agents do not propagate the current modal pattern into apps.

**Validation:** Add a docs/example check that distinguishes "modal dialog via `showModal()`" from "non-modal popover dialog"; manually verify keyboard tab order and background interaction in Chrome, Firefox, and Safari.

### P2: ARIA state selectors create disabled-looking controls without disabling keyboard activation

**Priority:** P2 | **Category:** accessibility / security-sensitive behavior | **Complexity:** low | **Validity:** high

**Location:** `src/components/button.css:49`, `src/components/loading.css:14`

**Evidence:**
- `src/components/button.css:49-53` styles both real `:disabled` controls and `[aria-disabled="true"]` with `pointer-events: none`, reduced opacity, and a disabled cursor.
- `src/components/loading.css:14-17` applies `pointer-events: none` to every `[aria-busy="true"]` element.
- `pointer-events: none` only blocks pointer input; it does not make an element disabled, remove it from the tab order, or prevent Enter/Space activation on focusable controls.

**Impact:** A busy or aria-disabled button can look non-interactive to mouse users while remaining keyboard-activatable. In forms and commerce-like flows, this can cause duplicate submissions or actions that the UI visually claims are unavailable.

**Suggestion:** Treat these selectors as visual states only:
- Keep `:disabled` as the true blocking path for native controls.
- Document that `[aria-disabled="true"]` and `[aria-busy="true"]` require an application-level click/submit guard.
- Consider narrowing `pointer-events: none` to native disabled controls, or add docs examples that pair busy submit buttons with `disabled aria-busy="true"`.

**Validation:** Add a small regression page or Playwright check that tabs to `button[aria-busy="true"]` and verifies whether Enter/Space can still fire a handler; document the intended outcome.

### P2: Components docs execute third-party CDN JavaScript without SRI or a pinned immutable URL

**Priority:** P2 | **Category:** security / supply chain | **Complexity:** low | **Validity:** high

**Location:** `docs/components/index.html:12`

**Evidence:**
- `docs/components/index.html:12-14` loads Highlight.js CSS and JavaScript from `https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/...`.
- `docs/components/index.html:15` executes `hljs.highlightAll()` inline.
- The CDN URL is major-version scoped (`@11`) and has no `integrity` or `crossorigin` attributes.

**Impact:** A compromised CDN response, compromised upstream release artifact, or unexpected major-line update can execute JavaScript in the docs origin. For a static CSS framework site this is the highest concrete web-security exposure found.

**Suggestion:** Prefer one of:
- Vendor the Highlight.js assets into `docs/`.
- Use an exact immutable version and add SRI hashes with `crossorigin="anonymous"`.
- Add a restrictive Content Security Policy for docs pages.
- If highlighting is nonessential, remove the runtime JS and rely on static `<pre><code>` styling.

**Validation:** Re-run docs locally after vendoring/pinning and verify the component examples still render highlighted code. Add a grep/CI check for remote `<script src="https://...">` without SRI.

### P2: Compatibility floor depends on very new top-layer/discrete-transition features without an automated guard

**Priority:** P2 | **Category:** compatibility / build risk | **Complexity:** medium | **Validity:** medium-high

**Location:** `src/components/sidebar.css:125`, `src/components/modal.css:69`, `docs/index.html:699`

**Evidence:**
- `src/components/sidebar.css:125-148` uses `[popover]:popover-open`, `overlay ... allow-discrete`, `display ... allow-discrete`, and `@starting-style` for the mobile sidebar.
- `src/components/modal.css:69-71` depends on `dialog[popover]:popover-open`.
- `docs/index.html:699-700` says Chrome 123+, Firefox 129+, Safari 18+ are supported and that the required features "all ... shipped together in early 2024".
- Current MDN pages describe `@starting-style` as Baseline 2024 since August 2024 and Popover API as Baseline 2025 with varying support details.

**Impact:** The support target may be acceptable, but the docs overstate availability and the build has no compatibility smoke test to catch accidental use of a feature outside the declared matrix. Because the build intentionally preserves modern CSS, unsupported features silently degrade at runtime rather than failing in CI.

**Suggestion:** Add a tracked compatibility checklist for the declared target browsers:
- `light-dark()`, OKLCH, `color-mix()`, CSS nesting, `:has()`, Popover API, `:popover-open`, `@starting-style`, `transition-behavior: allow-discrete`, `overlay`, container query units.
- Update docs wording from "all shipped together in early 2024" to a precise support matrix.
- Add browser smoke tests for docs/components modal and mobile sidebar in at least Chromium, Firefox, and WebKit.

**Validation:** Use Playwright/agent-browser or BrowserStack to open the modal and mobile sidebar demos in the minimum supported browser versions and verify visibility, keyboard close, backdrop, and layout behavior.

### P3: Build metadata is slightly stale and build tooling can float across Lightning CSS releases

**Priority:** P3 | **Category:** build / supply chain | **Complexity:** low | **Validity:** high

**Location:** `package.json:23`, `package-lock.json:3`, `package-lock.json:25`, `package.json:13`

**Evidence:**
- `package.json:3` declares `1.12.3`, but `package-lock.json:3` and `package-lock.json:9` still declare `1.9.0`.
- `package.json:24` allows `lightningcss-cli` `^1.28.0`; the lock currently resolves `1.30.2` at `package-lock.json:25-28`.
- `package.json:13` uses `npx serve docs`, which can fetch an unpinned CLI at execution time.

**Impact:** The current build output is reproducible with the checked-in lock, but release metadata is drifting and future local installs can pick up a newer Lightning CSS minor. For this project, small changes in Lightning CSS parsing/minification matter because the public contract is "bundle/minify only, preserve modern CSS."

**Suggestion:** Refresh the lockfile version metadata, use `npm ci` in release/CI, and consider pinning `lightningcss-cli` exactly. Add `serve` as a dev dependency or pin the `npx` invocation if `npm run dev` is part of documented workflows.

**Validation:** After metadata cleanup, run `npm ci`, rebuild to a temp directory, and compare generated CSS against committed `dist/` and `docs/dist/`.

## Verified Checks

- `npm audit --audit-level=moderate --package-lock-only` found `0 vulnerabilities`.
- A temp Lightning CSS build matched committed output exactly:
  - `dist/daft.css`: `77,146` bytes
  - `dist/daft.min.css`: `58,939` bytes
- `dist/daft.css` and `docs/dist/daft.css` are byte-identical.
- `dist/daft.min.css` and `docs/dist/daft.min.css` are byte-identical.
- `npm pack --dry-run` includes only `README.md`, `package.json`, `dist/`, and `src/`; docs, examples, `.audit/`, and local untracked files are not included in the package tarball.

## Notes / Non-Findings

- No hardcoded secrets, tokens, auth logic, database code, command execution paths, or server-side input handling were found in the framework source.
- The CSS output size is modest for the framework scope: `58,939` bytes minified and `48.6 kB` package tarball size from `npm pack --dry-run`.
- There are existing untracked paths (`.antigravitycli/`, `docs/index-peer.html`, and `.audit/`). I did not inspect `.antigravitycli/`; `docs/index-peer.html` appears to be an alternate/untracked landing page and contains stale visible version/size labels (`1.12.2`, `57 KB`), but it is not tracked or packaged.

## External References Used

- MDN Popover API: https://developer.mozilla.org/en-US/docs/Web/API/Popover_API
- MDN `popover` attribute: https://developer.mozilla.org/docs/Web/HTML/Global_attributes/popover
- MDN `@starting-style`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40starting-style

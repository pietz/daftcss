# Buttons

## Purpose and semantic contract

Use native `<button>` for actions and `<a href>` for navigation. Add `.button` to a navigation link only when it should have button appearance; this preserves native link semantics. Daft also styles button-type inputs, `[role="button"]`, and dropdown summaries. If a non-button element receives `role="button"`, its behavior must honor the button keyboard contract; do not add the role to an ordinary navigation link merely for appearance.

## Basic example

```html
<button type="button">Save changes</button>
<button class="accent" type="button">Publish with accent</button>
<a class="button" href="/checkout">Checkout</a>
<a class="button accent" href="#schedule">Accent link action</a>
```

## Markup requirements

- Set `type="button"` for a non-submit button inside a form.
- Give an icon-only button an accessible name with `aria-label`.
- Put `.icon` on the icon-only control, never on its SVG. Place the SVG directly inside the control and mark it `aria-hidden="true"` when the control supplies the name.
- For icon plus text, use an ordinary button without `.icon`; direct-child SVG sizing and the button gap already apply.
- Retrieve exact official Lucide paths from [lucide.dev](https://lucide.dev) or an official package. Do not approximate paths or substitute emoji or Unicode glyphs. Daft has no Lucide dependency, though framework users may render official Lucide components as the direct child.
- Use `disabled` for a disabled native button. `[aria-disabled="true"]` receives the visual disabled treatment but does not disable native behavior.
- Prefer a native button over recreating button semantics with `[role="button"]`. If a custom button is unavoidable, implement keyboard activation and state behavior.
- Use `<a class="button" href="…">` for a prominent navigational CTA. Do not add `role="button"`; the destination, open-in-new-tab behavior, context menu, and link accessibility semantics remain native.

```html
<button class="icon ghost" type="button" aria-label="Search">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true">
    <path d="m21 21-4.34-4.34"/>
    <circle cx="11" cy="11" r="8"/>
  </svg>
</button>

<button type="button">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true">
    <path d="m21 21-4.34-4.34"/>
    <circle cx="11" cy="11" r="8"/>
  </svg>
  Search
</button>
```

## Variants and options

- Default: primary. Do not add a `.primary` class.
- `.accent`: solid accent emphasis using `--accent` and `--accent-foreground`.
- `.secondary`: muted secondary surface. `<input type="reset">` is secondary by default.
- `.destructive`: tinted destructive action; its focus ring follows the destructive color.
- `.outline`: bordered background surface.
- `.ghost`: transparent until hover.
- `.link`: link-like action, underlined on hover.
- `.small` and `.large`: compact and roomy heights.
- `.icon`: square, icon-only sizing. Combine with `.small` or `.large`.
- `.full-width`: fills the available inline width.
- `aria-pressed="true"`: selected state for a toggle button or segmented control.
- `aria-current="true"`: current navigation or item state, not a toggle state.

`.accent` is mutually exclusive with `.secondary`, `.destructive`, `.outline`, `.ghost`, and `.link`; those established surface variants take precedence if accidentally combined. State attributes still apply: disabled and busy treatments remain visible, while `aria-pressed="true"` or `aria-current="true"` uses the selected primary recipe. Size, `.icon`, `.full-width`, group, link-button, and dropdown-summary composition all remain supported.

Other variants can combine when their intent is compatible, for example `class="outline secondary"` or `class="ghost destructive"`. On anchors, include `.button` explicitly, such as `class="button accent"`; a variant class alone never turns a link into a button.

Inside a `<form>`, a button fills the form's width by default. Wrap buttons in `<footer>` or `.cluster` for a content-sized action row; `.icon` and `.link` buttons are never stretched. See [forms.md](forms.md#button-width-inside-forms).

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

- `--button-height`, `--button-height-sm`, `--button-height-lg`
- `--button-radius`, `--button-shadow`
- `--primary`, `--primary-foreground`, `--accent`, `--accent-foreground`
- `--secondary`, `--secondary-foreground`, `--destructive`, `--foreground`
- `--focus-ring`, `--focus-ring-destructive`, `--disabled-opacity`, `--icon-size`

## Behavior and accessibility

Buttons and `.button` links have hover and active feedback and a visible focus ring on `:focus-visible`. The solid accent variant mixes toward its foreground for hover/active feedback and uses the accent color for its focus ring. Disabled native buttons do not accept pointer input and render at `--disabled-opacity`. Links have no native disabled state, so Daft does not provide a disabled `.button` anchor variant; render non-interactive text or omit the unavailable link instead. `aria-busy="true"` adds Daft's loading spinner and communicates the busy state, but it does not disable keyboard or programmatic activation. Pair it with `disabled` while a native button submission is unavailable.

## Composition

Use `<div role="group">` to merge adjacent controls. Apply `.small` or `.large` to the group to size its button children. For a toggle or segmented control, use `aria-pressed="true"` on the selected option; reserve `aria-current` for a genuinely current navigation or item state.

```html
<div role="group" aria-label="View">
  <button class="outline" type="button">Day</button>
  <button class="outline" type="button" aria-pressed="true">Week</button>
  <button class="outline" type="button">Month</button>
</div>
```

## Common mistakes

- Do not use `.btn`, `.btn-primary`, or a custom button wrapper. Bare `<button>` is primary.
- Do not use `<a role="button">` merely to get button appearance; use `<a class="button">` for navigation and `<button>` for actions.
- Do not put `disabled` on an anchor or assume `aria-disabled` suppresses link navigation.
- Do not omit an accessible name from an icon-only button.
- Do not put `.icon` on the SVG or on a button that also has visible text.
- Do not use approximate icon paths, emoji, random Unicode glyphs, or Lucide-specific classes as a Daft API.
- Do not rely on `aria-disabled` to prevent a native button action.

# Buttons

## Purpose and semantic contract

Use native `<button>` for actions and `<a href>` for navigation. Daft also styles button-type inputs, `[role="button"]`, and dropdown summaries. If a non-button element receives `role="button"`, its behavior must honor the button keyboard contract; do not add the role to an ordinary navigation link merely for appearance.

## Basic example

```html
<button type="button">Save changes</button>
<button type="submit">Create account</button>
```

## Markup requirements

- Set `type="button"` for a non-submit button inside a form.
- Give an icon-only button an accessible name with `aria-label`.
- Put `.icon` on the icon-only control, never on its SVG. Place the SVG directly inside the control and mark it `aria-hidden="true"` when the control supplies the name.
- For icon plus text, use an ordinary button without `.icon`; direct-child SVG sizing and the button gap already apply.
- Retrieve exact official Lucide paths from [lucide.dev](https://lucide.dev) or an official package. Do not approximate paths or substitute emoji or Unicode glyphs. Daft has no Lucide dependency, though framework users may render official Lucide components as the direct child.
- Use `disabled` for a disabled native button. `[aria-disabled="true"]` receives the visual disabled treatment but does not disable native behavior.
- Prefer a native button over recreating button semantics with `[role="button"]`. If a custom button is unavoidable, implement keyboard activation and state behavior.

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

- Default: primary.
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

Variants can combine when their intent is compatible, for example `class="outline secondary"` or `class="ghost destructive"`.

Inside a `<form>`, a button fills the form's width by default. Wrap buttons in `<footer>` or `.cluster` for a content-sized action row; `.icon` and `.link` buttons are never stretched. See [forms.md](forms.md#button-width-inside-forms).

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

- `--button-height`, `--button-height-sm`, `--button-height-lg`
- `--button-radius`, `--button-shadow`
- `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`
- `--destructive`, `--foreground`, `--accent`
- `--focus-ring`, `--focus-ring-destructive`, `--disabled-opacity`, `--icon-size`

## Behavior and accessibility

Buttons have hover and active feedback, and a visible focus ring on `:focus-visible`. Disabled buttons do not accept pointer input and render at `--disabled-opacity`. `aria-busy="true"` adds Daft's loading spinner and communicates the busy state, but it does not disable keyboard or programmatic activation. Pair it with `disabled` while submission is unavailable.

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
- Do not use `<a role="button">` for an in-page action.
- Do not omit an accessible name from an icon-only button.
- Do not put `.icon` on the SVG or on a button that also has visible text.
- Do not use approximate icon paths, emoji, random Unicode glyphs, or Lucide-specific classes as a Daft API.
- Do not rely on `aria-disabled` to prevent a native button action.

# Forms

## Purpose and semantic contract

Use native `<form>`, `<label>`, `<input>`, `<textarea>`, `<select>`, `<fieldset>`, and `<legend>`. Associate every control with a visible `<label>` unless its accessible name comes from another appropriate mechanism.

## Basic example

```html
<form>
  <label>Email
    <input type="email" name="email" required autocomplete="email">
  </label>
  <small>We use this only for account messages.</small>
  <button type="submit">Continue</button>
</form>
```

## Markup requirements

- Prefer a wrapping label. Daft gives its direct input, select, or textarea the correct label spacing.
- Alternatively, connect separate elements with `for` and `id`; a required indicator is added when the label immediately precedes its required control.
- Group related checkboxes or radios in `<fieldset>` with a `<legend>`. Give radios in one choice set the same `name`.
- Give an unlabeled search field or other icon-only control an `aria-label`.
- A non-search form makes non-icon buttons full width. Use `form role="search"` when the search field and submit button should form an inline, full-width group.

## Variants and options

- Text-like inputs, `<textarea>`, and `<select>` receive the standard input surface. Textarea is vertically resizable.
- `.small` and `.large` work on text-like `<input>` and `<select>`, or on a containing `[role="group"]`.
- `input[type="search"]` is pill-shaped; it makes a containing `[role="group"]` pill-shaped too.
- `input[type="file"]`, `color`, `date`, `datetime-local`, `month`, `time`, and `week` have type-specific styling.
- `select[multiple]` grows to content and drops its chevron.
- `input[type="checkbox"]`, radio, and `checkbox[role="switch"]` are styled natively. Set `role="switch"` on a checkbox, not a class.
- `input[type="range"]` has a themed track and thumb.
- `input:read-only` and `textarea:read-only` use the muted surface.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

- `--input`, `--input-background`, `--input-radius`
- `--input-height`, `--input-height-sm`, `--input-height-lg`
- `--control-size`, `--switch-width`, `--switch-height`, `--switch-thumb`
- `--border`, `--primary`, `--destructive`, `--muted`, `--muted-foreground`
- `--focus-ring`, `--focus-ring-destructive`, `--disabled-opacity`

## Behavior and accessibility

Set validation from application or server logic with `aria-invalid="true"` or `aria-invalid="false"`. Invalid text controls receive a destructive border and ring; valid ones receive a primary border. Following sibling `<small>` help text adopts the matching color.

Daft intentionally does not style native `:invalid` or `:user-invalid`; do not expect browser constraint validation alone to change the presentation. Set `aria-invalid` and provide clear error text. A required control causes its associated label to gain a decorative `*`; the `required` attribute still supplies the semantic requirement. Every wrapping-label marker appears first so it stays clear of full-width controls, multiline checkbox/radio text, and nested help text. A separate label immediately before its control keeps a suffix marker.

Set a partial-selection checkbox only in JavaScript:

```js
document.querySelector('#select-all').indeterminate = true;
```

Disabled controls and disabled fieldsets use reduced opacity. A label around a disabled checkbox or radio also dims.

## Composition

Use `[role="group"]` to join adjacent controls, with `.vertical` or `.full-width` when needed. Direct `code`, `samp`, `kbd`, `span`, or `output` children become muted non-editable addon segments.

### Button width inside forms

A button placed directly in a form fills the form's width, which suits a single stacked submit action. Three cases opt out, so you do not have to fight the default:

- An action row: wrap buttons in `<footer>` or `.cluster` and they size to their content and share a row.
- `.icon` buttons, which stay square.
- `.link` buttons, which are inline text.

```html
<form class="stack max-w-xl">
  <label for="name">Name</label>
  <input id="name" name="name">
  <footer class="cluster justify-end">
    <button class="outline" type="button">Cancel</button>
    <button type="submit">Save</button>
  </footer>
</form>
```

Search forms (`[role="search"]`) keep every button inline.

```html
<div role="group">
  <span>https://</span>
  <input type="text" aria-label="Domain" value="daftcss.dev">
</div>
```

## Common mistakes

- Do not use a placeholder as the only label.
- Do not style error states with native `:invalid`; set `aria-invalid` and render help text.
- Do not use a class to make a switch: use `<input type="checkbox" role="switch">`.
- Do not try to express indeterminate in HTML. Set the DOM property.
- Do not use a generic `<div>` in place of `<fieldset>` and `<legend>` for a related choice set.

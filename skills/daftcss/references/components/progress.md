# Progress

## Purpose and semantic contract

Use native `<progress>` to communicate completion of a task. A progress element with `value` is determinate; one without `value` is indeterminate. Daft renders it as a full-width bar.

## Basic example

```html
<label>
  Uploading files
  <progress value="64" max="100">64%</progress>
</label>

<label>
  Connecting
  <progress></progress>
</label>
```

## Markup requirements

- Use `<progress>`, not a styled `<div>`, when reporting task completion.
- For determinate progress, provide `value`; if you set `max`, it must be greater than zero. Keep `value` within the `0` to `max` range (the native default `max` is `1`).
- Omit `value` when the amount of work is unknown. Daft animates that indeterminate state.
- Give the progress bar an accessible label, preferably by wrapping it in a `<label>` as above. An associated `<label>` receives the intended top spacing before its direct-child progress element.
- Include fallback text such as `64%` inside `<progress>` if it is useful for unsupported environments. Do not depend on it as the visible label in modern browsers.

## Variants and options

| Class | Progress color | Use |
|---|---|---|
| none | `--primary` | Default task progress |
| `.secondary` | `--muted-foreground` | Quiet/secondary progress |
| `.success` | `--success` | Successful or healthy state |
| `.warning` | `--warning` | Attention or caution |
| `.destructive` | `--destructive` | Failure or blocked state |

The bar is `100%` wide, `--spacing-sm` tall, and has an animated width transition for determinate WebKit progress values. It has a bottom margin unless it is the last child.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

- `--progress-radius` controls the track and value radius.
- `--primary`, `--muted-foreground`, `--success`, `--warning`, and `--destructive` supply variant colors.
- `--muted` supplies the track color.
- `--spacing-sm` sets height and label-to-bar spacing.
- `--transition-slow` and `--ease-default` control the determinate transition.

## Behavior and accessibility

Use a visible task label and update `value` and any accompanying textual percentage as work advances. Indeterminate progress conveys activity, not percent complete. Do not communicate success or failure only through the color class.

For loading regions, `aria-busy="true"` can identify the region being updated and Daft shows a spinner for it. It does **not** set a control's native `disabled` state or reliably prevent keyboard or programmatic activation. Daft applies `pointer-events: none` while busy, but controls that must not be used, such as a submitting button, still need `disabled`:

```html
<button disabled aria-busy="true">Saving</button>
```

Remove `aria-busy` and `disabled` when the operation finishes. Do not use an indeterminate progress bar as the only indication that a form control is unavailable.

## Composition

Place a progress element beneath its task label, in a status region, or alongside a concise percentage or remaining-time message. Use `role="status"` for a non-urgent textual update when the message itself should be announced; do not turn every value update into an alert.

## Common mistakes

- Using a generic element instead of native `<progress>`.
- Setting `value` without a meaningful label.
- Using `value="0"` to mean unknown work instead of omitting `value`.
- Treating `aria-busy` as a substitute for `disabled`.
- Using a color variant as the only explanation of an error or warning.

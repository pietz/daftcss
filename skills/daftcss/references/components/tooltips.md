# Tooltips

## Purpose and semantic contract

Use `data-tooltip` for short, supplementary visual help on a control. Daft renders the attribute value in a CSS-generated bubble; it is a visual enhancement, not a programmatic description relationship.

The host must be focusable and have its own accessible name. Do not rely on generated tooltip content for the name or claim that it provides `aria-describedby`-style description semantics.

## Basic example

```html
<button data-tooltip="Save changes">Save</button>
<button aria-label="Help" data-tooltip="Open help" data-placement="right">?</button>
```

## Markup requirements

- Put `data-tooltip` on the focusable host, normally a `<button>` or `<a href>`.
- Give an icon-only host an accessible name, for example `aria-label="Help"`.
- Keep the host's visible label or accessible name meaningful without the tooltip.
- Use the attribute value for brief, plain-text help. It is rendered with `attr(data-tooltip)` and cannot contain markup.

## Variants and options

`data-placement` controls the bubble position:

| Value | Position |
|---|---|
| omitted or `top` | Above the host |
| `bottom` | Below the host |
| `left` | To the left |
| `right` | To the right |

There are no class variants. The tooltip does not auto-flip or avoid viewport edges.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

- `--tooltip-radius`
- `--spacing-sm`, `--spacing-md`
- `--text-xs`, `--font-medium`, `--line-height-sm`
- `--foreground`, `--background`
- `--transition-fast`, `--ease-default`

## Behavior and accessibility

- The bubble appears on pointer hover and `:focus-visible`; it fades by changing opacity.
- The default cursor is `help`; buttons and links use a pointer cursor.
- The bubble ignores pointer events.
- CSS-generated content has no corresponding DOM tooltip element or ARIA relationship. It may not be announced as a description by assistive technology.
- Use visible text, `aria-label`, or an explicit, associated description when the information is necessary to understand or operate the control.

## Composition

Tooltips work on regular buttons, icon buttons, and links. Combine with normal button variants without additional wrapper markup.

```html
<button class="ghost icon" aria-label="Settings"
        data-tooltip="Settings" data-placement="bottom">⚙</button>
```

## Common mistakes

- Putting `data-tooltip` on a non-focusable `<span>` and expecting keyboard access.
- Making an icon-only button understandable only through the tooltip.
- Treating `data-tooltip` as an accessible description or adding `role="tooltip"` without an actual described element.
- Putting essential, long, or interactive content in the attribute.
- Expecting collision handling, multiline layout, or automatic placement changes.

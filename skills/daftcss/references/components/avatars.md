# Avatars

## Purpose and semantic contract

Use `.avatar` for a compact, round representation of a person, account, or other identifiable entity. It accepts initials, an image, or inline SVG. The class supplies presentation only, not an accessible name or interactive behavior.

## Basic example

```html
<span class="avatar" role="img" aria-label="Karin Smith">KS</span>

<span class="avatar">
  <img src="/karin.jpg" alt="Karin Smith">
</span>
```

## Markup requirements

- Apply `.avatar` to a non-interactive inline container, normally `<span>`.
- Place initials directly inside it, or use a direct `<img>` or `<svg>` child. Image and SVG children fill the circle and crop with `object-fit: cover`.
- Give meaningful avatar images an `alt` that identifies the represented person or entity. Use `alt=""` for a decorative duplicate of nearby text.
- When initials convey the identity, expose the full name with `role="img"` and `aria-label`; do not rely on unexplained initials alone.
- Use a real `<button>` or `<a>` around the avatar when it performs an action or navigates. Label an icon-only control.

## Variants and options

| Form | Markup | Effect |
|---|---|---|
| Default | `.avatar` | `--component-height` square |
| Small | `.avatar.small` | `--component-height-sm` square |
| Large | `.avatar.large` | `--component-height-lg` square |
| Photo | `.avatar > img` | Fills and crops to the round container |
| Inline icon | `.avatar > svg` | Fills the round container |

There are no color, status, stack, or fallback-image variants supplied by Daft.

## Relevant tokens

See [foundations.md](../foundations.md#token-api-boundary) for the canonical token taxonomy. The entries below are this component’s main override points and dependencies.

- `--component-height`, `--component-height-sm`, `--component-height-lg` set avatar dimensions.
- `--radius-full` makes the container round.
- `--muted` is the initials background; `--foreground` is its text color.
- `--font-semibold`, `--text-xs`, `--text-sm`, and `--text-base` set initials typography by size.

## Behavior and accessibility

Avatars do not load a fallback or announce status. Provide a reliable image URL and meaningful alternative text where the identity matters. For inline SVG that conveys meaning, give it an accessible name, for example `role="img"` with a `<title>` or `aria-label`; hide purely decorative SVG with `aria-hidden="true"`.

## Composition

Use an avatar next to the visible account name in navigation, cards, lists, or a `role="group"` toolbar. Keep the name in text when possible, so the avatar is supplementary rather than the only identification.

## Common mistakes

- Using `.avatar` as a clickable element instead of a button or link.
- Using initials without an accessible full name when they are the only identifier.
- Repeating a name in `alt` when the adjacent visible name already identifies the person and the image is decorative.
- Expecting `.avatar` to provide presence, verification, fallback, or avatar-stack behavior.

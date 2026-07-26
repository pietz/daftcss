# Utilities

Load this reference only when semantic elements, component options, and the layout primitives do not express a small local adjustment.

Daft includes a limited helper set. It is not a utility-first framework.

## Preferred order

1. Native semantic HTML
2. Component variant or state
3. `.container`, `.grid`, `.cluster`, or `.stack`
4. A small documented utility
5. Application CSS when the requirement is genuinely project-specific

Avoid long utility chains. They obscure the semantic-first API and usually indicate that a reusable block or application component is missing.

## Typography

- Color: `.muted`
- Size: `.text-xs`, `.text-sm`, `.text-base`, `.text-lg`, `.text-xl`, `.text-2xl`, `.text-3xl`, `.text-4xl`, `.text-5xl`, `.text-6xl`
- Weight: `.font-normal`, `.font-medium`, `.font-semibold`, `.font-bold`
- Alignment: `.text-left`, `.text-center`, `.text-right`

Muted links can use `a.secondary`.

## Visibility

- `.hidden`: removed from layout
- `.invisible`: occupies layout but is not visible
- `.sr-only`: visually hidden while remaining available to assistive technology
- `.hidden-mobile`: hidden below 768px
- `.hidden-desktop`: hidden at 768px and above
- `.no-print`: omitted from print output

Do not use visibility utilities to conceal content that remains necessary to understand or operate the page.

## Flex and flow

- Display: `.flex`, `.flex-col`
- Alignment: `.items-center`
- Distribution: `.justify-center`, `.justify-between`, `.justify-end`
- Gaps: `.gap-1`, `.gap-2`, `.gap-3`, `.gap-4`, `.gap-6`, `.gap-8`
- Purpose-built flow: `.cluster`, `.stack`

Prefer `.cluster` for a wrapping row and `.stack` for a vertical sequence.

## Width and height

- Width: `.w-full`
- Maximum width: `.max-w-xs`, `.max-w-sm`, `.max-w-md`, `.max-w-lg`, `.max-w-xl`, `.max-w-2xl`, `.max-w-3xl`
- Maximum height: `.max-h-xs`, `.max-h-sm`, `.max-h-md`, `.max-h-lg`, `.max-h-xl`, `.max-h-2xl`, `.max-h-3xl`

## Spacing

- Reset: `.m-0`, `.p-0`
- Center: `.mx-auto`
- Auto margins: `.mt-auto`, `.mb-auto`, `.ml-auto`, `.mr-auto`
- Top: `.mt-4`, `.mt-6`, `.mt-8`, `.mt-16`, `.mt-24`
- Bottom: `.mb-4`, `.mb-6`, `.mb-8`
- Vertical: `.my-4`
- Padding: `.p-4`, `.p-6`

The numeric suffixes name positions on Daft's spacing scale, not literal pixels.

## Overflow and truncation

- `.overflow-auto`: scroll overflowing content on either axis
- `.overflow-hidden`: clip overflow
- `.truncate`: single-line ellipsis

Add `tabindex="0"` to an intentionally scrollable content region when it has no focusable descendants and keyboard users need to reach the overflow.

## Radius and borders

- Radius: `.rounded-none`, `.rounded-sm`, `.rounded`, `.rounded-lg`, `.rounded-xl`, `.rounded-full`
- Border: `.border`, `.border-t`, `.border-r`, `.border-b`, `.border-l`, `.border-none`

Prefer component radius tokens when changing every instance of a component. Utilities are for local exceptions.

## Surfaces and shadows

- Background: `.bg-card`, `.bg-muted`, `.bg-transparent`
- Shadow: `.shadow-none`, `.shadow-sm`, `.shadow`, `.shadow-lg`
- Glass surface: `.glass`

`.glass` supplies a translucent background and backdrop blur. It commonly pairs with `.sticky`, but verify contrast against the content passing behind it.

## Position and interaction

- `.sticky`
- `.cursor-pointer`, `.cursor-not-allowed`
- `.pointer-events-none`
- `.select-none`

These helpers change presentation or pointer behavior, not semantics. For example, `.pointer-events-none` does not disable keyboard activation; use the native `disabled` attribute for form controls.

## Motion

- `.transition`, `.transition-none`
- `.animate-spin`, `.animate-pulse`

Under `prefers-reduced-motion: reduce`, Daft forces animation and transition durations to `0.01ms`, limits animations to one iteration, and disables smooth scrolling.

## Related references

- [layout.md](layout.md) for composition guidance
- [foundations.md](foundations.md) for spacing, radius, and motion tokens

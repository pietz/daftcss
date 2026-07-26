# Daft Blocks

Blocks are reusable page sections assembled from Daft primitives. Load only the block group that matches the page area being built.

## Workflow

1. Pick the closest existing block.
2. Replace its placeholder content with the product's real information and actions.
3. Load individual component references for behavior or variants used inside it.
4. Retune root tokens when the whole composition needs a different feel.
5. Add application CSS only for a product requirement the primitives cannot express.

## Marketing blocks

Load [blocks/marketing.md](blocks/marketing.md) for:

- Centered landing hero
- Reservation hero
- Feature grid
- How-it-works steps
- FAQ accordion
- Final CTA
- Pricing cards

## Application blocks

Load [blocks/application.md](blocks/application.md) for:

- Sticky top-navigation shell
- Sidebar application shell
- Workspace browser
- Dashboard statistic cards
- Settings form
- Empty state
- Status panel

## Content and documentation blocks

Load [blocks/content.md](blocks/content.md) for:

- Documentation section header
- Changelog list
- Comparison table
- Code snippet card

## Composition rules

- Preserve semantic landmarks and controls from the chosen skeleton.
- Use `.container`, `.container-fluid`, `.grid`, `.span-*`, `.cluster`, and `.stack` for composition.
- Use `<article>` for self-contained cards; there is no `.card` class.
- Keep navigation as links and actions as buttons.
- Keep copy, labels, statuses, and data specific to the product. Decorative mockups are not a substitute for real content.

## Related references

- [layout.md](layout.md) for layout behavior and responsive composition
- [theming.md](theming.md) for changing visual character through tokens
- [Component catalog](../SKILL.md#component-catalog) for the primitives used inside blocks

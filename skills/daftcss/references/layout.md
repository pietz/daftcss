# Layout

Load this reference for page shells, containers, grids, responsive composition, and overflow.

## Page landmarks

Prefer native landmarks before generic wrappers:

```html
<body>
  <header>...</header>
  <main class="container">...</main>
  <footer>...</footer>
</body>
```

Daft applies document spacing and section rhythm to semantic landmarks. Use `<section>` for a titled region, `<aside>` for complementary content, and `<nav>` for major navigation.

## Containers

```html
<main class="container">Centered, readable maximum width</main>
<main class="container-fluid">Full width with responsive edge padding</main>
```

- `.container` sets a responsive width, centers itself, and limits line length.
- `.container-fluid` spans the available width while preserving page gutters.
- Either class can wrap navigation content when the outer `<nav>` needs a full-width surface.

## Grid

`.grid` gives each direct child one equal track. It stacks to one column below 768px.

```html
<div class="grid">
  <article>One</article>
  <article>Two</article>
  <article>Three</article>
</div>
```

Articles remain cards in a grid by default. Use `article.plain` when a semantic article should participate in the grid without a card surface or card-specific internal layout.

Use `.span-2`, `.span-3`, or `.span-4` on a direct child to give it a weighted share:

```html
<div class="grid">
  <aside>Navigation</aside>
  <main class="span-2">Twice the share</main>
</div>
```

Spans are weights, not a fixed 12-column system. For multiple rows, use one grid per row rather than assuming implicit row alignment.

## Flow primitives

### Cluster

A wrapping horizontal row with centered items and a small gap:

```html
<div class="cluster">
  <button>Save</button>
  <button class="outline">Cancel</button>
</div>
```

Use for toolbars, badge rows, header actions, and other peer controls.

### Stack

A vertical flow with the default spacing gap:

```html
<div class="stack">
  <label>Name <input name="name"></label>
  <label>Email <input type="email" name="email"></label>
</div>
```

Use for form fields, vertically separated cards, and list-like content.

## Flex escape hatches

Use these only when `.cluster`, `.stack`, or `.grid` is not the right semantic shape:

- `.flex`, `.flex-col`
- `.items-center`
- `.justify-center`, `.justify-between`, `.justify-end`
- `.gap-1`, `.gap-2`, `.gap-3`, `.gap-4`, `.gap-6`, `.gap-8`

Do not recreate a utility-first layout system in markup. If a pattern repeats across a page, prefer a Daft block or a small application-level component.

## Width and alignment

- `.w-full` makes an element fill its containing block.
- `.max-w-xs` through `.max-w-3xl` constrain readable or focused content.
- `.mx-auto` centers a constrained block.
- `.ml-auto`, `.mr-auto`, `.mt-auto`, `.mb-auto` push flex items.

A `max-width` does not itself make an inline or shrink-to-fit element responsive. Pair it with `.w-full` or a component's documented full-width variant when necessary.

## Overflow

```html
<div class="overflow-auto" tabindex="0">
  <table>...</table>
</div>
```

`.overflow-auto` permits scrolling on both axes and removes the table's trailing margin when it directly wraps a table. Make an intentionally scrollable region keyboard-focusable when keyboard users otherwise cannot reach its overflow.

Use `.overflow-hidden` only when clipped content is decorative or available elsewhere. Use `.truncate` for a single-line ellipsis when the full value remains available through context or an accessible label.

## Responsive behavior

- Grids become one column below 768px.
- Ordinary navigation items wrap rather than hiding or clipping controls.
- Opt-in sticky `.top-nav-menu` lists switch to their Popover panel behavior below 768px.
- Sidebars switch to their Popover-based drawer behavior below 768px.
- `.hidden-mobile` hides below 768px; `.hidden-desktop` hides at 768px and above.

Do not hide essential actions solely to preserve a one-row layout. Use ordinary wrapping or the documented native [responsive top-navigation pattern](components/navigation.md).

## Related references

- [navigation.md](components/navigation.md)
- [sidebar.md](components/sidebar.md)
- [groups.md](components/groups.md)
- [blocks.md](blocks.md) for composed page sections and shells
- [utilities.md](utilities.md) for the complete helper list

# Marketing Blocks

Load this reference for landing pages, signup pages, pricing, and conversion sections. Pick the closest block and adapt its real content rather than inventing a new layout.

## Centered Landing Hero

Use for product homepages and signup pages.

Rules:
- Use `section.text-center.mt-24`.
- Use `h1.text-6xl.mx-auto.max-w-2xl`.
- Use `p.muted.mx-auto.max-w-xl` for subtitle.
- Use `.cluster.justify-center` for badges and actions.
- Do not write custom hero CSS unless explicitly requested.

Skeleton:
```html
<section class="text-center mt-24">
  <div class="cluster justify-center mb-4">
    <span class="badge outline">Open files</span>
    <span class="badge outline">No build</span>
    <span class="badge outline">No JS</span>
  </div>
  <h1 class="text-6xl mx-auto max-w-2xl">Your headline here.</h1>
  <p class="muted mx-auto max-w-xl">One paragraph explaining the product in concrete terms.</p>
  <div class="cluster justify-center mt-8">
    <a class="button" href="/signup">Start free</a>
    <a class="button secondary" href="/docs">View docs</a>
  </div>
</section>
```

Mistakes:
- Do not wrap the hero in `.hero-card`.
- Do not add background blobs, fake screenshots, or terminal mockups by default.
- Do not use `.btn-primary` or add `role="button"` to a navigation link. Use `<a class="button">` for a navigational CTA and `<button>` for an action.

## Reservation Hero

Use when the main action is claiming a name, joining a waitlist, or submitting an email.

Rules:
- Keep the form in `role="group"`.
- Use a label or `aria-label` for the input.
- Keep the group constrained with `.max-w-xl.mx-auto`.

Skeleton:
```html
<section class="text-center mt-16">
  <span class="badge">Private beta</span>
  <h1 class="text-5xl mx-auto max-w-2xl">Reserve your workspace name.</h1>
  <p class="muted mx-auto max-w-xl">Claim a public handle before launch.</p>
  <div role="group" class="mx-auto max-w-xl mt-8">
    <span>daft.dev/</span>
    <input type="text" placeholder="workspace" aria-label="Workspace name">
    <button>Reserve</button>
  </div>
</section>
```

Mistakes:
- Do not use inline width styles on the input.
- Do not build a custom input/button wrapper when `role="group"` exists.

## Feature Grid

Use for marketing features, benefits, capabilities, and product pillars.

Rules:
- Use a centered section header.
- Use `.grid` with one `<article>` per feature.
- Keep feature titles short and concrete.

Skeleton:
```html
<header class="text-center mx-auto max-w-xl mb-8">
  <p class="label">Features</p>
  <h2>Everything is just HTML.</h2>
  <p class="muted">Use article cards in a grid.</p>
</header>
<div class="grid">
  <article>
    <span class="badge outline">01</span>
    <h3>Semantic defaults</h3>
    <p>Buttons, forms, tables, cards, and dialogs render without wrappers.</p>
  </article>
  <article>...</article>
  <article>...</article>
</div>
```

Mistakes:
- Do not create `.feature-card`.
- Do not use custom CSS grid declarations.

## How-It-Works Steps

Use for onboarding, setup, process, and workflow sections.

Rules:
- Use `.grid`.
- Use badges for step numbers.
- Prefer 3 to 4 steps.

Skeleton:
```html
<header class="mx-auto max-w-xl text-center mb-8">
  <p class="label">Workflow</p>
  <h2>Three steps from blank page to UI.</h2>
</header>
<div class="grid">
  <article>
    <span class="badge">1</span>
    <h3>Link the CSS</h3>
    <p>Add one stylesheet to the document head.</p>
  </article>
  <article>...</article>
  <article>...</article>
</div>
```

Mistakes:
- Do not draw custom timelines unless the user asked for a timeline.
- Do not use div-only step cards.

## FAQ Accordion

Use for common questions, objections, and support content.

Rules:
- Use native `<details>` and `<summary>`.
- Keep it in `.max-w-2xl.mx-auto` for readable line length.
- Open only the first item by default, if any.

Skeleton:
```html
<section class="max-w-2xl mx-auto">
  <header class="text-center mb-8">
    <p class="label">FAQ</p>
    <h2>Questions before you start?</h2>
  </header>
  <details open>
    <summary>Does this require JavaScript?</summary>
    <p>No. Daft components use native HTML whenever possible.</p>
  </details>
  <details>
    <summary>Can I change the visual style?</summary>
    <p>Yes. Change root CSS variables.</p>
  </details>
</section>
```

Mistakes:
- Do not implement an accordion with JavaScript.
- Do not invent `.accordion-item`.

## Final CTA

Use near the end of landing pages and docs pages.

Rules:
- Keep it short.
- Use an `<article>` when the CTA should have a card surface.
- Use `.cluster.justify-center` for actions.

Skeleton:
```html
<section class="text-center">
  <article>
    <h2>Ready to build without a component stack?</h2>
    <p class="muted mx-auto max-w-xl">Start with semantic HTML.</p>
    <footer class="cluster justify-center">
      <a class="button" href="/signup">Get started</a>
      <a class="button secondary" href="/docs">Read docs</a>
    </footer>
  </article>
</section>
```

Mistakes:
- Do not add decorative background CSS.
- Do not use vague copy like "supercharge your workflow" without specifics.

## Pricing Cards

Use for simple SaaS pricing and plan comparison.

Rules:
- Use `.grid` with `<article>` cards.
- Use badges for plan labels like "Popular".
- Use a table instead if detailed comparison matters more than plan cards.

Skeleton:
```html
<header class="text-center mx-auto max-w-xl mb-8">
  <p class="label">Pricing</p>
  <h2>Start small, upgrade when needed.</h2>
</header>
<div class="grid">
  <article>
    <header>
      <strong>Starter</strong>
      <p>For prototypes and small sites.</p>
    </header>
    <p class="text-4xl"><strong>$0</strong> <small class="muted">/mo</small></p>
    <ul>
      <li>One project</li>
      <li>Community support</li>
    </ul>
    <footer><a class="button" href="/signup">Start</a></footer>
  </article>
  <article>...</article>
</div>
```

Mistakes:
- Do not create `.pricing-card`.
- Do not use nested cards.

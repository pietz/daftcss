# Quick Start

Load this reference when starting a Daft page from scratch or when the installation and basic authoring shape are unfamiliar.

## Install

```html
<link rel="stylesheet" href="https://unpkg.com/daftcss@1/dist/daft.min.css">
```

## Minimal page

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <link rel="stylesheet" href="https://unpkg.com/daftcss@1/dist/daft.min.css">
    <title>App</title>
  </head>
  <body>
    <main class="container">
      <section>
        <hgroup>
          <h1>Projects</h1>
          <p>Recent work across your team.</p>
        </hgroup>
        <button>New project</button>
      </section>
    </main>
  </body>
</html>
```

## Common semantic shapes

```html
<!-- Card: no .card class -->
<article>
  <header><strong>Project name</strong></header>
  <p>Card content</p>
  <footer><button>Open</button></footer>
</article>

<!-- Labeled form control -->
<label>Email <input type="email" name="email" required></label>

<!-- Native disclosure -->
<details>
  <summary>More information</summary>
  <p>Details revealed without JavaScript.</p>
</details>

<!-- Joined controls -->
<div role="group">
  <input name="query" aria-label="Search">
  <button>Search</button>
</div>
```

Load the relevant component reference before adding variants, validation, modal behavior, or accessibility-sensitive interaction.

import { expect, test } from "@playwright/test";
import { discoverHtmlRoutes } from "./docs-routes.js";

test.beforeEach(async ({ context }) => {
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === "http://127.0.0.1:4175") await route.continue();
    else await route.abort();
  });
});

for (const path of discoverHtmlRoutes()) {
  test(`navigation and page content remain usable at 375px on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(path);

    const layout = await page.evaluate(() => {
      const navigation = document.querySelector("body > nav, body > header > nav");
      const targets = navigation
        ? [...navigation.querySelectorAll("a[href], button, input, select, summary")]
          .filter((element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            const visible = typeof element.checkVisibility === "function"
              ? element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
              : style.visibility !== "hidden" && style.display !== "none";
            return visible && rect.width > 0 && rect.height > 0;
          })
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              label: element.getAttribute("aria-label") || element.textContent.trim() || element.tagName,
              bottom: rect.bottom,
              left: rect.left,
              right: rect.right,
              top: rect.top,
            };
          })
        : [];

      const overlaps = [];
      for (let first = 0; first < targets.length; first += 1) {
        for (let second = first + 1; second < targets.length; second += 1) {
          const a = targets[first];
          const b = targets[second];
          if (Math.min(a.right, b.right) > Math.max(a.left, b.left)
              && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top)) {
            overlaps.push(`${a.label} overlaps ${b.label}`);
          }
        }
      }

      return {
        documentWidth: document.documentElement.scrollWidth,
        navigationWidth: navigation?.scrollWidth ?? 0,
        overlaps,
        viewportWidth: innerWidth,
      };
    });

    expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.navigationWidth).toBeLessThanOrEqual(layout.viewportWidth);
    expect(layout.overlaps).toEqual([]);
  });
}

test("image submit controls retain their intrinsic control dimensions", async ({ page }) => {
  await page.goto("/components/");

  const styles = await page.evaluate(() => {
    const input = document.createElement("input");
    input.type = "image";
    input.width = 24;
    input.height = 16;
    document.body.append(input);
    const computed = getComputedStyle(input);
    return {
      borderWidth: computed.borderWidth,
      height: computed.height,
      padding: computed.padding,
      width: computed.width,
    };
  });

  expect(styles).toEqual({ borderWidth: "0px", height: "16px", padding: "0px", width: "24px" });
});

test("aria-disabled buttons keep pointer behavior for application logic", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    const button = document.createElement("button");
    button.setAttribute("aria-disabled", "true");
    button.textContent = "Managed disabled action";
    let activations = 0;
    button.addEventListener("click", () => { activations += 1; });
    document.body.append(button);
    button.click();
    const style = getComputedStyle(button);
    return { activations, cursor: style.cursor, pointerEvents: style.pointerEvents };
  });

  expect(result).toEqual({ activations: 1, cursor: "not-allowed", pointerEvents: "auto" });
});

test("the modal width token controls bare and article dialog surfaces", async ({ page }) => {
  await page.goto("/components/");

  const widths = await page.evaluate(() => {
    document.documentElement.style.setProperty("--modal-max-width", "20rem");
    const bare = document.createElement("dialog");
    bare.textContent = "Bare dialog";
    const wrapped = document.createElement("dialog");
    wrapped.innerHTML = "<article>Wrapped dialog</article>";
    document.body.append(bare, wrapped);
    bare.show();
    wrapped.show();
    return {
      article: getComputedStyle(wrapped.firstElementChild).maxWidth,
      bare: getComputedStyle(bare).maxWidth,
    };
  });

  expect(widths).toEqual({ article: "320px", bare: "320px" });
});

test("a fluid sidebar canvas retains horizontal gutters", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/components/");

  const gutters = await page.evaluate(() => {
    document.body.innerHTML = `
      <aside class="sidebar"><nav><ul><li><a href="#">Overview</a></li></ul></nav></aside>
      <main class="container-fluid"><article>Application content</article></main>`;
    const sidebar = document.querySelector(".sidebar").getBoundingClientRect();
    const article = document.querySelector("article").getBoundingClientRect();
    return {
      left: article.left - sidebar.right,
      right: innerWidth - article.right,
    };
  });

  expect(gutters.left).toBeGreaterThanOrEqual(16);
  expect(gutters.right).toBeGreaterThanOrEqual(16);
});

test("a bare sidebar toggle is hidden at desktop widths", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/components/");

  const display = await page.evaluate(() => {
    const toggle = document.createElement("button");
    toggle.className = "ghost icon sidebar-toggle";
    toggle.textContent = "Menu";
    document.body.append(toggle);
    return getComputedStyle(toggle).display;
  });

  expect(display).toBe("none");
});

test("SVG defaults do not override an explicit fill attribute", async ({ page }) => {
  await page.goto("/components/");

  const fills = await page.evaluate(() => {
    const namespace = "http://www.w3.org/2000/svg";
    const outlined = document.createElementNS(namespace, "svg");
    outlined.setAttribute("fill", "none");
    outlined.setAttribute("stroke", "currentColor");
    const solid = document.createElementNS(namespace, "svg");
    document.body.append(outlined, solid);
    return {
      outlined: getComputedStyle(outlined).fill,
      solid: getComputedStyle(solid).fill,
    };
  });

  expect(fills.outlined).toBe("none");
  expect(fills.solid).not.toBe("none");
});

test("dialog popovers keep an outside hit area for native light dismiss", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await page.goto("/components/");
  await page.getByRole("button", { name: "Open Help" }).click();

  const dialog = page.getByRole("dialog", { name: "Help" });
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  expect(box.width).toBeLessThan(800);
  expect(box.height).toBeLessThan(600);

  await page.mouse.click(5, 595);
  await expect(dialog).toBeHidden();
});

test("the modal demo opens through showModal and has an accessible name", async ({ page }) => {
  await page.goto("/examples/pico-comparison/");
  await page.getByRole("button", { name: "Launch demo modal" }).click();

  const dialog = page.getByRole("dialog", { name: "Confirm your action!" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveJSProperty("open", true);
  expect(await dialog.evaluate((element) => element.matches(":modal"))).toBe(true);
});

test("theme attributes switch semantic colors", async ({ page }) => {
  await page.goto("/components/");

  const colors = await page.evaluate(() => {
    const root = document.documentElement;
    root.dataset.theme = "light";
    const light = getComputedStyle(document.body).backgroundColor;
    root.dataset.theme = "dark";
    const dark = getComputedStyle(document.body).backgroundColor;
    return { dark, light };
  });

  expect(colors.dark).not.toBe(colors.light);
});

/* Regressions found by building four realistic pages against the framework
   with zero custom CSS (see examples/agent-evals/FINDINGS.md). Each of these
   shipped as a silent defect that the rest of the suite could not see. */

test("form action rows keep buttons inline instead of stretching them", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 700 });
  await page.goto("/components/");

  const widths = await page.evaluate(() => {
    document.body.innerHTML = `
      <main class="container">
        <form>
          <label for="field">Name</label>
          <input id="field" name="field">
          <button id="bare" type="submit">Stretches by design</button>
          <button id="inline" class="link small" type="button">Read the full agreement</button>
          <footer class="cluster justify-end">
            <button id="cancel" class="secondary" type="button">Cancel</button>
            <button id="save" type="submit">Save changes</button>
          </footer>
        </form>
      </main>`;
    const width = (id) => document.getElementById(id).getBoundingClientRect().width;
    return {
      bare: width("bare"),
      cancel: width("cancel"),
      form: document.querySelector("form").getBoundingClientRect().width,
      inline: width("inline"),
      save: width("save"),
      sameRow: document.getElementById("cancel").getBoundingClientRect().top
        === document.getElementById("save").getBoundingClientRect().top,
    };
  });

  // A bare form button still spans the form, preserving the documented default.
  expect(widths.bare).toBeCloseTo(widths.form, 0);
  // Buttons in a .cluster/<footer> action row size to content and share a row.
  expect(widths.cancel).toBeLessThan(widths.form / 2);
  expect(widths.save).toBeLessThan(widths.form / 2);
  expect(widths.sameRow).toBe(true);
  // A .link button is inline text and must never be stretched into a block.
  expect(widths.inline).toBeLessThan(widths.form / 2);
});

test('role="list" opts out of marker and indent styling', async ({ page }) => {
  await page.goto("/components/");

  const lists = await page.evaluate(() => {
    document.body.innerHTML = `
      <main class="container">
        <ul id="semantic" role="list"><li>Order 88213</li></ul>
        <ul id="prose"><li>Order 88213</li></ul>
        <ol id="semantic-ol" role="list"><li>Step one</li></ol>
        <ol id="prose-ol"><li>Step one</li></ol>
      </main>`;
    const read = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return { marker: style.listStyleType, padding: style.paddingLeft };
    };
    return {
      prose: read("prose"),
      proseOl: read("prose-ol"),
      semantic: read("semantic"),
      semanticOl: read("semantic-ol"),
    };
  });

  expect(lists.semantic).toEqual({ marker: "none", padding: "0px" });
  expect(lists.semanticOl).toEqual({ marker: "none", padding: "0px" });
  // Prose lists are untouched.
  expect(lists.prose.marker).toBe("disc");
  expect(lists.proseOl.marker).toBe("decimal");
  expect(parseFloat(lists.prose.padding)).toBeGreaterThan(0);
});

test("outline status badges meet AA contrast on light surfaces", async ({ page }) => {
  await page.goto("/components/");

  const ratios = await page.evaluate(() => {
    document.documentElement.dataset.theme = "light";
    document.body.innerHTML = `
      <main class="container">
        <article><article id="surface">
          <span class="badge outline destructive" id="destructive">Failed</span>
          <span class="badge outline success" id="success">Paid</span>
          <span class="badge outline warning" id="warning">Pending</span>
          <span class="badge outline" id="primary">Draft</span>
        </article></article>
      </main>`;

    const toRgb = (color) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d");
      context.fillStyle = "#000";
      context.fillRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return context.getImageData(0, 0, 1, 1).data;
    };
    const luminance = (rgb) => {
      const channel = (value) => {
        const ratio = value / 255;
        return ratio <= 0.04045 ? ratio / 12.92 : Math.pow((ratio + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
    };
    const contrast = (foreground, background) => {
      const first = luminance(toRgb(foreground));
      const second = luminance(toRgb(background));
      const lighter = Math.max(first, second);
      const darker = Math.min(first, second);
      return (lighter + 0.05) / (darker + 0.05);
    };

    const surface = getComputedStyle(document.getElementById("surface")).backgroundColor;
    const measure = (id) => contrast(getComputedStyle(document.getElementById(id)).color, surface);
    return {
      destructive: measure("destructive"),
      primary: measure("primary"),
      success: measure("success"),
      warning: measure("warning"),
    };
  });

  // Badge text is --text-xs, so WCAG AA normal-text applies.
  for (const [variant, ratio] of Object.entries(ratios)) {
    expect(ratio, `${variant} outline badge contrast`).toBeGreaterThanOrEqual(4.5);
  }
});

test("a solid secondary badge stays visible on muted surfaces", async ({ page }) => {
  await page.goto("/components/");

  const badge = await page.evaluate(() => {
    document.documentElement.dataset.theme = "light";
    document.body.innerHTML = `
      <main class="container">
        <article><article id="surface">
          <span class="badge secondary" id="badge">Bug</span>
        </article></article>
      </main>`;
    const style = getComputedStyle(document.getElementById("badge"));
    return {
      background: style.backgroundColor,
      borderColor: style.borderTopColor,
      borderWidth: parseFloat(style.borderTopWidth),
      surface: getComputedStyle(document.getElementById("surface")).backgroundColor,
    };
  });

  // The fill deliberately matches --muted, so the stroke is what delineates it.
  expect(badge.background).toBe(badge.surface);
  expect(badge.borderWidth).toBeGreaterThan(0);
  expect(badge.borderColor).not.toBe(badge.surface);
});

test(".grow lets a truncating cell shrink instead of forcing a cluster to wrap", async ({ page }) => {
  await page.setViewportSize({ width: 700, height: 600 });
  await page.goto("/components/");

  const rows = await page.evaluate(() => {
    document.body.innerHTML = `
      <main class="container">
        <article>
          <div class="cluster" id="plain">
            <span class="avatar small">MJ</span>
            <span class="truncate">Customer cannot complete checkout after the latest billing migration and is asking for an urgent callback today</span>
            <span class="badge">Open</span>
          </div>
          <div class="cluster" id="grown">
            <span class="avatar small" id="avatar">MJ</span>
            <span class="truncate grow" id="subject">Customer cannot complete checkout after the latest billing migration and is asking for an urgent callback today</span>
            <span class="badge" id="badge">Open</span>
          </div>
        </article>
      </main>`;
    const box = (id) => document.getElementById(id).getBoundingClientRect();
    const middle = (id) => Math.round(box(id).top + box(id).height / 2);
    const subject = document.getElementById("subject");
    return {
      grownHeight: box("grown").height,
      plainHeight: box("plain").height,
      sameRow: middle("avatar") === middle("subject") && middle("subject") === middle("badge"),
      truncated: subject.scrollWidth > subject.clientWidth,
    };
  });

  // All three cells share one row and the subject clips rather than wrapping.
  expect(rows.sameRow).toBe(true);
  expect(rows.truncated).toBe(true);
  // Without .grow the same markup wraps, so the row is measurably taller.
  expect(rows.grownHeight).toBeLessThan(rows.plainHeight);
});

test("line-height positioned controls keep a line box that can hold their glyphs", async ({ page }) => {
  await page.goto("/components/");

  const controls = await page.evaluate(() => {
    const types = ["date", "datetime-local", "month", "week", "time"];
    const sizes = ["", "small", "large"];
    const markup = [];
    for (const size of sizes) {
      markup.push(`<select class="${size}"><option>Oregon gjpqy</option></select>`);
      for (const type of types) markup.push(`<input type="${type}" class="${size}">`);
    }
    document.body.innerHTML = `<main class="container">${markup.join("")}</main>`;

    const expectedHeight = { "": 32, large: 36, small: 28 };
    return [...document.querySelectorAll("select, input")].map((element) => {
      const style = getComputedStyle(element);
      const size = element.className || "";
      return {
        fontSize: parseFloat(style.fontSize),
        height: Math.round(element.getBoundingClientRect().height),
        expectedHeight: expectedHeight[size],
        label: `${element.tagName.toLowerCase()}${element.type ? `[${element.type}]` : ""}.${size || "default"}`,
        lineHeight: parseFloat(style.lineHeight),
      };
    });
  });

  expect(controls.length).toBeGreaterThan(0);
  for (const control of controls) {
    // A line box smaller than the font size cannot render descenders (g, y, p).
    expect(control.lineHeight, `${control.label} line-height vs font-size`)
      .toBeGreaterThanOrEqual(control.fontSize);
    // The fix must not change control heights.
    expect(control.height, `${control.label} height`).toBe(control.expectedHeight);
  }
});

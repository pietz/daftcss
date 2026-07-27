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

test("aria-pressed buttons share selected visuals with current buttons", async ({ page }) => {
  await page.goto("/components/");

  const states = await page.evaluate(() => {
    document.body.innerHTML = `
      <div role="group">
        <button id="pressed" class="outline" aria-pressed="true">Pressed</button>
        <button id="current" class="outline" aria-current="true">Current</button>
      </div>`;
    const read = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return {
        background: style.backgroundColor,
        border: style.borderTopColor,
        color: style.color,
        zIndex: style.zIndex,
      };
    };
    return { current: read("current"), pressed: read("pressed") };
  });

  expect(states.pressed).toEqual(states.current);
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

test("card spacing follows root scale and card-level token overrides", async ({ page }) => {
  await page.goto("/components/");

  const spacing = await page.evaluate(() => {
    const root = document.documentElement;
    root.style.setProperty("--spacing", "20px");
    const article = document.createElement("article");
    article.innerHTML = "<header><strong>Title</strong></header><p>Body</p><footer>Metadata</footer>";
    document.body.append(article);

    const read = () => ({
      footerGap: getComputedStyle(article.lastElementChild).marginTop,
      headerGap: getComputedStyle(article.firstElementChild).marginBottom,
      padding: getComputedStyle(article).padding,
    });
    const fromRootScale = read();

    article.style.setProperty("--card-padding", "20px");
    article.style.setProperty("--card-gap", "12px");
    return { fromCardTokens: read(), fromRootScale };
  });

  expect(spacing).toEqual({
    fromCardTokens: { footerGap: "12px", headerGap: "12px", padding: "20px" },
    fromRootScale: { footerGap: "20px", headerGap: "20px", padding: "30px" },
  });
});

test("popover surfaces follow cards by default and retain an independent override", async ({ page }) => {
  await page.goto("/components/");

  const colors = await page.evaluate(() => {
    const root = document.documentElement;
    const createSurfaces = () => {
      const card = document.createElement("article");
      card.textContent = "Card";
      const dropdown = document.createElement("details");
      dropdown.className = "dropdown";
      dropdown.open = true;
      dropdown.innerHTML = "<summary>Menu</summary><ul><li>Option</li></ul>";
      document.body.append(card, dropdown);
      return { card, dropdown: dropdown.querySelector("ul") };
    };
    const read = (surfaces) => ({
      card: getComputedStyle(surfaces.card).backgroundColor,
      popover: getComputedStyle(surfaces.dropdown).backgroundColor,
    });

    const defaults = {};
    for (const theme of ["light", "dark"]) {
      root.dataset.theme = theme;
      const surfaces = createSurfaces();
      defaults[theme] = read(surfaces);
      surfaces.card.remove();
      surfaces.dropdown.closest("details").remove();
    }

    root.style.setProperty("--card", "rgb(1 2 3)");
    const surfaces = createSurfaces();
    const followsCard = read(surfaces);
    root.style.setProperty("--popover", "rgb(4 5 6)");
    const overridden = read(surfaces);
    return { defaults, followsCard, overridden };
  });

  expect(colors.defaults.light.popover).toBe(colors.defaults.light.card);
  expect(colors.defaults.dark.popover).toBe(colors.defaults.dark.card);
  expect(colors.followsCard).toEqual({ card: "rgb(1, 2, 3)", popover: "rgb(1, 2, 3)" });
  expect(colors.overridden).toEqual({ card: "rgb(1, 2, 3)", popover: "rgb(4, 5, 6)" });
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

test("sidebar links provide compact hover and current-page states", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/components/");

  await page.evaluate(() => {
    document.body.innerHTML = `
      <aside class="sidebar"><nav><ul>
        <li><a href="#current" aria-current="page">Current page</a></li>
        <li><a href="#inactive">Inactive page</a></li>
        <li><a href="#false" aria-current="false">False current page</a></li>
      </ul></nav></aside>`;
  });

  const states = await page.evaluate(() => {
    const current = document.querySelector('a[href="#current"]');
    const inactive = document.querySelector('a[href="#inactive"]');
    const falseCurrent = document.querySelector('a[href="#false"]');
    const probe = document.createElement("span");
    probe.style.cssText = "background: var(--accent); color: var(--accent-foreground);";
    document.body.append(probe);
    const accent = getComputedStyle(probe);
    const currentStyle = getComputedStyle(current);
    const falseCurrentStyle = getComputedStyle(falseCurrent);
    return {
      accentBackground: accent.backgroundColor,
      accentForeground: accent.color,
      current: {
        background: currentStyle.backgroundColor,
        color: currentStyle.color,
        fontWeight: currentStyle.fontWeight,
      },
      falseCurrentBackground: falseCurrentStyle.backgroundColor,
      geometry: {
        borderRadius: getComputedStyle(inactive).borderRadius,
        paddingLeft: getComputedStyle(inactive).paddingLeft,
        paddingRight: getComputedStyle(inactive).paddingRight,
        width: inactive.getBoundingClientRect().width,
      },
    };
  });

  expect(states.current).toEqual({
    background: states.accentBackground,
    color: states.accentForeground,
    fontWeight: "600",
  });
  expect(states.falseCurrentBackground).toBe("rgba(0, 0, 0, 0)");
  expect(states.geometry).toEqual({ borderRadius: "6px", paddingLeft: "8px", paddingRight: "8px", width: 192 });

  await page.locator('a[href="#inactive"]').hover();
  await page.waitForTimeout(200);
  const hover = await page.locator('a[href="#inactive"]').evaluate((element) => {
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, color: style.color, textDecoration: style.textDecorationLine };
  });
  expect(hover).toEqual({
    background: states.accentBackground,
    color: states.accentForeground,
    textDecoration: "none",
  });
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

test("responsive top navigation uses one native popover list on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const nav = page.locator(".top-nav");
  const menu = nav.locator(".top-nav-menu");
  const toggle = nav.getByRole("button", { name: "Toggle primary navigation" });

  await expect(nav.locator(".top-nav-menu")).toHaveCount(1);
  await expect(menu).toBeHidden();
  await expect(toggle).toBeVisible();
  await expect(toggle.locator("svg[aria-hidden=true]")).toHaveCount(1);
  expect((await toggle.textContent()).trim()).toBe("");

  await toggle.click();
  await expect(menu).toBeVisible();
  expect(await menu.evaluate((element) => element.matches(":popover-open"))).toBe(true);
  await expect.poll(() => page.evaluate(() => {
    const navBox = document.querySelector(".top-nav").getBoundingClientRect();
    const menuBox = document.querySelector(".top-nav-menu").getBoundingClientRect();
    return menuBox.top - navBox.bottom;
  })).toBeGreaterThanOrEqual(0);

  const geometry = await page.evaluate(() => {
    const navBox = document.querySelector(".top-nav").getBoundingClientRect();
    const menuBox = document.querySelector(".top-nav-menu").getBoundingClientRect();
    return {
      documentWidth: document.documentElement.scrollWidth,
      menuBottom: menuBox.bottom,
      menuLeft: menuBox.left,
      menuRight: menuBox.right,
      menuTop: menuBox.top,
      navBottom: navBox.bottom,
      viewportHeight: innerHeight,
      viewportWidth: innerWidth,
    };
  });
  expect(geometry.menuTop).toBeGreaterThanOrEqual(geometry.navBottom);
  expect(geometry.menuLeft).toBeGreaterThan(0);
  expect(geometry.menuRight).toBeLessThan(geometry.viewportWidth);
  expect(geometry.menuBottom).toBeLessThanOrEqual(geometry.viewportHeight);
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
  await expect(menu.getByRole("button", { name: "Components" })).toBeVisible();
  await expect(menu.getByRole("button", { name: "GitHub" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();

  await toggle.click();
  await page.mouse.click(370, 400);
  await expect(menu).toBeHidden();
});

test("responsive top navigation returns to the desktop bar across a resize", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const menu = page.locator(".top-nav-menu");
  const toggle = page.getByRole("button", { name: "Toggle primary navigation" });
  await toggle.click();
  await expect(menu).toBeVisible();

  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(toggle).toBeHidden();
  await expect(menu).toBeVisible();
  const openDesktop = await menu.evaluate((element) => ({
    display: getComputedStyle(element).display,
    open: element.matches(":popover-open"),
    position: getComputedStyle(element).position,
    top: element.getBoundingClientRect().top,
  }));
  expect(openDesktop).toEqual({ display: "flex", open: true, position: "fixed", top: 8 });

  await page.keyboard.press("Escape");
  await expect(menu).toBeVisible();
  const closedDesktop = await menu.evaluate((element) => ({
    open: element.matches(":popover-open"),
    position: getComputedStyle(element).position,
  }));
  expect(closedDesktop).toEqual({ open: false, position: "static" });
});

test("canonical Lucide SVGs follow the control icon pattern", async ({ page }) => {
  await page.goto("/components/");
  await page.evaluate(() => {
    document.documentElement.style.setProperty("--icon-size", "19px");
    document.body.innerHTML = `
      <button id="icon-only" class="icon ghost" type="button" aria-label="Search" style="color: rgb(12 34 56)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
      </button>
      <button id="icon-text" type="button" style="color: rgb(65 43 21)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
        Search projects
      </button>`;
  });

  await expect(page.getByRole("button", { name: "Search", exact: true })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Search projects", exact: true })).toHaveCount(1);

  const controls = await page.locator("#icon-only, #icon-text").evaluateAll((buttons) => buttons.map((button) => {
    const svg = button.querySelector("svg");
    const style = getComputedStyle(svg);
    return {
      ariaHidden: svg.getAttribute("aria-hidden"),
      color: getComputedStyle(button).color,
      fill: style.fill,
      height: style.height,
      intrinsicHeight: svg.getAttribute("height"),
      intrinsicWidth: svg.getAttribute("width"),
      stroke: style.stroke,
      viewBox: svg.getAttribute("viewBox"),
      width: style.width,
    };
  }));

  for (const control of controls) {
    expect(control).toMatchObject({
      ariaHidden: "true",
      fill: "none",
      height: "19px",
      intrinsicHeight: "24",
      intrinsicWidth: "24",
      viewBox: "0 0 24 24",
      width: "19px",
    });
    expect(control.stroke).toBe(control.color);
  }
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

test("dialog SVG close controls do not receive a duplicate fallback icon", async ({ page }) => {
  await page.goto("/components/");

  const closeIcons = await page.evaluate(() => {
    document.body.innerHTML = `
      <dialog open aria-label="Icon test"><article>
        <button id="svg-close" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <button id="empty-close" aria-label="Close"></button>
      </article></dialog>`;
    const svgClose = document.getElementById("svg-close");
    const emptyClose = document.getElementById("empty-close");
    return {
      emptyContent: getComputedStyle(emptyClose, "::before").content,
      emptyMask: getComputedStyle(emptyClose, "::before").maskImage,
      svgContent: getComputedStyle(svgClose, "::before").content,
      svgCount: svgClose.querySelectorAll("svg").length,
    };
  });

  expect(closeIcons.svgCount).toBe(1);
  expect(closeIcons.svgContent).toBe("none");
  expect(closeIcons.emptyContent).toBe('\"\"');
  expect(closeIcons.emptyMask).toContain("data:image/svg+xml");
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

test("slide spacing and type stay proportional to the fitted canvas", async ({ page }) => {
  await page.goto("/slides/");

  for (const viewport of [
    { width: 1600, height: 900 },
    { width: 375, height: 812 },
  ]) {
    await page.setViewportSize(viewport);
    const metrics = await page.locator("body.deck > section").nth(1).evaluate((slide) => {
      const paragraph = slide.querySelector("p");
      const rect = slide.getBoundingClientRect();
      const style = getComputedStyle(slide);
      const padding = Number.parseFloat(style.paddingInlineStart);
      return {
        contentWidth: rect.width - 2 * padding,
        fontSize: Number.parseFloat(style.fontSize),
        padding,
        paragraphSize: Number.parseFloat(getComputedStyle(paragraph).fontSize),
        slideWidth: rect.width,
      };
    });

    expect(metrics.padding).toBeCloseTo(metrics.contentWidth * 0.05, 1);
    expect(metrics.fontSize).toBeCloseTo(metrics.contentWidth * 0.022, 1);
    expect(metrics.paragraphSize).toBeCloseTo(metrics.contentWidth * 0.022, 1);
    expect(metrics.slideWidth).toBeLessThanOrEqual(viewport.width);
  }
});

test("slide sizing supports fixed overrides and proportional scale tokens", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/slides/");

  const slide = page.locator("body.deck > section").first();
  await page.evaluate(() => {
    document.documentElement.style.setProperty("--slide-padding", "40px");
    document.body.style.setProperty("--slide-text", "18px");
  });
  await expect(slide).toHaveCSS("padding", "40px");
  await expect(slide).toHaveCSS("font-size", "18px");

  await slide.evaluate((element) => {
    element.style.setProperty("--slide-padding", "24px");
    element.style.setProperty("--slide-text", "16px");
  });
  await expect(slide).toHaveCSS("padding", "24px");
  await expect(slide).toHaveCSS("font-size", "16px");

  await page.evaluate(() => {
    document.documentElement.style.removeProperty("--slide-padding");
    document.body.style.removeProperty("--slide-text");
    document.body.style.setProperty("--slide-padding-scale", "0.5");
    document.body.style.setProperty("--slide-text-scale", "0.75");
    const firstSlide = document.querySelector("body.deck > section");
    firstSlide.style.removeProperty("--slide-padding");
    firstSlide.style.removeProperty("--slide-text");
  });

  const ratios = [];
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 1600, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    ratios.push(await slide.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const padding = Number.parseFloat(style.paddingInlineStart);
      return {
        padding: padding / rect.width,
        text: Number.parseFloat(style.fontSize) / (rect.width - 2 * padding),
      };
    }));
  }

  expect(ratios[0].padding).toBeCloseTo(ratios[1].padding, 4);
  expect(ratios[0].text).toBeCloseTo(0.022 * 0.75, 4);
  expect(ratios[1].text).toBeCloseTo(0.022 * 0.75, 4);
});

test("custom slide ratios retain proportional screen and print sizing", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto("/slides/");
  await page.evaluate(() => {
    document.documentElement.style.setProperty("--slide-width", "4");
    document.documentElement.style.setProperty("--slide-height", "3");
  });

  const slide = page.locator("body.deck > section").nth(1);
  const screen = await slide.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const padding = Number.parseFloat(getComputedStyle(element).paddingInlineStart);
    return { contentWidth: rect.width - 2 * padding, height: rect.height, padding, width: rect.width };
  });
  expect(screen.width / screen.height).toBeCloseTo(4 / 3, 2);
  expect(screen.padding).toBeCloseTo(screen.contentWidth * 0.05, 1);

  await page.emulateMedia({ media: "print" });
  const print = await slide.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const padding = Number.parseFloat(getComputedStyle(element).paddingInlineStart);
    return { contentWidth: rect.width - 2 * padding, height: rect.height, padding, width: rect.width };
  });
  expect(print.width).toBeCloseTo(4 * 96, 0);
  expect(print.height).toBeCloseTo(3 * 96, 0);
  expect(print.padding).toBeCloseTo(print.contentWidth * 0.05, 1);
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

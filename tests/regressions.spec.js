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

test("ordinary accordion boundaries form single dividers without affecting details variants", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <main style="width: 320px; --border-width: 2px; --border: rgb(12 34 56)">
        <section id="standalone"><details id="single"><summary>Single</summary><p>Content</p></details></section>
        <section id="two">
          <details id="two-a"><summary>Two A</summary></details>
          <details id="two-b"><summary>Two B</summary></details>
        </section>
        <section id="three">
          <details id="three-a"><summary>Three A</summary></details>
          <details id="three-b"><summary>Three B</summary></details>
          <details id="three-c"><summary>Three C</summary></details>
        </section>
        <section id="interrupted">
          <details id="interrupted-a"><summary>Interrupted A</summary></details>
          <p>Interruption</p>
          <details id="interrupted-b"><summary>Interrupted B</summary></details>
        </section>
        <section id="variants">
          <details id="before-dropdown"><summary>Before dropdown</summary></details>
          <details id="dropdown" class="dropdown"><summary>Dropdown</summary><ul><li>Item</li></ul></details>
          <details id="after-dropdown"><summary>After dropdown</summary></details>
          <details id="button-accordion"><summary id="button-summary" role="button">Button accordion</summary><p>Content</p></details>
          <ul class="tree"><li><details id="tree"><summary>Tree folder</summary><ul><li>Leaf</li></ul></details></li></ul>
        </section>
      </main>`;

    const read = (id) => {
      const element = document.getElementById(id);
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        bottom: rect.bottom,
        bottomColor: style.borderBottomColor,
        bottomStyle: style.borderBottomStyle,
        bottomWidth: style.borderBottomWidth,
        marginBottom: style.marginBottom,
        top: rect.top,
        topColor: style.borderTopColor,
        topStyle: style.borderTopStyle,
        topWidth: style.borderTopWidth,
      };
    };

    const result = Object.fromEntries([
      "single", "two-a", "two-b", "three-a", "three-b", "three-c",
      "interrupted-a", "interrupted-b", "before-dropdown", "dropdown",
      "after-dropdown", "button-accordion", "tree",
    ].map((id) => [id, read(id)]));
    const buttonSummary = getComputedStyle(document.getElementById("button-summary"));
    result.buttonSummary = {
      background: buttonSummary.backgroundColor,
      borderWidth: buttonSummary.borderTopWidth,
      display: buttonSummary.display,
      height: buttonSummary.height,
    };
    return result;
  });

  const expectBoundary = (id, { top = "2px", bottom = "2px" } = {}) => {
    const styles = result[id];
    expect(styles.topWidth).toBe(top);
    expect(styles.bottomWidth).toBe(bottom);
    if (top !== "0px") {
      expect(styles.topStyle).toBe("solid");
      expect(styles.topColor).toBe("rgb(12, 34, 56)");
    }
    if (bottom !== "0px") {
      expect(styles.bottomStyle).toBe("solid");
      expect(styles.bottomColor).toBe("rgb(12, 34, 56)");
    }
  };

  expectBoundary("single");
  expectBoundary("two-a");
  expectBoundary("two-b", { top: "0px" });
  expect(result["two-a"].bottom).toBe(result["two-b"].top);
  expectBoundary("three-a");
  expectBoundary("three-b", { top: "0px" });
  expectBoundary("three-c", { top: "0px" });
  expect(result["three-a"].bottom).toBe(result["three-b"].top);
  expect(result["three-b"].bottom).toBe(result["three-c"].top);

  expectBoundary("interrupted-a");
  expectBoundary("interrupted-b");
  expect(result["interrupted-b"].top).toBeGreaterThan(result["interrupted-a"].bottom);
  expectBoundary("before-dropdown");
  expectBoundary("after-dropdown");

  for (const id of ["dropdown", "tree"]) {
    expectBoundary(id, { top: "0px", bottom: "0px" });
    expect(result[id].marginBottom).toBe("0px");
  }
  expectBoundary("button-accordion", { top: "0px", bottom: "0px" });
  expect(result["button-accordion"].marginBottom).toBe("16px");
  expect(result.buttonSummary).toMatchObject({ borderWidth: "2px", display: "inline-flex", height: "32px" });
  expect(result.buttonSummary.background).not.toBe("rgba(0, 0, 0, 0)");
});

test("ordinary accordion summaries use compact centered rhythm without changing specialized disclosures", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <main style="width: 320px">
        <details id="ordinary"><summary id="ordinary-summary"><span>Alignment probe Hgx</span></summary></details>
        <details><summary id="button-summary" role="button">Button summary</summary></details>
        <details class="dropdown"><summary id="dropdown-summary">Dropdown summary</summary></details>
        <ul class="tree"><li><details><summary id="tree-summary">Tree summary</summary></details></li></ul>
        <nav><details><summary id="nav-summary">Navigation summary</summary></details></nav>
      </main>`;

    const readPadding = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return { bottom: style.paddingBottom, top: style.paddingTop };
    };
    const summary = document.getElementById("ordinary-summary");
    const title = summary.querySelector("span");
    const summaryBox = summary.getBoundingClientRect();
    const titleBox = title.getBoundingClientRect();
    const chevron = getComputedStyle(summary, "::after");

    return {
      alignment: {
        alignItems: getComputedStyle(summary).alignItems,
        chevronHeight: chevron.height,
        chevronMaskPosition: chevron.maskPosition,
        rowCenter: (summaryBox.top + summaryBox.bottom) / 2,
        textCenter: (titleBox.top + titleBox.bottom) / 2,
      },
      button: readPadding("button-summary"),
      dropdown: readPadding("dropdown-summary"),
      nav: readPadding("nav-summary"),
      ordinary: readPadding("ordinary-summary"),
      tree: readPadding("tree-summary"),
    };
  });

  expect(result.ordinary).toEqual({ bottom: "8px", top: "8px" });
  expect(result.button).toEqual({ bottom: "8px", top: "8px" });
  expect(result.dropdown).toEqual({ bottom: "8px", top: "8px" });
  expect(result.tree).toEqual({ bottom: "3px", top: "3px" });
  expect(result.nav).toEqual({ bottom: "16px", top: "16px" });
  expect(result.alignment).toMatchObject({
    alignItems: "center",
    chevronHeight: "16px",
    chevronMaskPosition: "50% 50%",
  });
  expect(result.alignment.textCenter).toBeCloseTo(result.alignment.rowCenter, 5);
});

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

test("button-looking anchors retain link semantics and button composition", async ({ page }) => {
  await page.goto("/components/");
  await page.evaluate(() => {
    const variants = ["secondary", "destructive", "outline", "ghost", "link"];
    document.body.innerHTML = `
      <style>* { transition: none !important; }</style>
      <main class="container">
        <div role="group" class="large">
          <a id="group-link" class="button secondary" href="#destination" aria-current="true">Explore the program</a>
          <button id="group-button" class="secondary" type="button" aria-current="true">Action</button>
        </div>
        <div id="variants">
          ${variants.map((variant) => `<a id="a-${variant}" class="button ${variant}" href="#${variant}">${variant}</a><button id="b-${variant}" class="${variant}" type="button">${variant}</button>`).join("")}
        </div>
        <a id="small-link" class="button small" href="#small">Small</a>
        <button id="small-button" class="small" type="button">Small</button>
        <a id="icon-link" class="button icon" href="#icon" aria-label="Open details"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg></a>
        <div style="width: 240px"><a id="full-link" class="button full-width" href="#full">Full width</a></div>
        <a id="ordinary" class="secondary outline large full-width icon" href="#ordinary">Ordinary link</a>
        <a id="unavailable" class="button" href="#still-a-link" aria-disabled="true">Still a link</a>
        <a id="custom-shadow" class="button" href="#custom-shadow" style="--button-shadow: 4px 4px 0 rgb(255 0 255)">Custom shadow</a>
      </main>`;
  });

  await expect(page.getByRole("link", { name: "Explore the program" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Explore the program" })).toHaveCount(0);

  const styles = await page.evaluate(() => {
    const read = (id) => {
      const element = document.getElementById(id);
      const style = getComputedStyle(element);
      return {
        background: style.backgroundColor,
        borderColor: style.borderTopColor,
        borderRadius: style.borderRadius,
        color: style.color,
        cursor: style.cursor,
        display: style.display,
        height: style.height,
        opacity: style.opacity,
        padding: style.padding,
        width: style.width,
        zIndex: style.zIndex,
      };
    };
    return {
      full: read("full-link"),
      groupButton: read("group-button"),
      groupLink: read("group-link"),
      icon: read("icon-link"),
      ordinary: read("ordinary"),
      smallButton: read("small-button"),
      smallLink: read("small-link"),
      unavailable: read("unavailable"),
      variants: Object.fromEntries(["secondary", "destructive", "outline", "ghost", "link"].map((variant) => [
        variant,
        { anchor: read(`a-${variant}`), button: read(`b-${variant}`) },
      ])),
    };
  });

  expect(styles.groupLink).toMatchObject({
    background: styles.groupButton.background,
    color: styles.groupButton.color,
    display: "flex",
    height: styles.groupButton.height,
    padding: styles.groupButton.padding,
    zIndex: styles.groupButton.zIndex,
  });
  expect(styles.groupLink.borderRadius).not.toBe(styles.groupButton.borderRadius);
  for (const { anchor, button } of Object.values(styles.variants)) {
    expect(anchor).toMatchObject({
      background: button.background,
      borderColor: button.borderColor,
      color: button.color,
      height: button.height,
      padding: button.padding,
    });
  }
  expect(styles.smallLink.height).toBe(styles.smallButton.height);
  expect(styles.smallLink.padding).toBe(styles.smallButton.padding);
  expect(styles.icon.width).toBe(styles.icon.height);
  expect(styles.full.width).toBe("240px");
  expect(styles.ordinary).toMatchObject({ background: "rgba(0, 0, 0, 0)", display: "inline", height: "auto" });
  expect(styles.unavailable).toMatchObject({ cursor: "pointer", opacity: "1" });

  await page.locator("#group-link").focus();
  await expect(page.locator("#group-link")).toBeFocused();
  const focus = await page.locator("#group-link").evaluate((link) => {
    const style = getComputedStyle(link);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  expect(focus).toMatchObject({ outlineStyle: "solid", outlineWidth: "3px" });

  await page.locator("#custom-shadow").focus();
  const customFocus = await page.locator("#custom-shadow").evaluate((link) => {
    const style = getComputedStyle(link);
    return { boxShadow: style.boxShadow, outlineStyle: style.outlineStyle };
  });
  expect(customFocus.boxShadow).not.toBe("none");
  expect(customFocus.outlineStyle).toBe("solid");

  const interactiveBackground = async (selector, active = false) => {
    const locator = page.locator(selector);
    await locator.hover();
    if (active) await page.mouse.down();
    const background = await locator.evaluate((element) => getComputedStyle(element).backgroundColor);
    if (active) await page.mouse.up();
    return background;
  };
  expect(await interactiveBackground("#a-secondary")).toBe(await interactiveBackground("#b-secondary"));
  expect(await interactiveBackground("#a-secondary", true)).toBe(await interactiveBackground("#b-secondary", true));
});

test("required markers remain robust across label and control shapes", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/components/");

  const results = await page.evaluate(() => {
    document.body.innerHTML = `
      <main style="width: 180px">
        <label id="input-label">A deliberately long required label that wraps
          <input id="input-control" required>
          <small id="input-help">Help text remains after the control.</small>
        </label>
        <label id="textarea-label">Long message label<textarea required></textarea></label>
        <label id="select-label">Long selection label<select required><option>One</option></select></label>
        <label id="separate" for="separate-control">A deliberately long separate label</label>
        <input id="separate-control" required>
        <small>Separate help text</small>
        <label id="checkbox"><input type="checkbox" required> A deliberately long checkbox label that wraps over multiple lines</label>
        <label id="radio"><input type="radio" required> A deliberately long radio label that wraps over multiple lines</label>
        <label id="switch"><input type="checkbox" role="switch" required> Enable alerts across every workspace</label>
      </main>`;
    const marker = (id) => {
      const label = document.getElementById(id);
      return {
        after: getComputedStyle(label, "::after").content,
        before: getComputedStyle(label, "::before").content,
        color: getComputedStyle(label, "::before").color,
      };
    };
    const inputText = document.createRange();
    inputText.selectNodeContents(document.getElementById("input-label").firstChild);
    const checkboxText = document.createRange();
    checkboxText.selectNodeContents(document.getElementById("checkbox").lastChild);
    const light = marker("input-label");
    document.documentElement.dataset.theme = "dark";
    const dark = marker("input-label");
    return {
      checkboxLines: checkboxText.getClientRects().length,
      dark,
      helpTop: document.getElementById("input-help").getBoundingClientRect().top,
      inputBottom: document.getElementById("input-control").getBoundingClientRect().bottom,
      inputTextBottom: inputText.getBoundingClientRect().bottom,
      inputTop: document.getElementById("input-control").getBoundingClientRect().top,
      light,
      markers: ["input-label", "textarea-label", "select-label", "checkbox", "radio", "switch"].map(marker),
      separate: marker("separate"),
    };
  });

  for (const marker of results.markers) {
    expect(marker.before).toContain("*");
    expect(marker.after).toBe("none");
  }
  expect(results.separate.before).toBe("none");
  expect(results.separate.after).toContain("*");
  expect(results.inputTextBottom).toBeLessThan(results.inputTop);
  expect(results.helpTop).toBeGreaterThanOrEqual(results.inputBottom);
  expect(results.checkboxLines).toBeGreaterThan(1);
  expect(results.light.before).toBe(results.dark.before);
  expect(results.light.color).not.toBe("rgba(0, 0, 0, 0)");
  expect(results.dark.color).not.toBe("rgba(0, 0, 0, 0)");
});

test("card headers support strong titles and all heading levels outside invalid hgroup markup", async ({ page }) => {
  await page.goto("/components/");

  const typography = await page.evaluate(() => {
    document.body.innerHTML = `
      <article id="strong-card"><header><strong>Strong card title</strong></header></article>
      <article id="heading-card"><header><h6>Level-six card title</h6></header></article>
      <article id="group-card"><header><hgroup><h6>Grouped level-six title</h6><p>Description</p></hgroup></header></article>`;
    const read = (selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return { fontSize: style.fontSize, fontWeight: style.fontWeight, lineHeight: style.lineHeight };
    };
    return {
      groupedHeading: read("#group-card h6"),
      heading: read("#heading-card h6"),
      strong: read("#strong-card strong"),
    };
  });

  expect(typography.heading).toEqual(typography.strong);
  expect(typography.groupedHeading).toEqual(typography.heading);
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

test("article.plain opts out of card surfaces and compact content flow without changing ordinary articles", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <main id="canvas" style="--card: rgb(240 230 220); --card-foreground: rgb(20 30 40); --card-padding: 24px; --card-gap: 18px; --card-radius: 10px; --card-shadow: 4px 5px 0 rgb(90 80 70); --border: rgb(60 70 80); --border-width: 2px">
        <section id="reference">
          <header><hgroup><h2>Document heading</h2><p>Document description</p></hgroup><span>Metadata</span></header>
          <p>Document paragraph</p>
          <footer>Document footer</footer>
        </section>
        <article id="plain" class="plain">
          <header><hgroup><h2>Plain heading</h2><p>Plain description</p></hgroup><span>Metadata</span></header>
          <p>Plain paragraph</p>
          <footer>Plain footer</footer>
        </article>
        <article id="card">
          <header><hgroup><h2>Card heading</h2><p>Card description</p></hgroup><span>Metadata</span></header>
          <p>Card paragraph</p>
          <footer>Card footer</footer>
        </article>
      </main>`;

    const style = (selector) => getComputedStyle(document.querySelector(selector));
    const surface = (selector) => {
      const value = style(selector);
      return {
        background: value.backgroundColor,
        borderRadius: value.borderRadius,
        borderWidth: value.borderTopWidth,
        boxShadow: value.boxShadow,
        color: value.color,
        marginBottom: value.marginBottom,
        padding: value.padding,
      };
    };
    const type = (selector) => {
      const value = style(selector);
      return {
        color: value.color,
        fontSize: value.fontSize,
        fontWeight: value.fontWeight,
        letterSpacing: value.letterSpacing,
        lineHeight: value.lineHeight,
        marginBottom: value.marginBottom,
        marginTop: value.marginTop,
      };
    };
    const flow = (root) => ({
      footer: {
        display: style(`${root} > footer`).display,
        marginTop: style(`${root} > footer`).marginTop,
      },
      header: {
        display: style(`${root} > header`).display,
        marginBottom: style(`${root} > header`).marginBottom,
      },
      hgroup: {
        display: style(`${root} > header > hgroup`).display,
        marginBottom: style(`${root} > header > hgroup`).marginBottom,
      },
    });

    return {
      card: {
        flow: flow("#card"),
        heading: type("#card h2"),
        paragraph: type("#card > p"),
        surface: surface("#card"),
      },
      plain: {
        flow: flow("#plain"),
        heading: type("#plain h2"),
        paragraph: type("#plain > p"),
        surface: surface("#plain"),
      },
      reference: {
        flow: flow("#reference"),
        heading: type("#reference h2"),
        paragraph: type("#reference > p"),
      },
    };
  });

  expect(result.card.surface).toMatchObject({
    background: "rgb(240, 230, 220)",
    borderRadius: "10px",
    borderWidth: "2px",
    color: "rgb(20, 30, 40)",
    padding: "24px",
  });
  expect(result.card.surface.boxShadow).not.toBe("none");
  expect(result.card.flow).toMatchObject({
    footer: { display: "flex", marginTop: "18px" },
    header: { display: "flex", marginBottom: "18px" },
    hgroup: { display: "flex", marginBottom: "0px" },
  });

  expect(result.plain.surface).toMatchObject({
    background: "rgba(0, 0, 0, 0)",
    borderRadius: "0px",
    borderWidth: "0px",
    boxShadow: "none",
    padding: "0px",
  });
  expect(result.plain.surface.color).not.toBe(result.card.surface.color);
  expect(result.plain.surface.marginBottom).toBe("16px");
  expect(result.plain.heading).toEqual(result.reference.heading);
  expect(result.plain.paragraph).toEqual(result.reference.paragraph);
  expect(result.plain.flow).toEqual(result.reference.flow);
  expect(result.card.heading.fontSize).not.toBe(result.plain.heading.fontSize);
});

test("article.plain does not acquire nested, grid, linked-card, hover, or loading-card presentation", async ({ page }) => {
  await page.goto("/components/");
  await page.evaluate(() => {
    document.body.innerHTML = `
      <main style="--card: rgb(240 230 220); --muted: rgb(210 220 230); --border: rgb(60 70 80); --border-width: 2px; --card-radius: 10px">
        <article id="outer">
          <article id="nested-card">Nested card</article>
          <article id="nested-plain" class="plain">Nested plain article</article>
        </article>
        <article id="plain-parent" class="plain"><article id="card-in-plain">Card in plain article</article></article>
        <div class="grid"><article id="grid-card">Grid card</article><article id="grid-plain" class="plain">Grid plain article</article></div>
        <a id="card-link" href="#card"><article id="linked-card">Linked card</article></a>
        <a id="plain-link" href="#plain"><article id="linked-plain" class="plain">Linked plain article</article></a>
        <article id="busy-card" aria-busy="true"></article>
        <article id="busy-plain" class="plain" aria-busy="true"></article>
      </main>`;
  });

  const read = async () => page.evaluate(() => {
    const style = (id) => getComputedStyle(document.getElementById(id));
    const surface = (id) => ({
      background: style(id).backgroundColor,
      borderWidth: style(id).borderTopWidth,
      boxShadow: style(id).boxShadow,
    });
    return {
      busy: { card: style("busy-card").minHeight, plain: style("busy-plain").minHeight },
      grid: { cardMargin: style("grid-card").marginBottom, plain: surface("grid-plain") },
      links: {
        card: { display: style("card-link").display, textDecoration: style("card-link").textDecorationLine },
        plain: { display: style("plain-link").display, textDecoration: style("plain-link").textDecorationLine },
      },
      linkedCardBorder: style("linked-card").borderTopColor,
      linkedPlain: surface("linked-plain"),
      nested: {
        card: surface("nested-card"),
        cardInPlain: surface("card-in-plain"),
        plain: surface("nested-plain"),
      },
    };
  });

  const beforeHover = await read();
  await page.locator("#card-link").hover();
  const cardHoverBorder = await page.locator("#linked-card").evaluate((element) => getComputedStyle(element).borderTopColor);
  await page.locator("#plain-link").hover();
  const plainHover = await read();

  expect(beforeHover.nested.card).toEqual({ background: "rgb(210, 220, 230)", borderWidth: "0px", boxShadow: "none" });
  expect(beforeHover.nested.cardInPlain).toEqual(beforeHover.nested.card);
  expect(beforeHover.nested.plain).toEqual({ background: "rgba(0, 0, 0, 0)", borderWidth: "0px", boxShadow: "none" });
  expect(beforeHover.grid.cardMargin).toBe("0px");
  expect(beforeHover.grid.plain).toEqual(beforeHover.nested.plain);
  expect(beforeHover.links.card).toEqual({ display: "block", textDecoration: "none" });
  expect(beforeHover.links.plain).toEqual({ display: "inline", textDecoration: "underline" });
  expect(cardHoverBorder).not.toBe(beforeHover.linkedCardBorder);
  expect(plainHover.linkedPlain).toEqual(beforeHover.linkedPlain);
  expect(beforeHover.busy).toEqual({ card: "128px", plain: "0px" });
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

test("sidebar links provide adaptive hover and current-page states", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/components/");

  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
      document.body.innerHTML = `
        <aside class="sidebar"><nav><ul>
          <li><a href="#current" aria-current="page">Current page</a></li>
          <li><a href="#inactive">Inactive page</a></li>
          <li><a href="#false" aria-current="false">False current page</a></li>
        </ul></nav></aside>`;
    }, theme);

    const states = await page.evaluate(() => {
      const sidebar = document.querySelector(".sidebar");
      const current = document.querySelector('a[href="#current"]');
      const inactive = document.querySelector('a[href="#inactive"]');
      const falseCurrent = document.querySelector('a[href="#false"]');
      return {
        sidebarBackground: getComputedStyle(sidebar).backgroundColor,
        inactiveColor: getComputedStyle(inactive).color,
        current: {
          background: getComputedStyle(current).backgroundColor,
          color: getComputedStyle(current).color,
          fontWeight: getComputedStyle(current).fontWeight,
        },
        falseCurrentBackground: getComputedStyle(falseCurrent).backgroundColor,
        geometry: {
          borderRadius: getComputedStyle(inactive).borderRadius,
          paddingLeft: getComputedStyle(inactive).paddingLeft,
          paddingRight: getComputedStyle(inactive).paddingRight,
          width: inactive.getBoundingClientRect().width,
        },
      };
    });

    expect(states.current.background).not.toBe(states.sidebarBackground);
    expect(states.current.color).toBe(states.inactiveColor);
    expect(states.current.fontWeight).toBe("600");
    expect(states.falseCurrentBackground).toBe("rgba(0, 0, 0, 0)");
    expect(states.geometry).toEqual({ borderRadius: "6px", paddingLeft: "8px", paddingRight: "8px", width: 192 });

    await page.locator('a[href="#inactive"]').hover();
    await page.waitForTimeout(200);
    const hover = await page.locator('a[href="#inactive"]').evaluate((element) => {
      const style = getComputedStyle(element);
      return { background: style.backgroundColor, color: style.color, textDecoration: style.textDecorationLine };
    });
    expect(hover.background).not.toBe(states.sidebarBackground);
    expect(hover.background).not.toBe(states.current.background);
    expect(hover.color).toBe(states.inactiveColor);
    expect(hover.textDecoration).toBe("none");
  }
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
  await expect(menu.getByRole("link", { name: "Components" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "GitHub" })).toBeVisible();

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

test("canonical and legacy breadcrumbs retain their trail styling and keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/components/");
  await page.evaluate(() => {
    document.body.innerHTML = `
      <main>
        <nav id="canonical" aria-label="BREADCRUMB">
          <ul id="canonical-list">
            <li><a id="canonical-home" href="#home">Home</a></li>
            <li><a id="canonical-services" href="#services">Services</a></li>
            <li id="canonical-current">Current</li>
          </ul>
        </nav>
        <ul id="legacy" aria-label="Breadcrumb">
          <li><a href="#home">Home</a></li>
          <li><a href="#services">Services</a></li>
          <li id="legacy-current">Current</li>
        </ul>
      </main>`;
  });

  const breadcrumbs = await page.evaluate(() => {
    const read = (id) => {
      const list = document.getElementById(id);
      const current = list.querySelector("li:last-child");
      return {
        display: getComputedStyle(list).display,
        firstDivider: getComputedStyle(list.firstElementChild, "::after").content,
        lastDivider: getComputedStyle(current, "::after").content,
        listStyle: getComputedStyle(list).listStyleType,
        padding: getComputedStyle(list).paddingLeft,
        current: {
          color: getComputedStyle(current).color,
          fontWeight: getComputedStyle(current).fontWeight,
        },
      };
    };
    const canonical = document.getElementById("canonical");
    const canonicalList = canonical.querySelector("ul");
    const canonicalBreadcrumb = read("canonical-list");
    const legacyBreadcrumb = read("legacy");
    const probe = document.createElement("span");
    probe.style.color = "var(--foreground)";
    document.body.append(probe);
    const dividerBeforeOverride = getComputedStyle(canonicalList.firstElementChild, "::after").content;
    canonical.style.setProperty("--breadcrumb-divider", '"/"');
    const dividerAfterOverride = getComputedStyle(canonicalList.firstElementChild, "::after").content;
    return {
      canonical: canonicalBreadcrumb,
      canonicalWrapper: {
        display: getComputedStyle(canonical).display,
        height: canonical.getBoundingClientRect().height,
        listHeight: canonicalList.getBoundingClientRect().height,
        paddingBlock: getComputedStyle(canonical).paddingBlock,
      },
      dividerAfterOverride,
      dividerBeforeOverride,
      foreground: getComputedStyle(probe).color,
      legacy: legacyBreadcrumb,
    };
  });

  expect(breadcrumbs.canonical).toMatchObject({
    display: "flex",
    firstDivider: expect.stringContaining("›"),
    lastDivider: "none",
    listStyle: "none",
    padding: "0px",
  });
  expect(breadcrumbs.legacy).toEqual(breadcrumbs.canonical);
  expect(breadcrumbs.dividerBeforeOverride).toContain("›");
  expect(breadcrumbs.dividerAfterOverride).toContain("/");
  expect(breadcrumbs.canonical.current).toEqual({
    color: breadcrumbs.foreground,
    fontWeight: "500",
  });
  expect(breadcrumbs.canonicalWrapper).toMatchObject({ display: "block", paddingBlock: "0px" });
  expect(breadcrumbs.canonicalWrapper.height).toBeCloseTo(breadcrumbs.canonicalWrapper.listHeight, 5);

  const focusability = await page.locator("#canonical-home").evaluate((link) => link.tabIndex);
  expect(focusability).toBe(0);
  await page.locator("#canonical-home").focus();
  await expect(page.locator("#canonical-home")).toBeFocused();
  await expect(page.locator("#canonical-home")).toHaveCSS("outline-style", "solid");
  await expect(page.locator("#canonical-home")).toHaveCSS("outline-width", "2px");
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

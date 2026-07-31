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

test("ordinary hidden state overrides display-bearing Daft components", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <main>
        <div id="alert" role="alert" hidden>Hidden alert</div>
        <div id="status" role="status" hidden="">Hidden status</div>
        <button id="button" hidden>Hidden button</button>
        <span id="badge" class="badge" hidden="hidden">Hidden badge</span>
        <div id="grid" class="grid" hidden="irrelevant"><span>Hidden grid</span></div>
        <article id="card" hidden="">Hidden card</article>
      </main>`;

    const ids = ["alert", "status", "button", "badge", "grid", "card"];
    const read = (id) => {
      const element = document.getElementById(id);
      return {
        display: getComputedStyle(element).display,
        rendered: element.getClientRects().length > 0,
        visible: element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }),
      };
    };

    const hidden = Object.fromEntries(ids.map((id) => [id, read(id)]));
    for (const id of ids) document.getElementById(id).removeAttribute("hidden");
    const revealed = Object.fromEntries(ids.map((id) => [id, read(id)]));
    return { hidden, revealed };
  });

  for (const state of Object.values(result.hidden)) {
    expect(state).toEqual({ display: "none", rendered: false, visible: false });
  }
  expect(result.revealed).toEqual({
    alert: { display: "block", rendered: true, visible: true },
    badge: { display: "inline-flex", rendered: true, visible: true },
    button: { display: "inline-flex", rendered: true, visible: true },
    card: { display: "block", rendered: true, visible: true },
    grid: { display: "grid", rendered: true, visible: true },
    status: { display: "block", rendered: true, visible: true },
  });
});

test("hidden until-found retains native fragment reveal where supported", async ({ page }) => {
  await page.goto("/components/");

  const initial = await page.evaluate(() => {
    document.body.innerHTML = `
      <main>
        <a id="reveal-link" href="#until-found-probe">Reveal matching status</a>
        <div id="until-found-probe" role="status" hidden="UNTIL-FOUND">
          <span>Searchable status content</span>
        </div>
      </main>`;
    const element = document.getElementById("until-found-probe");
    window.untilFoundBeforeMatch = false;
    element.addEventListener("beforematch", () => { window.untilFoundBeforeMatch = true; });
    const style = getComputedStyle(element);
    return {
      contentVisibility: style.contentVisibility,
      display: style.display,
      hidden: element.hasAttribute("hidden"),
    };
  });

  test.skip(
    initial.contentVisibility !== "hidden" || initial.display === "none",
    "This browser does not implement hidden=until-found reveal behavior",
  );
  expect(initial).toEqual({
    contentVisibility: "hidden",
    display: "block",
    hidden: true,
  });

  await page.locator("#reveal-link").click();
  await page.waitForTimeout(100);
  const revealed = await page.evaluate(() => ({
    beforeMatch: window.untilFoundBeforeMatch,
    hidden: document.getElementById("until-found-probe").hasAttribute("hidden"),
  }));
  test.skip(
    !revealed.beforeMatch && revealed.hidden,
    "This browser exposes the hidden-until-found style but not fragment reveal",
  );
  expect(revealed).toEqual({ beforeMatch: true, hidden: false });
  await expect(page.locator("#until-found-probe")).toBeVisible();
  await expect(page.locator("#until-found-probe")).toHaveCSS("display", "block");
});

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

test("dropdown trigger and item SVGs share the icon token and centered flex composition", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.documentElement.style.setProperty("--icon-size", "19px");
    document.body.innerHTML = `
      <details class="dropdown" open>
        <summary id="trigger"><svg id="trigger-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16"/></svg>Actions</summary>
        <ul>
          <li><a id="icon-link" href="#profile"><svg id="link-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg>Profile</a></li>
          <li><label id="icon-label"><svg id="label-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16"/></svg>Enable alerts</label></li>
          <li><a id="text-link" href="#settings">Settings</a></li>
        </ul>
      </details>`;

    const readIcon = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return { flexShrink: style.flexShrink, height: style.height, width: style.width };
    };
    const readItem = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return {
        alignItems: style.alignItems,
        display: style.display,
        gap: style.gap,
        padding: style.padding,
      };
    };
    return {
      icons: ["trigger-icon", "link-icon", "label-icon"].map(readIcon),
      items: {
        iconLabel: readItem("icon-label"),
        iconLink: readItem("icon-link"),
        textLink: readItem("text-link"),
      },
    };
  });

  for (const icon of result.icons) {
    expect(icon).toEqual({ flexShrink: "0", height: "19px", width: "19px" });
  }
  expect(result.items.iconLink).toMatchObject({ alignItems: "center", display: "flex" });
  expect(result.items.iconLabel).toEqual(result.items.iconLink);
  expect(result.items.textLink).toEqual(result.items.iconLink);
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

test("document hgroups provide compact rhythm without flattening heading hierarchy", async ({ page }) => {
  await page.goto("/components/");

  const typography = await page.evaluate(() => {
    document.body.innerHTML = `
      <main>
        <hgroup id="primary-group"><h1 id="grouped-h1">Primary heading</h1><p id="grouped-subtitle">Primary subtitle</p></hgroup>
        <hgroup><h2 id="grouped-h2">Section heading</h2><p>Section subtitle</p></hgroup>
        <hgroup><h6 id="grouped-h6">Minor heading</h6><p>Minor subtitle</p></hgroup>
        <h1 id="reference-h1">Reference h1</h1>
        <h2 id="reference-h2">Reference h2</h2>
        <h6 id="reference-h6">Reference h6</h6>
        <span id="muted-reference" class="muted">Muted reference</span>
      </main>`;
    const readHeading = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return {
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        marginBottom: style.marginBottom,
        marginTop: style.marginTop,
      };
    };
    const groupStyle = getComputedStyle(document.getElementById("primary-group"));
    const subtitleStyle = getComputedStyle(document.getElementById("grouped-subtitle"));
    return {
      group: {
        display: groupStyle.display,
        flexDirection: groupStyle.flexDirection,
        gap: groupStyle.gap,
        marginBottom: groupStyle.marginBottom,
      },
      grouped: ["grouped-h1", "grouped-h2", "grouped-h6"].map(readHeading),
      references: ["reference-h1", "reference-h2", "reference-h6"].map(readHeading),
      subtitle: {
        color: subtitleStyle.color,
        lineHeight: subtitleStyle.lineHeight,
        marginBottom: subtitleStyle.marginBottom,
        marginTop: subtitleStyle.marginTop,
      },
      mutedColor: getComputedStyle(document.getElementById("muted-reference")).color,
    };
  });

  expect(typography.group).toEqual({
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "16px",
  });
  expect(typography.grouped.map(({ fontSize }) => fontSize)).toEqual(["36px", "30px", "16px"]);
  expect(typography.grouped.map(({ fontSize, lineHeight }) => ({ fontSize, lineHeight })))
    .toEqual(typography.references.map(({ fontSize, lineHeight }) => ({ fontSize, lineHeight })));
  for (const heading of typography.grouped) {
    expect(heading).toMatchObject({ marginBottom: "0px", marginTop: "0px" });
  }
  expect(typography.subtitle).toMatchObject({
    color: typography.mutedColor,
    lineHeight: "24px",
    marginBottom: "0px",
    marginTop: "0px",
  });
});

test("card headers keep compact card typography while inheriting the hgroup gap", async ({ page }) => {
  await page.goto("/components/");

  const typography = await page.evaluate(() => {
    document.body.innerHTML = `
      <article id="strong-card"><header><strong>Strong card title</strong></header></article>
      <article id="heading-card"><header><h6>Level-six card title</h6></header></article>
      <article id="group-card"><header><hgroup><h6>Grouped level-six title</h6><p>Card subtitle</p></hgroup></header></article>
      <span id="muted-reference" class="muted">Muted reference</span>`;
    const read = (selector) => {
      const style = getComputedStyle(document.querySelector(selector));
      return { fontSize: style.fontSize, fontWeight: style.fontWeight, lineHeight: style.lineHeight };
    };
    const groupStyle = getComputedStyle(document.querySelector("#group-card hgroup"));
    const subtitleStyle = getComputedStyle(document.querySelector("#group-card hgroup > p"));
    return {
      group: {
        display: groupStyle.display,
        flexDirection: groupStyle.flexDirection,
        gap: groupStyle.gap,
        margin: groupStyle.margin,
        minWidth: groupStyle.minWidth,
      },
      groupedHeading: read("#group-card h6"),
      heading: read("#heading-card h6"),
      strong: read("#strong-card strong"),
      mutedColor: getComputedStyle(document.getElementById("muted-reference")).color,
      subtitle: {
        color: subtitleStyle.color,
        fontSize: subtitleStyle.fontSize,
        lineHeight: subtitleStyle.lineHeight,
        margin: subtitleStyle.margin,
      },
    };
  });

  expect(typography.heading).toEqual({ fontSize: "18px", fontWeight: "600", lineHeight: "22.5px" });
  expect(typography.strong).toEqual(typography.heading);
  expect(typography.groupedHeading).toEqual(typography.heading);
  expect(typography.group).toEqual({
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    margin: "0px",
    minWidth: "0px",
  });
  expect(typography.subtitle).toMatchObject({
    color: typography.mutedColor,
    fontSize: "14px",
    lineHeight: "21px",
    margin: "0px",
  });
});

test("dialogs use one compact card-derived surface and preserve form control typography", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <article id="padding-reference">Card padding reference</article>
      <span id="muted-reference" class="muted">Muted reference</span>
      <dialog id="direct-heading" open aria-label="Direct heading dialog">
        <h2>Direct title</h2>
        <p>Direct body</p>
      </dialog>
      <dialog id="direct-header" open aria-label="Direct header dialog">
        <header><h2>Header title</h2><p>Header subtitle</p><button type="button" aria-label="Close"><svg aria-hidden="true" width="16" height="16"></svg></button></header>
        <p>Direct body</p>
        <footer><button type="button">Done</button></footer>
      </dialog>
      <dialog id="wide-dialog" open aria-label="Wide dialog" style="--modal-max-width: 40rem">
        <h2>Wide title</h2>
      </dialog>
      <dialog id="direct-hgroup" open aria-label="Direct hgroup dialog">
        <hgroup><h2>Grouped title</h2><p>Grouped subtitle</p></hgroup>
        <p>Direct body</p>
      </dialog>
      <dialog id="with-form" open aria-label="Form dialog">
        <header><strong>Form title</strong></header>
        <form method="dialog">
          <label for="dialog-field">Name</label>
          <input id="dialog-field" name="name">
          <footer><button type="button" class="secondary">Cancel</button><button type="submit">Save</button></footer>
        </form>
      </dialog>
      <dialog id="legacy" open aria-label="Legacy dialog">
        <article>
          <header><hgroup><h2>Legacy title</h2><p>Legacy subtitle</p></hgroup></header>
          <p>Legacy body</p>
          <footer><button type="button">Done</button></footer>
        </article>
      </dialog>`;

    const readSurface = (element) => {
      const style = getComputedStyle(element);
      return {
        background: style.backgroundColor,
        borderRadius: style.borderRadius,
        borderWidth: style.borderTopWidth,
        boxShadow: style.boxShadow,
        color: style.color,
        maxHeight: style.maxHeight,
        maxWidth: style.maxWidth,
        overflow: style.overflow,
        padding: style.padding,
        width: style.width,
      };
    };
    const readType = (element) => {
      const style = getComputedStyle(element);
      return {
        color: style.color,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
      };
    };
    const readFooter = (element) => {
      const style = getComputedStyle(element);
      return {
        alignItems: style.alignItems,
        display: style.display,
        gap: style.gap,
        justifyContent: style.justifyContent,
        marginTop: style.marginTop,
        padding: style.padding,
      };
    };

    const directHeading = document.getElementById("direct-heading");
    const directHeader = document.getElementById("direct-header");
    const directHgroup = document.getElementById("direct-hgroup");
    const wideDialog = document.getElementById("wide-dialog");
    const withForm = document.getElementById("with-form");
    const legacy = document.getElementById("legacy");
    const form = withForm.querySelector("form");
    const formStyle = getComputedStyle(form);
    return {
      cardPadding: getComputedStyle(document.getElementById("padding-reference")).padding,
      close: (() => {
        const header = directHeader.querySelector("header");
        const titleRect = header.querySelector("h2").getBoundingClientRect();
        const button = header.querySelector('[aria-label="Close"]');
        const buttonRect = button.getBoundingClientRect();
        const iconRect = button.querySelector("svg").getBoundingClientRect();
        const buttonStyle = getComputedStyle(button);
        return {
          buttonHeight: buttonStyle.height,
          centerDelta: Math.abs(titleRect.top + titleRect.height / 2 - (iconRect.top + iconRect.height / 2)),
          headerPaddingInlineEnd: getComputedStyle(header).paddingInlineEnd,
          right: buttonStyle.right,
          top: buttonStyle.top,
        };
      })(),
      controls: {
        button: readType(form.querySelector("button")),
        input: readType(form.querySelector("input")),
        label: readType(form.querySelector("label")),
      },
      form: {
        background: formStyle.backgroundColor,
        borderWidth: formStyle.borderTopWidth,
        boxShadow: formStyle.boxShadow,
        padding: formStyle.padding,
      },
      footers: [directHeader.querySelector("footer"), form.querySelector("footer"), legacy.querySelector("footer")].map(readFooter),
      legacyArticleDisplay: getComputedStyle(legacy.firstElementChild).display,
      mutedColor: getComputedStyle(document.getElementById("muted-reference")).color,
      subtitles: [
        directHeader.querySelector("header > p"),
        directHgroup.querySelector("hgroup > p"),
        legacy.querySelector("hgroup > p"),
      ].map(readType),
      surfaces: [directHeading, directHeader, directHgroup, withForm, legacy].map(readSurface),
      wideSurface: readSurface(wideDialog),
      titles: [
        directHeading.querySelector(":scope > h2"),
        directHeader.querySelector("header > h2"),
        directHgroup.querySelector("hgroup > h2"),
        withForm.querySelector("header > strong"),
        legacy.querySelector("hgroup > h2"),
      ].map(readType),
    };
  });

  expect(result.cardPadding).toBe("16px");
  expect(result.surfaces[0]).toMatchObject({ maxWidth: "384px", padding: "16px", width: "384px" });
  for (const surface of result.surfaces.slice(1)) expect(surface).toEqual(result.surfaces[0]);
  expect(result.wideSurface).toMatchObject({ maxWidth: "640px", padding: "16px", width: "640px" });
  expect(result.close).toMatchObject({
    buttonHeight: "32px",
    headerPaddingInlineEnd: "40px",
    right: "12px",
    top: "12px",
  });
  expect(result.close.centerDelta).toBeLessThan(1);
  for (const title of result.titles) {
    expect(title).toMatchObject({ fontSize: "18px", fontWeight: "600", lineHeight: "22.5px" });
  }
  for (const subtitle of result.subtitles) {
    expect(subtitle).toMatchObject({
      color: result.mutedColor,
      fontSize: "14px",
      fontWeight: "400",
      lineHeight: "21px",
    });
  }
  expect(result.controls.input.fontSize).toBe("16px");
  expect(result.controls.label.fontSize).toBe("14px");
  expect(result.controls.button.fontSize).toBe("14px");
  expect(result.footers[0]).toMatchObject({ display: "flex", justifyContent: "flex-end" });
  expect(result.footers[1]).toEqual(result.footers[0]);
  expect(result.footers[2]).toEqual(result.footers[0]);
  expect(result.form).toEqual({
    background: "rgba(0, 0, 0, 0)",
    borderWidth: "0px",
    boxShadow: "none",
    padding: "0px",
  });
  expect(result.legacyArticleDisplay).toBe("contents");
});

test("direct modal and popover dialogs preserve their distinct native open behavior", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 });
  await page.goto("/components/");
  await page.evaluate(() => {
    document.body.innerHTML = `
      <button id="outside" type="button">Outside control</button>
      <dialog id="modal" aria-label="Modal dialog"><p>Blocking content</p></dialog>
      <dialog id="popover-dialog" popover aria-label="Popover dialog"><p>Interruptible content</p></dialog>`;
  });

  const modal = page.locator("#modal");
  const popover = page.locator("#popover-dialog");
  await page.evaluate(() => document.getElementById("modal").showModal());
  await expect(modal).toBeVisible();
  const modalState = await page.evaluate(() => {
    const dialog = document.getElementById("modal");
    const outside = document.getElementById("outside");
    outside.focus();
    const style = getComputedStyle(dialog);
    return {
      activeOutside: document.activeElement === outside,
      backdrop: getComputedStyle(dialog, "::backdrop").backgroundColor,
      modal: dialog.matches(":modal"),
      open: dialog.open,
      popoverOpen: dialog.matches(":popover-open"),
      surface: {
        animationDuration: style.animationDuration,
        animationName: style.animationName,
        background: style.backgroundColor,
        borderRadius: style.borderRadius,
        boxShadow: style.boxShadow,
        maxHeight: style.maxHeight,
        overflow: style.overflow,
        padding: style.padding,
        width: style.width,
      },
    };
  });
  expect(modalState).toMatchObject({ activeOutside: false, modal: true, open: true, popoverOpen: false });
  expect(modalState.backdrop).not.toBe("rgba(0, 0, 0, 0)");
  expect(modalState.surface.animationName).toBe("modal-in");
  expect(Number.parseFloat(modalState.surface.animationDuration)).toBeGreaterThan(0);

  await page.evaluate(() => {
    document.getElementById("modal").close();
    document.getElementById("popover-dialog").showPopover();
  });
  await expect(modal).toBeHidden();
  await expect(popover).toBeVisible();
  const popoverState = await page.evaluate(() => {
    const dialog = document.getElementById("popover-dialog");
    const outside = document.getElementById("outside");
    outside.focus();
    const style = getComputedStyle(dialog);
    return {
      activeOutside: document.activeElement === outside,
      modal: dialog.matches(":modal"),
      open: dialog.open,
      popoverOpen: dialog.matches(":popover-open"),
      surface: {
        animationDuration: style.animationDuration,
        animationName: style.animationName,
        background: style.backgroundColor,
        borderRadius: style.borderRadius,
        boxShadow: style.boxShadow,
        maxHeight: style.maxHeight,
        overflow: style.overflow,
        padding: style.padding,
        width: style.width,
      },
    };
  });
  expect(popoverState).toMatchObject({ activeOutside: true, modal: false, open: false, popoverOpen: true });
  expect(popoverState.surface).toEqual(modalState.surface);

  const box = await popover.boundingBox();
  expect(box.width).toBeLessThan(800);
  expect(box.height).toBeLessThan(600);
  await page.mouse.click(5, 595);
  await expect(popover).toBeHidden();
  expect(await popover.evaluate((element) => element.matches(":popover-open"))).toBe(false);
});

test("dialog close controls keep canonical positioning and the legacy icon fallback", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <dialog open aria-label="Close controls">
        <button id="svg-close" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <header><button id="header-close" aria-label="Close"></button><strong>Direct title</strong></header>
        <p>Body</p>
      </dialog>
      <dialog open aria-label="Legacy close control"><article>
        <button id="legacy-close" rel="prev"></button><p>Body</p>
      </article></dialog>`;
    document.querySelectorAll("dialog").forEach((dialog) => dialog.getAnimations().forEach((animation) => animation.finish()));
    const readPosition = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return {
        height: style.height,
        position: style.position,
        right: style.right,
        top: style.top,
        width: style.width,
      };
    };
    const svgClose = document.getElementById("svg-close");
    const headerClose = document.getElementById("header-close");
    return {
      emptyContent: getComputedStyle(headerClose, "::before").content,
      emptyMask: getComputedStyle(headerClose, "::before").maskImage,
      positions: ["svg-close", "header-close", "legacy-close"].map(readPosition),
      svgContent: getComputedStyle(svgClose, "::before").content,
      svgCount: svgClose.querySelectorAll("svg").length,
    };
  });

  expect(result.positions[0]).toEqual({ height: "32px", position: "absolute", right: "12px", top: "12px", width: "32px" });
  expect(result.positions[1]).toEqual(result.positions[0]);
  expect(result.positions[2]).toEqual(result.positions[0]);
  expect(result.svgCount).toBe(1);
  expect(result.svgContent).toBe("none");
  expect(result.emptyContent).toBe('\"\"');
  expect(result.emptyMask).toContain("data:image/svg+xml");
});

test("direct and legacy dialog content scroll within the viewport max-height", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 400 });
  await page.goto("/components/");

  const metrics = await page.evaluate(() => {
    document.body.innerHTML = `
      <dialog id="direct-scroll" open aria-label="Direct scrolling dialog"><header><strong>Title</strong></header><div style="height: 50rem">Tall body</div></dialog>
      <dialog id="legacy-scroll" open aria-label="Legacy scrolling dialog"><article><header><strong>Title</strong></header><div style="height: 50rem">Tall body</div></article></dialog>`;
    document.querySelectorAll("dialog").forEach((dialog) => dialog.getAnimations().forEach((animation) => animation.finish()));
    return [document.getElementById("direct-scroll"), document.getElementById("legacy-scroll")].map((dialog) => {
      const style = getComputedStyle(dialog);
      return {
        clientHeight: dialog.clientHeight,
        height: dialog.getBoundingClientRect().height,
        maxHeight: style.maxHeight,
        overflowY: style.overflowY,
        scrollHeight: dialog.scrollHeight,
      };
    });
  });

  for (const metric of metrics) {
    expect(metric.maxHeight).toBe("368px");
    expect(metric.height).toBeLessThanOrEqual(368);
    expect(metric.overflowY).toBe("auto");
    expect(metric.scrollHeight).toBeGreaterThan(metric.clientHeight);
  }
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
    fromRootScale: { footerGap: "20px", headerGap: "20px", padding: "20px" },
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

test("default desktop sidebar remains persistent and shifts following landmarks", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.goto("/components/");

  await page.evaluate(() => {
    document.body.innerHTML = `
      <header id="application-header"><nav aria-label="Application"><ul>
        <li id="default-toggle-item"><button class="sidebar-toggle" type="button" popovertarget="default-sidebar">Open navigation</button></li>
        <li><strong>Workspace</strong></li>
      </ul></nav></header>
      <aside id="default-sidebar" class="sidebar" popover aria-label="Workspace navigation">
        <header>Workspace</header>
        <nav aria-label="Workspace"><ul>${Array.from({ length: 40 }, (_, index) => `<li><a href="#${index}">Item ${index}</a></li>`).join("")}</ul></nav>
        <footer>Account</footer>
      </aside>
      <main id="default-content"><article>Card reference</article></main>
      <footer id="application-footer">Page footer</footer>`;
  });

  const sidebar = page.locator("#default-sidebar");
  const toggle = page.locator("#default-toggle-item > .sidebar-toggle");
  await expect(sidebar).toBeVisible();
  await expect(toggle).toBeHidden();
  await expect(page.locator("#default-toggle-item")).toBeHidden();

  const shell = await page.evaluate(() => {
    const sidebar = document.getElementById("default-sidebar");
    const header = sidebar.querySelector("header");
    const nav = sidebar.querySelector("nav");
    const footer = sidebar.querySelector("footer");
    const sidebarRect = sidebar.getBoundingClientRect();
    const before = { headerTop: header.getBoundingClientRect().top, footerBottom: footer.getBoundingClientRect().bottom };
    nav.scrollTop = nav.scrollHeight;
    const after = { headerTop: header.getBoundingClientRect().top, footerBottom: footer.getBoundingClientRect().bottom };
    return {
      after,
      before,
      contentMargin: getComputedStyle(document.getElementById("default-content")).marginLeft,
      footerMargin: getComputedStyle(document.getElementById("application-footer")).marginLeft,
      headerMargin: getComputedStyle(document.getElementById("application-header")).marginLeft,
      navScrollTop: nav.scrollTop,
      navScrollable: nav.scrollHeight > nav.clientHeight,
      open: sidebar.matches(":popover-open"),
      position: getComputedStyle(sidebar).position,
      sidebarBottom: sidebarRect.bottom,
      sidebarOverflow: getComputedStyle(sidebar).overflow,
      sidebarTop: sidebarRect.top,
      sidebarWidth: sidebarRect.width,
      viewportHeight: innerHeight,
    };
  });

  expect(shell).toMatchObject({
    headerMargin: "0px",
    navScrollable: true,
    open: false,
    position: "fixed",
    sidebarBottom: shell.viewportHeight,
    sidebarOverflow: "hidden",
  });
  expect(shell.contentMargin).toBe(`${shell.sidebarWidth}px`);
  expect(shell.footerMargin).toBe(`${shell.sidebarWidth}px`);
  expect(shell.sidebarTop).toBeGreaterThan(0);
  expect(shell.navScrollTop).toBeGreaterThan(0);
  expect(shell.after).toEqual(shell.before);

  await page.keyboard.press("Escape");
  await expect(sidebar).toBeVisible();
  expect(await sidebar.evaluate((element) => element.matches(":popover-open"))).toBe(false);
});

for (const mode of [
  { className: "sidebar", name: "default mobile sidebar", viewport: { width: 375, height: 600 } },
  { className: "sidebar drawer", name: "desktop sidebar drawer", viewport: { width: 1280, height: 600 } },
]) {
  test(`${mode.name} uses one native, non-shifting drawer`, async ({ page }) => {
    await page.setViewportSize(mode.viewport);
    await page.goto("/components/");

    await page.evaluate(({ className }) => {
      document.body.innerHTML = `
        <header><nav aria-label="Application"><ul>
          <li id="drawer-toggle-item"><button class="sidebar-toggle" type="button" popovertarget="drawer-sidebar">Open navigation</button></li>
          <li><strong>Workspace</strong></li>
        </ul></nav></header>
        <aside id="drawer-sidebar" class="${className}" popover aria-label="Workspace navigation">
          <header>Workspace <button class="sidebar-toggle" type="button" popovertarget="drawer-sidebar" popovertargetaction="hide">Close navigation</button></header>
          <nav aria-label="Workspace"><ul>${Array.from({ length: 40 }, (_, index) => `<li><a href="#${index}">Item ${index}</a></li>`).join("")}</ul></nav>
          <footer>Account</footer>
        </aside>
        <main id="drawer-content"><article>Application content</article></main>
        <footer>Page footer</footer>`;
    }, { className: mode.className });

    const sidebar = page.locator("#drawer-sidebar");
    const toggle = page.locator("#drawer-toggle-item > .sidebar-toggle");
    const initialContent = await page.locator("#drawer-content").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, width: rect.width };
    });

    await expect(sidebar).toBeHidden();
    await expect(toggle).toBeVisible();
    await expect(page.locator("#drawer-toggle-item")).toBeVisible();
    expect(await sidebar.evaluate((element) => element.matches(":popover-open"))).toBe(false);

    await toggle.click();
    await expect(sidebar).toBeVisible();

    const shell = await sidebar.evaluate((element) => {
      const header = element.querySelector("header");
      const nav = element.querySelector("nav");
      const footer = element.querySelector("footer");
      const before = {
        footerBottom: footer.getBoundingClientRect().bottom,
        headerTop: header.getBoundingClientRect().top,
      };
      nav.scrollTop = nav.scrollHeight;
      const after = {
        footerBottom: footer.getBoundingClientRect().bottom,
        headerTop: header.getBoundingClientRect().top,
      };
      const sidebarStyle = getComputedStyle(element);
      return {
        after,
        backdrop: getComputedStyle(element, "::backdrop").backgroundColor,
        before,
        display: sidebarStyle.display,
        flexDirection: sidebarStyle.flexDirection,
        navOverflow: getComputedStyle(nav).overflowY,
        navScrollTop: nav.scrollTop,
        navScrollable: nav.scrollHeight > nav.clientHeight,
        open: element.matches(":popover-open"),
        position: sidebarStyle.position,
        sidebarOverflow: sidebarStyle.overflow,
        sidebarScrollable: element.scrollHeight > element.clientHeight,
      };
    });
    const openContent = await page.locator("#drawer-content").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, right: rect.right, width: rect.width };
    });

    expect(shell).toMatchObject({
      display: "flex",
      flexDirection: "column",
      navOverflow: "auto",
      navScrollable: true,
      open: true,
      position: "fixed",
      sidebarOverflow: "hidden",
      sidebarScrollable: false,
    });
    expect(shell.backdrop).not.toBe("rgba(0, 0, 0, 0)");
    expect(shell.navScrollTop).toBeGreaterThan(0);
    expect(shell.after).toEqual(shell.before);
    expect(openContent).toEqual(initialContent);

    await sidebar.getByRole("button", { name: "Close navigation" }).click();
    await expect(sidebar).toBeHidden();
    expect(await sidebar.evaluate((element) => element.matches(":popover-open"))).toBe(false);

    await toggle.click();
    await expect(sidebar).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sidebar).toBeHidden();

    await toggle.click();
    await expect(sidebar).toBeVisible();
    await page.mouse.click(mode.viewport.width - 4, mode.viewport.height - 4);
    await expect(sidebar).toBeHidden();
    expect(await sidebar.evaluate((element) => element.matches(":popover-open"))).toBe(false);
  });
}

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
      const sidebarRect = sidebar.getBoundingClientRect();
      const inactiveRect = inactive.getBoundingClientRect();
      const sidebarStyle = getComputedStyle(sidebar);
      const sidebarContentRight = sidebarRect.right - Number.parseFloat(sidebarStyle.borderRightWidth);
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
          leftInset: inactiveRect.left - sidebarRect.left,
          rightInset: sidebarContentRight - inactiveRect.right,
        },
      };
    });

    expect(states.current.background).not.toBe(states.sidebarBackground);
    expect(states.current.color).toBe(states.inactiveColor);
    expect(states.current.fontWeight).toBe("600");
    expect(states.falseCurrentBackground).toBe("rgba(0, 0, 0, 0)");
    expect(states.geometry).toEqual({
      borderRadius: "6px",
      paddingLeft: "8px",
      paddingRight: "8px",
      leftInset: 16,
      rightInset: 16,
    });

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
    legacy.style.setProperty("--breadcrumb-divider", '"/"');
    const readDividerSpacing = (list) => {
      const firstItem = list.firstElementChild;
      const divider = getComputedStyle(firstItem, "::after");
      return {
        marginInlineStart: getComputedStyle(firstItem.nextElementSibling).marginInlineStart,
        paddingInlineEnd: divider.paddingInlineEnd,
        paddingInlineStart: divider.paddingInlineStart,
      };
    };
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
      spacing: {
        canonical: readDividerSpacing(canonicalList),
        legacy: readDividerSpacing(document.getElementById("legacy")),
      },
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
  for (const spacing of Object.values(breadcrumbs.spacing)) {
    expect(spacing).toEqual({
      marginInlineStart: "0px",
      paddingInlineEnd: "8px",
      paddingInlineStart: "8px",
    });
  }
  expect(breadcrumbs.spacing.legacy).toEqual(breadcrumbs.spacing.canonical);

  const focusability = await page.locator("#canonical-home").evaluate((link) => link.tabIndex);
  expect(focusability).toBe(0);
  await page.locator("#canonical-home").focus();
  await expect(page.locator("#canonical-home")).toBeFocused();
  await expect(page.locator("#canonical-home")).toHaveCSS("outline-style", "solid");
  await expect(page.locator("#canonical-home")).toHaveCSS("outline-width", "2px");
});

test("SVG defaults preserve inline alignment and canonical navigation icon composition", async ({ page }) => {
  await page.goto("/components/");
  await page.evaluate(() => {
    document.documentElement.style.setProperty("--icon-size", "19px");
    document.body.innerHTML = `
      <p>Before <svg id="ordinary" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg> after</p>
      <button id="icon-only" class="icon ghost" type="button" aria-label="Search" style="color: rgb(12 34 56)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
      </button>
      <button id="icon-text" type="button" style="color: rgb(65 43 21)">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
        Search projects
      </button>
      <nav id="icon-navigation"><ul><li><a id="nav-icon-link" href="#projects">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></svg>
        Projects
      </a></li></ul></nav>`;
  });

  await expect(page.getByRole("button", { name: "Search", exact: true })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Search projects", exact: true })).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Projects", exact: true })).toHaveCount(1);

  const result = await page.evaluate(() => {
    const readControl = (id) => {
      const button = document.getElementById(id);
      const svg = button.querySelector("svg");
      const style = getComputedStyle(svg);
      return {
        alignItems: getComputedStyle(button).alignItems,
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
    };
    const ordinary = getComputedStyle(document.getElementById("ordinary"));
    return {
      controls: ["icon-only", "icon-text"].map(readControl),
      navigation: {
        alignItems: getComputedStyle(document.getElementById("icon-navigation")).alignItems,
        display: getComputedStyle(document.getElementById("icon-navigation")).display,
        link: readControl("nav-icon-link"),
        linkGap: getComputedStyle(document.getElementById("nav-icon-link")).gap,
        linkDisplay: getComputedStyle(document.getElementById("nav-icon-link")).display,
      },
      ordinary: {
        display: ordinary.display,
        maxWidth: ordinary.maxWidth,
        verticalAlign: ordinary.verticalAlign,
      },
    };
  });

  expect(result.ordinary).toEqual({ display: "inline-block", maxWidth: "100%", verticalAlign: "middle" });
  expect(result.navigation).toMatchObject({
    alignItems: "center",
    display: "flex",
    linkDisplay: "inline-flex",
    linkGap: "8px",
    link: {
      alignItems: "center",
      ariaHidden: "true",
      height: "19px",
      width: "19px",
    },
  });
  for (const control of result.controls) {
    expect(control).toMatchObject({
      alignItems: "center",
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

test("slides retain their hgroup gap and presentation scale", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/slides/");

  const typography = await page.evaluate(() => {
    document.body.innerHTML = `
      <section id="standard" style="--slide-text: 20px">
        <hgroup><h1>Standard slide title</h1><p>Standard slide subtitle</p></hgroup>
      </section>
      <section id="title" class="title" style="--slide-text: 20px">
        <hgroup><h1>Title slide title</h1><p>Title slide subtitle</p></hgroup>
      </section>`;
    const read = (id) => {
      const slide = document.getElementById(id);
      const groupStyle = getComputedStyle(slide.querySelector("hgroup"));
      const titleStyle = getComputedStyle(slide.querySelector("h1"));
      const subtitleStyle = getComputedStyle(slide.querySelector("hgroup > p"));
      return {
        group: {
          display: groupStyle.display,
          flexDirection: groupStyle.flexDirection,
          gap: groupStyle.gap,
          margin: groupStyle.margin,
        },
        subtitle: {
          fontSize: Number.parseFloat(subtitleStyle.fontSize),
          lineHeight: Number.parseFloat(subtitleStyle.lineHeight),
        },
        titleSize: Number.parseFloat(titleStyle.fontSize),
      };
    };
    return { standard: read("standard"), title: read("title") };
  });

  expect(typography.standard.group).toEqual({
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    margin: "0px",
  });
  expect(typography.title.group).toEqual(typography.standard.group);
  expect(typography.standard.subtitle.lineHeight)
    .toBeCloseTo(typography.standard.subtitle.fontSize * 1.25, 1);
  expect(typography.title.titleSize).toBeGreaterThan(typography.standard.titleSize);
  expect(typography.title.subtitle.fontSize).toBeGreaterThan(typography.standard.subtitle.fontSize);
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

test("table small text remains subordinate without utility classes", async ({ page }) => {
  await page.goto("/components/");

  const typography = await page.evaluate(() => {
    document.body.innerHTML = `
      <span id="muted" class="muted">Muted reference</span>
      <table><tbody><tr><td>Primary <small>Secondary metadata</small></td></tr></tbody></table>`;
    const cellStyle = getComputedStyle(document.querySelector("td"));
    const smallStyle = getComputedStyle(document.querySelector("td small"));
    return {
      cellSize: cellStyle.fontSize,
      smallSize: smallStyle.fontSize,
      smallLineHeight: smallStyle.lineHeight,
      smallColor: smallStyle.color,
      mutedColor: getComputedStyle(document.getElementById("muted")).color,
    };
  });

  expect(typography.cellSize).toBe("14px");
  expect(typography.smallSize).toBe("12px");
  expect(typography.smallLineHeight).toBe("15px");
  expect(typography.smallColor).toBe(typography.mutedColor);
});

test("stack owns direct-child spacing without flattening nested content", async ({ page }) => {
  await page.goto("/components/");

  const spacing = await page.evaluate(() => {
    document.body.innerHTML = `
      <main class="container">
        <div class="stack">
          <section id="first"><p id="nested">Nested content</p><span>Tail</span></section>
          <article id="second">Second surface</article>
        </div>
      </main>`;
    const first = document.getElementById("first");
    const second = document.getElementById("second");
    const firstRect = first.getBoundingClientRect();
    const secondRect = second.getBoundingClientRect();
    return {
      firstMargin: getComputedStyle(first).marginBlock,
      secondMargin: getComputedStyle(second).marginBlock,
      gap: secondRect.top - firstRect.bottom,
      nestedMarginBottom: getComputedStyle(document.getElementById("nested")).marginBottom,
    };
  });

  expect(spacing).toEqual({
    firstMargin: "0px",
    secondMargin: "0px",
    gap: 16,
    nestedMarginBottom: "16px",
  });
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

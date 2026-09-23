import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { discoverHtmlRoutes } from "./docs-routes.js";

const coreBadgeSource = readFileSync("src/components/badge.css", "utf8");
const coreButtonSource = readFileSync("src/components/button.css", "utf8");
const coreDocumentSource = readFileSync("src/base/document.css", "utf8");
const coreResetSource = readFileSync("src/base/reset.css", "utf8");
const coreRootSource = readFileSync("src/base/root.css", "utf8");
const coreVariablesSource = readFileSync("src/base/variables.css", "utf8");

async function loadCoreBadgeSource(page) {
  await page.setContent("<!doctype html><html><head></head><body></body></html>");
  await page.addStyleTag({ content: `
    @layer tokens, reset, base, components;
    @layer tokens { ${coreVariablesSource} }
    @layer reset { ${coreResetSource} }
    @layer base { ${coreRootSource} ${coreDocumentSource} }
    @layer components { ${coreBadgeSource} ${coreButtonSource} }
  ` });
}

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

test("dropdown menus use compact 28px items and a small muted group label", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <details class="dropdown" open>
        <summary>Actions</summary>
        <ul id="menu">
          <li class="label" id="label">My account</li>
          <li><a id="link" href="#profile">Profile</a></li>
          <li><label id="choice"><input type="checkbox"> Enable alerts</label></li>
        </ul>
      </details>
      <span id="muted-probe" style="color: var(--muted-foreground)">Muted</span>`;
    const read = (id) => {
      const element = document.getElementById(id);
      const style = getComputedStyle(element);
      return { fontSize: style.fontSize, height: element.getBoundingClientRect().height, padding: style.padding };
    };
    const menu = getComputedStyle(document.getElementById("menu"));
    return {
      choice: read("choice"),
      label: { ...read("label"), color: getComputedStyle(document.getElementById("label")).color },
      link: { ...read("link"), borderRadius: getComputedStyle(document.getElementById("link")).borderRadius },
      menu: { borderRadius: menu.borderRadius, minWidth: menu.minWidth },
      muted: getComputedStyle(document.getElementById("muted-probe")).color,
    };
  });

  expect(result.menu).toEqual({ borderRadius: "10px", minWidth: "128px" });
  expect(result.link).toEqual({ borderRadius: "8px", fontSize: "14px", height: 28, padding: "4px 6px" });
  expect(result.choice.height).toBe(28);
  expect(result.label).toEqual({ color: result.muted, fontSize: "12px", height: 24, padding: "4px 6px" });
});

test("dropdown data-placement=\"end\" aligns the menu's inline-end edge with the trigger", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto("/components/");

  const edges = await page.evaluate(() => {
    const menu = '<ul><li><a href="#a">A considerably longer menu item</a></li></ul>';
    document.body.innerHTML = `
      <main style="padding-inline: 400px">
        <div><details id="start" class="dropdown" open><summary>Start</summary>${menu}</details></div>
        <div><details id="end" class="dropdown" data-placement="end" open><summary>End</summary>${menu}</details></div>
        <div><details id="old-rtl" class="dropdown" open><summary>Old</summary><ul dir="rtl"><li><a href="#a">A considerably longer menu item</a></li></ul></details></div>
        <div dir="rtl"><details id="rtl-end" class="dropdown" data-placement="end" open><summary>End</summary>${menu}</details></div>
        <nav aria-label="Bar"><ul><li><details id="nav" class="dropdown" open><summary>Nav</summary>${menu}</details></li></ul></nav>
      </main>`;
    const read = (id) => {
      const details = document.getElementById(id);
      const trigger = details.getBoundingClientRect();
      const list = details.querySelector("ul");
      const rect = list.getBoundingClientRect();
      return {
        direction: getComputedStyle(list).direction,
        left: Math.round(rect.left - trigger.left),
        right: Math.round(trigger.right - rect.right),
        wider: rect.width > trigger.width + 20,
      };
    };
    return Object.fromEntries(["start", "end", "old-rtl", "rtl-end", "nav"].map((id) => [id, read(id)]));
  });

  for (const edge of Object.values(edges)) expect(edge.wider).toBe(true);
  expect(edges.start.left).toBe(0);
  expect(edges.end.right).toBe(0);
  expect(edges.end.left).toBeLessThan(0);
  // Inline-end is the left edge in a right-to-left context.
  expect(edges["rtl-end"].left).toBe(0);
  expect(edges["rtl-end"].right).toBeLessThan(0);
  // Menus inside a nav end-align automatically.
  expect(edges.nav.right).toBe(0);
  // dir="rtl" on the menu is no longer an alignment hook or a direction reset.
  expect(edges["old-rtl"].left).toBe(0);
  expect(edges["old-rtl"].direction).toBe("rtl");
});

test("tooltips render a 28px bubble with a non-interactive arrow on every placement", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <main style="padding: 6rem">
        <button id="top" data-tooltip="Top tip">Top</button>
        <button id="bottom" data-tooltip="Bottom tip" data-placement="bottom">Bottom</button>
        <button id="left" data-tooltip="Left tip" data-placement="left">Left</button>
        <button id="right" data-tooltip="Right tip" data-placement="right">Right</button>
        <details class="dropdown"><summary id="menu" data-tooltip="Menu tip">Menu</summary><ul><li><a href="#a">A</a></li></ul></details>
      </main>`;
    const sides = (style) => ({ bottom: style.bottom, left: style.left, right: style.right, top: style.top });
    const read = (id) => {
      const element = document.getElementById(id);
      const bubble = getComputedStyle(element, "::before");
      const arrow = getComputedStyle(element, "::after");
      return {
        arrow: {
          background: arrow.backgroundColor,
          content: arrow.content,
          height: arrow.height,
          opacity: arrow.opacity,
          pointerEvents: arrow.pointerEvents,
          position: arrow.position,
          sides: sides(arrow),
          width: arrow.width,
        },
        bubble: {
          background: bubble.backgroundColor,
          fontWeight: bubble.fontWeight,
          height: bubble.height,
          sides: sides(bubble),
        },
      };
    };
    return {
      placements: Object.fromEntries(["top", "bottom", "left", "right"].map((id) => [id, read(id)])),
      summaryArrowPosition: getComputedStyle(document.getElementById("menu"), "::after").position,
    };
  });

  const anchoredSide = { bottom: "top", left: "right", right: "left", top: "bottom" };
  for (const [placement, { arrow, bubble }] of Object.entries(result.placements)) {
    expect(bubble).toMatchObject({ fontWeight: "400", height: "28px" });
    expect(arrow).toMatchObject({
      background: bubble.background,
      content: '""',
      height: "10px",
      opacity: "0",
      pointerEvents: "none",
      position: "absolute",
      width: "10px",
    });
    const side = anchoredSide[placement];
    expect(arrow.sides[side]).toBe(bubble.sides[side]);
  }
  // Summary chevrons keep their own ::after instead of becoming an arrow.
  expect(result.summaryArrowPosition).not.toBe("absolute");

  await page.locator("#top").hover();
  await expect.poll(() => page.locator("#top").evaluate((element) => getComputedStyle(element, "::after").opacity)).toBe("1");
});

test("button-only, vertical, and install groups retain segmented treatment", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <main style="--border-width: 2px">
        <div id="buttons" role="group" aria-label="View">
          <button id="button-first" class="outline">First</button>
          <button id="button-middle" class="outline">Middle</button>
          <button id="button-last" class="outline">Last</button>
        </div>
        <div id="vertical" role="group" class="vertical" aria-label="Stacked view">
          <button id="vertical-first" class="outline">First</button>
          <button id="vertical-last" class="outline">Last</button>
        </div>
        <div id="install" role="group" aria-label="Install command">
          <select aria-label="Package manager"><option>npm</option></select>
          <code id="install-code">install daftcss</code>
          <button>Copy</button>
        </div>
      </main>`;

    const style = (id) => getComputedStyle(document.getElementById(id));
    const rect = (id) => document.getElementById(id).getBoundingClientRect();
    const first = style("button-first");
    const middle = style("button-middle");
    const last = style("button-last");
    const verticalFirst = style("vertical-first");
    const verticalLast = style("vertical-last");
    const installCode = style("install-code");

    return {
      buttons: {
        borderWidth: style("buttons").borderTopWidth,
        firstRightRadius: first.borderTopRightRadius,
        firstLeftRadius: first.borderTopLeftRadius,
        lastLeftRadius: last.borderTopLeftRadius,
        lastRightRadius: last.borderTopRightRadius,
        middleMargin: middle.marginLeft,
        middleRadius: middle.borderRadius,
        overlap: rect("button-first").right - rect("button-middle").left,
      },
      install: {
        codeBackground: installCode.backgroundColor,
        codeBorder: installCode.borderTopWidth,
        wrapperBorder: style("install").borderTopWidth,
      },
      vertical: {
        direction: style("vertical").flexDirection,
        firstBottomRadius: verticalFirst.borderBottomLeftRadius,
        lastTopRadius: verticalLast.borderTopLeftRadius,
        marginTop: verticalLast.marginTop,
      },
    };
  });

  expect(result.buttons).toMatchObject({
    borderWidth: "0px",
    firstRightRadius: "0px",
    lastLeftRadius: "0px",
    middleMargin: "-2px",
    middleRadius: "0px",
    overlap: 2,
  });
  expect(result.buttons.firstLeftRadius).not.toBe("0px");
  expect(result.buttons.lastRightRadius).not.toBe("0px");
  expect(result.vertical).toMatchObject({
    direction: "column",
    firstBottomRadius: "0px",
    lastTopRadius: "0px",
    marginTop: "-2px",
  });
  expect(result.install.wrapperBorder).toBe("0px");
  expect(result.install.codeBorder).toBe("2px");
  expect(result.install.codeBackground).not.toBe("rgba(0, 0, 0, 0)");
});

test(".w-full fills buttons and groups; the removed .full-width class does nothing", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <main>
        <div id="box" style="width: 300px">
          <p><button id="w-button" class="w-full" type="button">Go</button></p>
          <p><button id="old-button" class="full-width" type="button">Go</button></p>
          <p><a id="w-link" class="button w-full" href="#go">Go</a></p>
          <div id="w-group" role="group" class="w-full"><select aria-label="Currency"><option>USD</option></select><input id="w-amount" type="number" aria-label="Amount"></div>
          <div id="old-group" role="group" class="full-width"><select aria-label="Currency"><option>USD</option></select><input type="number" aria-label="Amount"></div>
        </div>
      </main>`;
    const read = (id) => {
      const element = document.getElementById(id);
      return { display: getComputedStyle(element).display, width: element.getBoundingClientRect().width };
    };
    const group = document.getElementById("w-group").getBoundingClientRect();
    const amount = document.getElementById("w-amount").getBoundingClientRect();
    return {
      amountRightGap: Math.round(group.right - amount.right),
      oldButton: read("old-button"),
      oldGroup: read("old-group"),
      wButton: read("w-button"),
      wGroup: read("w-group"),
      wLink: read("w-link"),
    };
  });

  expect(result.wButton.width).toBe(300);
  expect(result.wLink.width).toBe(300);
  expect(result.wGroup).toEqual({ display: "flex", width: 300 });
  expect(result.amountRightGap).toBe(0);
  expect(result.oldButton.width).toBeLessThan(300);
  expect(result.oldGroup.display).toBe("inline-flex");
  expect(result.oldGroup.width).toBeLessThan(300);
});

test("text-like role groups and search landmarks become unified field shells", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <style>* { transition: none !important; }</style>
      <main style="--input: rgb(10 20 30); --input-background: rgb(240 241 242); --muted-foreground: rgb(90 91 92)">
        <div id="icon-shell" role="group"><svg id="leading-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg><input id="icon-input" aria-label="Icon field"></div>
        <div id="prefix-shell" role="group"><span id="prefix">https://</span><input id="prefix-input" type="text" aria-label="Domain"></div>
        <div id="action-shell" role="group"><input id="action-input" type="email" aria-label="Action field"><button id="action-button" type="button">Apply</button></div>
        <div id="full-shell" role="group" class="w-full"><svg id="full-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16"/></svg><input id="full-input" aria-label="Full field"><button id="full-button" class="ghost icon" type="button" aria-label="Clear"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12"/></svg></button></div>
        <form id="search-shell" role="search" style="width: 300px"><input id="search-input" type="search" aria-label="Search"><button type="submit">Search</button></form>
        <div id="small-shell" role="group" class="small"><span>USD</span><input aria-label="Small amount"></div>
        <div id="large-shell" role="group" class="large"><span>USD</span><input aria-label="Large amount"></div>
        <section id="narrow" style="width: 160px"><div id="narrow-shell" role="group" class="w-full"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg><input id="narrow-input" aria-label="Narrow field"><button type="button">Go</button></div></section>
      </main>`;

    const read = (id) => {
      const element = document.getElementById(id);
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return {
        background: style.backgroundColor,
        borderRadius: style.borderRadius,
        borderWidth: style.borderTopWidth,
        boxShadow: style.boxShadow,
        flexGrow: style.flexGrow,
        flexShrink: style.flexShrink,
        height: box.height,
        minWidth: style.minWidth,
        pointerEvents: style.pointerEvents,
        width: box.width,
      };
    };
    const shellBox = document.getElementById("full-shell").getBoundingClientRect();
    const buttonBox = document.getElementById("full-button").getBoundingClientRect();
    const iconStyle = getComputedStyle(document.getElementById("leading-icon"));
    const ghostButton = document.getElementById("full-button");
    const actionStyle = getComputedStyle(document.getElementById("action-button"));
    const standaloneSearch = document.createElement("input");
    standaloneSearch.type = "search";
    standaloneSearch.setAttribute("aria-label", "Standalone search");
    document.querySelector("main").append(standaloneSearch);
    const standaloneSearchStyle = getComputedStyle(standaloneSearch);
    const narrowBox = document.getElementById("narrow").getBoundingClientRect();
    const narrowShellBox = document.getElementById("narrow-shell").getBoundingClientRect();

    return {
      actionButton: read("action-button"),
      actionInset: {
        marginBottom: actionStyle.marginBottom,
        marginInlineEnd: actionStyle.marginInlineEnd,
        marginTop: actionStyle.marginTop,
      },
      ghostIcon: {
        color: getComputedStyle(ghostButton).color,
        svgHeight: ghostButton.querySelector("svg").getBoundingClientRect().height,
        svgWidth: ghostButton.querySelector("svg").getBoundingClientRect().width,
      },
      iconInset: { marginInlineEnd: iconStyle.marginInlineEnd, marginInlineStart: iconStyle.marginInlineStart },
      standaloneSearchRadius: standaloneSearchStyle.borderRadius,
      full: {
        buttonBottom: buttonBox.bottom,
        buttonHeight: buttonBox.height,
        buttonTop: buttonBox.top,
        buttonWidth: buttonBox.width,
        shellBottom: shellBox.bottom,
        shellHeight: shellBox.height,
        shellTop: shellBox.top,
        shellWidth: shellBox.width,
      },
      icon: read("leading-icon"),
      inputs: ["icon-input", "prefix-input", "action-input", "full-input", "search-input", "narrow-input"].map(read),
      narrow: {
        containerRight: narrowBox.right,
        inputWidth: document.getElementById("narrow-input").getBoundingClientRect().width,
        shellRight: narrowShellBox.right,
        shellScrollWidth: document.getElementById("narrow-shell").scrollWidth,
        shellWidth: narrowShellBox.width,
      },
      prefix: { ...read("prefix"), color: getComputedStyle(document.getElementById("prefix")).color },
      search: read("search-shell"),
      shells: ["icon-shell", "prefix-shell", "action-shell", "full-shell", "narrow-shell"].map(read),
      sizes: { large: read("large-shell").height, small: read("small-shell").height },
    };
  });

  for (const shell of result.shells) {
    expect(shell).toMatchObject({
      background: "rgb(240, 241, 242)",
      borderWidth: "1px",
    });
    expect(shell.borderRadius).not.toBe("0px");
  }
  for (const input of result.inputs) {
    expect(input).toMatchObject({
      background: "rgba(0, 0, 0, 0)",
      borderRadius: "0px",
      borderWidth: "0px",
      boxShadow: "none",
      flexGrow: "1",
      minWidth: "0px",
    });
  }
  expect(result.icon).toMatchObject({
    flexGrow: "0",
    flexShrink: "0",
    height: 16,
    pointerEvents: "none",
    width: 16,
  });
  expect(result.prefix).toMatchObject({
    background: "rgba(0, 0, 0, 0)",
    borderWidth: "0px",
    color: "rgb(90, 91, 92)",
    flexGrow: "0",
    flexShrink: "0",
  });
  expect(result.actionButton.borderWidth).toBe("0px");
  expect(result.actionButton.flexGrow).toBe("0");
  expect(result.actionButton.height).toBe(24);
  expect(result.actionInset).toEqual({ marginBottom: "3px", marginInlineEnd: "3px", marginTop: "3px" });
  expect(result.iconInset).toEqual({ marginInlineEnd: "6px", marginInlineStart: "8px" });
  expect(result.ghostIcon).toEqual({ color: "rgb(90, 91, 92)", svgHeight: 14, svgWidth: 14 });
  expect(result.full.shellWidth).toBe(1280);
  expect(result.full.buttonHeight).toBeLessThan(result.full.shellHeight);
  expect(result.actionButton.width).not.toBe(result.actionButton.height);
  expect(result.full.buttonHeight).toBe(26);
  expect(result.full.buttonWidth).toBe(result.full.buttonHeight);
  expect(result.full.buttonTop).toBeGreaterThan(result.full.shellTop);
  expect(result.full.buttonBottom).toBeLessThan(result.full.shellBottom);
  // Search uses the ordinary field radius, not a pill.
  expect(result.search.borderRadius).toBe("10px");
  expect(result.standaloneSearchRadius).toBe("10px");
  expect(result.search.width).toBe(300);
  expect(result.sizes).toEqual({ large: 36, small: 28 });
  expect(result.narrow.shellWidth).toBe(160);
  expect(result.narrow.shellRight).toBeLessThanOrEqual(result.narrow.containerRight);
  expect(result.narrow.shellScrollWidth).toBeLessThanOrEqual(result.narrow.shellWidth);
  expect(result.narrow.inputWidth).toBeGreaterThan(0);
});

test("field shells keep multiple actions inset on either side of one input", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <main style="width: 220px">
        <div id="composer" role="group" aria-label="Message composer">
          <button id="attach" class="icon ghost" type="button" aria-label="Attach file"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m16 6-8 8"/></svg></button>
          <input id="message" aria-label="Message" placeholder="Write a message">
          <button id="dictate" class="icon ghost" type="button" aria-label="Dictate message"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/></svg></button>
          <button id="send" type="button">Send</button>
        </div>
      </main>`;

    const shell = document.getElementById("composer");
    const input = document.getElementById("message");
    const shellBox = shell.getBoundingClientRect();
    const inputStyle = getComputedStyle(input);
    const readAction = (id) => {
      const element = document.getElementById(id);
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return {
        borderWidth: style.borderTopWidth,
        bottom: box.bottom,
        height: box.height,
        left: box.left,
        marginInlineEnd: style.marginInlineEnd,
        marginInlineStart: style.marginInlineStart,
        right: box.right,
        tabIndex: element.tabIndex,
        top: box.top,
      };
    };

    return {
      actions: [readAction("attach"), readAction("dictate"), readAction("send")],
      input: {
        borderWidth: inputStyle.borderTopWidth,
        flexGrow: inputStyle.flexGrow,
        minWidth: inputStyle.minWidth,
        tabIndex: input.tabIndex,
        width: input.getBoundingClientRect().width,
      },
      order: ["attach", "message", "dictate", "send"].map((id) => document.getElementById(id).getBoundingClientRect().left),
      shell: {
        borderWidth: getComputedStyle(shell).borderTopWidth,
        left: shellBox.left,
        right: shellBox.right,
        scrollWidth: shell.scrollWidth,
        width: shellBox.width,
      },
    };
  });

  expect(result.shell).toMatchObject({ borderWidth: "1px", width: 220 });
  expect(result.shell.scrollWidth).toBeLessThanOrEqual(result.shell.width);
  expect(result.input).toMatchObject({ borderWidth: "0px", flexGrow: "1", minWidth: "0px", tabIndex: 0 });
  expect(result.input.width).toBeGreaterThan(0);
  expect(result.order).toEqual([...result.order].sort((a, b) => a - b));
  for (const action of result.actions) {
    expect(action.borderWidth).toBe("0px");
    expect(action.left).toBeGreaterThan(result.shell.left);
    expect(action.right).toBeLessThan(result.shell.right);
    expect(action.tabIndex).toBe(0);
  }
  expect(result.actions.map((action) => action.marginInlineStart)).toEqual(["3px", "4px", "4px"]);
  expect(result.actions[0].marginInlineEnd).toBe("0px");
  expect(result.actions[1].marginInlineEnd).toBe("0px");
  expect(result.actions[2].marginInlineEnd).toBe("3px");
});

test("field shells expose wrapper focus, action, validation, and inactive states", async ({ page }) => {
  await page.goto("/components/");
  await page.evaluate(() => {
    document.body.innerHTML = `
      <style>* { transition: none !important; }</style>
      <main style="--input: rgb(10 20 30); --input-background: rgb(240 241 242); --ring: rgb(11 22 33); --focus-ring: 0 0 0 3px rgb(11 22 33); --focus-ring-destructive: 0 0 0 3px rgb(201 31 41); --primary: rgb(21 121 71); --destructive: rgb(201 31 41); --muted: rgb(220 221 222); --muted-foreground: rgb(90 91 92); --foreground: rgb(15 16 17)">
        <div id="focus-shell" role="group"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg><input id="focus-input" aria-label="Focusable field"><button id="focus-button" type="button">Apply</button></div>
        <div id="invalid-shell" role="group"><input id="invalid-input" aria-label="Validated field" aria-invalid="true"></div>
        <div id="disabled-shell" role="group"><input id="disabled-input" aria-label="Disabled field" disabled value="Disabled"><button id="disabled-action" type="button">Enabled action</button></div>
        <div id="readonly-shell" role="group"><span>Key</span><input id="readonly-input" aria-label="Read-only field" readonly value="Readable"></div>
      </main>`;
  });

  const focusShell = page.locator("#focus-shell");
  const focusInput = page.locator("#focus-input");
  const focusButton = page.locator("#focus-button");
  const buttonBackground = await focusButton.evaluate((element) => getComputedStyle(element).backgroundColor);
  await focusButton.hover();
  await expect.poll(() => focusButton.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(buttonBackground);

  await focusInput.focus();
  await expect(focusShell).toHaveCSS("border-top-color", "rgb(11, 22, 33)");
  expect(await focusShell.evaluate((element) => getComputedStyle(element).boxShadow)).toContain("11, 22, 33");
  await expect(focusInput).toHaveCSS("border-top-width", "0px");
  await expect(focusInput).toHaveCSS("box-shadow", "none");

  await page.keyboard.press("Tab");
  await focusButton.focus();
  await expect(focusButton).toBeFocused();
  expect(await focusButton.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
  await expect(focusButton).toHaveCSS("outline-width", "3px");
  expect(await focusShell.evaluate((element) => getComputedStyle(element).boxShadow)).toContain("11, 22, 33");

  const invalid = await page.locator("#invalid-shell").evaluate((element) => {
    const input = element.querySelector("input");
    const shellStyle = getComputedStyle(element);
    const inputStyle = getComputedStyle(input);
    return {
      inputBorder: inputStyle.borderTopWidth,
      inputShadow: inputStyle.boxShadow,
      shellBorder: shellStyle.borderTopColor,
      shellShadow: shellStyle.boxShadow,
    };
  });
  expect(invalid).toMatchObject({
    inputBorder: "0px",
    inputShadow: "none",
    shellBorder: "rgb(201, 31, 41)",
  });
  expect(invalid.shellShadow).not.toBe("none");

  await page.locator("#invalid-input").evaluate((element) => element.setAttribute("aria-invalid", "false"));
  await expect(page.locator("#invalid-shell")).toHaveCSS("border-top-color", "rgb(10, 20, 30)");
  await expect(page.locator("#invalid-shell")).toHaveCSS("box-shadow", "none");

  const inactive = await page.evaluate(() => {
    const read = (shellId, inputId) => {
      const shell = getComputedStyle(document.getElementById(shellId));
      const input = getComputedStyle(document.getElementById(inputId));
      return {
        inputBackground: input.backgroundColor,
        inputColor: input.color,
        inputOpacity: input.opacity,
        shellBackground: shell.backgroundColor,
        shellOpacity: shell.opacity,
      };
    };
    return {
      disabled: {
        ...read("disabled-shell", "disabled-input"),
        actionOpacity: getComputedStyle(document.getElementById("disabled-action")).opacity,
      },
      readonly: read("readonly-shell", "readonly-input"),
    };
  });
  expect(inactive.disabled).toEqual({
    actionOpacity: "1",
    inputBackground: "rgba(0, 0, 0, 0)",
    inputColor: "rgb(15, 16, 17)",
    inputOpacity: "0.5",
    shellBackground: "rgb(220, 221, 222)",
    shellOpacity: "1",
  });
  expect(inactive.readonly).toEqual({
    inputBackground: "rgba(0, 0, 0, 0)",
    inputColor: "rgb(15, 16, 17)",
    inputOpacity: "1",
    shellBackground: "rgb(220, 221, 222)",
    shellOpacity: "1",
  });
});

test("incompatible controls and complex group structures do not trigger field-shell mode", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    const excludedTypes = [
      "hidden", "checkbox", "radio", "range", "file", "color", "date", "datetime-local",
      "month", "week", "time", "number", "submit", "reset", "button", "image",
    ];
    document.body.innerHTML = `
      <main>
        <div id="text-shell" role="group"><input aria-label="Text control"></div>
        <form id="valid-search" role="search"><input type="text" aria-label="Search"><button type="submit">Search</button></form>
        ${excludedTypes.map((type) => `<div id="excluded-${type}" role="group"><input aria-label="${type} control" type="${type}"${type === "image" ? " width=24 height=16" : ""}></div>`).join("")}
        <div id="excluded-textarea" role="group"><textarea aria-label="Multiline control"></textarea></div>
        <div id="excluded-select" role="group"><input aria-label="Text with select"><select aria-label="Choice"><option>A</option></select></div>
        <div id="excluded-label" role="group"><label for="labeled">Label</label><input id="labeled"></div>
        <div id="excluded-legend" role="group"><legend>Legend</legend><input aria-label="Legend field"></div>
        <div id="excluded-fieldset-child" role="group"><fieldset><input aria-label="Nested fieldset input"></fieldset><input aria-label="Outer input"></div>
        <fieldset id="excluded-fieldset-wrapper" role="group"><input aria-label="Fieldset group input"></fieldset>
        <div id="excluded-nested-group" role="group"><span role="group">Addon</span><input aria-label="Nested group field"></div>
        <div id="excluded-multiple-inputs" role="group"><input aria-label="First field"><input aria-label="Second field"></div>
        <div id="excluded-native-action" role="group"><input aria-label="Native action field"><input type="submit" value="Submit"></div>
        <div id="excluded-helper" role="group"><input aria-label="Field with helper"><small>Helper text</small></div>
        <div id="excluded-paragraph" role="group"><input aria-label="Field with paragraph"><p>Unexpected child</p></div>
        <div id="excluded-search-div" role="search"><input type="search" aria-label="Invalid search container"></div>
        <form id="excluded-search-email" role="search"><input type="email" aria-label="Email search"></form>
        <div id="excluded-shadcn" data-slot="input-group" role="group"><div role="group" data-slot="input-group-addon">Addon</div><input data-slot="input-group-control" aria-label="Generated shadcn field"></div>
      </main>`;
    const read = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return { id, background: style.backgroundColor, borderWidth: style.borderTopWidth, height: style.height };
    };
    const structuralIds = [
      "excluded-textarea", "excluded-select", "excluded-label", "excluded-legend",
      "excluded-fieldset-child", "excluded-fieldset-wrapper", "excluded-nested-group",
      "excluded-multiple-inputs", "excluded-native-action",
      "excluded-helper", "excluded-paragraph", "excluded-search-div",
      "excluded-search-email", "excluded-shadcn",
    ];
    return {
      excluded: [
        ...excludedTypes.map((type) => read(`excluded-${type}`)),
        ...structuralIds.map(read),
      ],
      search: read("valid-search"),
      text: read("text-shell"),
    };
  });

  expect(result.text).toMatchObject({ borderWidth: "1px", height: "32px" });
  expect(result.search).toMatchObject({ borderWidth: "1px", height: "32px" });
  for (const wrapper of result.excluded) {
    expect(wrapper.borderWidth, wrapper.id).toBe("0px");
    expect(wrapper.background, wrapper.id).toBe("rgba(0, 0, 0, 0)");
  }
});

test("standalone form rows keep rhythm while nested controls defer to their container", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <main>
        <section id="standalone">
          <input id="standalone-first" aria-label="First field">
          <input id="standalone-last" aria-label="Last field">
        </section>
        <form id="regular-form">
          <input id="form-first" aria-label="First form field">
          <input id="form-last" aria-label="Last form field">
        </form>
        <section>
          <form id="row-search" role="search"><input type="search" aria-label="Search"><button>Search</button></form>
          <div id="row-group" role="group"><span>https://</span><input id="group-input" aria-label="Domain"></div>
          <label id="wrapped-label">Wrapped field<input id="wrapped-input"></label>
        </section>
      </main>`;

    const marginBottom = (id) => getComputedStyle(document.getElementById(id)).marginBottom;
    const gap = (first, second) => {
      const firstBox = document.getElementById(first).getBoundingClientRect();
      const secondBox = document.getElementById(second).getBoundingClientRect();
      return secondBox.top - firstBox.bottom;
    };
    return {
      form: { first: marginBottom("form-first"), gap: gap("form-first", "form-last"), last: marginBottom("form-last") },
      nested: { group: marginBottom("row-group"), groupInput: marginBottom("group-input"), input: marginBottom("wrapped-input") },
      rows: { search: marginBottom("row-search"), searchToGroup: gap("row-search", "row-group") },
      standalone: { first: marginBottom("standalone-first"), gap: gap("standalone-first", "standalone-last"), last: marginBottom("standalone-last") },
    };
  });

  expect(result.standalone).toEqual({ first: "8px", gap: 8, last: "0px" });
  expect(result.form).toEqual({ first: "16px", gap: 16, last: "0px" });
  expect(result.rows).toEqual({ search: "8px", searchToGroup: 8 });
  expect(result.nested).toEqual({ group: "8px", groupInput: "0px", input: "0px" });
});

test("file selector buttons share inset action geometry", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    const input = document.createElement("input");
    input.type = "file";
    document.body.append(input);
    const inputStyle = getComputedStyle(input);
    const buttonStyle = getComputedStyle(input, "::file-selector-button");
    return {
      button: {
        borderRadius: buttonStyle.borderRadius,
        fontFamily: buttonStyle.fontFamily,
        fontSize: buttonStyle.fontSize,
        height: buttonStyle.height,
        paddingInline: buttonStyle.paddingInline,
      },
      input: {
        height: inputStyle.height,
        paddingInline: inputStyle.paddingInline,
      },
    };
  });

  expect(result.input).toEqual({ height: "32px", paddingInline: "4px" });
  expect(result.button).toMatchObject({ borderRadius: "6px", fontSize: "14px", height: "22px", paddingInline: "10px" });
  expect(result.button.fontFamily).toContain("system-ui");
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

test("button sizes form a proportional height, spacing, type, and radius hierarchy", async ({ page }) => {
  await page.goto("/components/");

  const styles = await page.evaluate(() => {
    document.body.innerHTML = `
      <button id="small" class="small" type="button"><svg aria-hidden="true"></svg>Small</button>
      <button id="default" type="button"><svg aria-hidden="true"></svg>Default</button>
      <button id="large" class="large" type="button"><svg aria-hidden="true"></svg>Large</button>`;
    const read = (id) => {
      const element = document.getElementById(id);
      const style = getComputedStyle(element);
      return {
        borderRadius: style.borderRadius,
        fontSize: style.fontSize,
        gap: style.gap,
        height: style.height,
        paddingInline: style.paddingInline,
      };
    };
    return { default: read("default"), large: read("large"), small: read("small") };
  });

  expect(styles).toEqual({
    default: { borderRadius: "10px", fontSize: "14px", gap: "6px", height: "32px", paddingInline: "10px" },
    large: { borderRadius: "10px", fontSize: "14px", gap: "6px", height: "36px", paddingInline: "16px" },
    small: { borderRadius: "8px", fontSize: "13px", gap: "4px", height: "28px", paddingInline: "8px" },
  });
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
        <div style="width: 240px"><a id="full-link" class="button w-full" href="#full">Full width</a></div>
        <a id="ordinary" class="secondary outline large icon" href="#ordinary">Ordinary link</a>
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

test("solid accent composes across every documented component and button state", async ({ page }) => {
  await page.goto("/components/");
  await page.evaluate(() => {
    document.body.innerHTML = `
      <style>* { transition: none !important; }</style>
      <main style="--accent: #a3f0c4; --accent-foreground: #052e1b; width: 240px">
        <button id="button" class="accent" type="button">Accent action</button>
        <input id="input-button" class="accent" type="button" value="Input button">
        <input id="input-submit" class="accent" type="submit" value="Input submit">
        <span id="role-button" class="accent" role="button" tabindex="0">Role button</span>
        <details><summary id="button-summary" class="accent" role="button">Accent disclosure</summary><p>Details</p></details>
        <button id="small" class="accent small" type="button">Small</button>
        <button id="icon" class="accent icon large" type="button" aria-label="Add"><svg viewBox="0 0 24 24" aria-hidden="true"></svg></button>
        <button id="full" class="accent w-full" type="button">Full width</button>
        <button id="disabled" class="accent" type="button" disabled>Disabled</button>
        <button id="busy" class="accent" type="button" disabled aria-busy="true">Busy</button>
        <a id="link" class="button accent" href="#next">Accent link</a>
        <span id="group" role="group" class="large"><button id="group-button" class="accent" type="button">Grouped</button><button class="outline" type="button">Other</button></span>
        <details class="dropdown"><summary id="summary" class="accent">Accent menu</summary><ul><li><a href="#item">Item</a></li></ul></details>
        <span id="badge" class="badge accent">Accent badge</span>
        <progress id="progress" class="accent" value="64" max="100">64%</progress>
        <progress id="indeterminate-progress" class="accent"></progress>
      </main>`;
  });

  const styles = await page.evaluate(() => {
    const read = (id) => {
      const element = document.getElementById(id);
      const style = getComputedStyle(element);
      return {
        background: style.backgroundColor,
        color: style.color,
        height: style.height,
        opacity: style.opacity,
        progressColor: style.getPropertyValue("--progress-color").trim(),
        width: style.width,
      };
    };
    return Object.fromEntries(["button", "input-button", "input-submit", "role-button", "button-summary", "small", "icon", "full", "disabled", "busy", "link", "group-button", "summary", "badge", "progress", "indeterminate-progress"].map((id) => [id, read(id)]));
  });

  for (const id of ["button", "input-button", "input-submit", "role-button", "button-summary", "small", "icon", "full", "disabled", "busy", "link", "group-button", "summary", "badge"]) {
    expect(styles[id].background, id).toBe("rgb(163, 240, 196)");
    expect(styles[id].color, id).toBe("rgb(5, 46, 27)");
  }
  expect(styles.small.height).toBe("28px");
  expect(styles.icon.height).toBe("36px");
  expect(styles.icon.width).toBe(styles.icon.height);
  expect(styles.full.width).toBe("240px");
  expect(styles["group-button"].height).toBe("36px");
  expect(styles.disabled.opacity).toBe("0.5");
  expect(styles.busy.opacity).toBe("0.5");
  expect(styles.progress.progressColor).toBe("#a3f0c4");
  expect(styles["indeterminate-progress"].progressColor).toBe("#a3f0c4");

  const button = page.locator("#button");
  const restBackground = styles.button.background;
  await button.hover();
  await expect.poll(() => button.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(restBackground);
  await page.mouse.down();
  const activeBackground = await button.evaluate((element) => getComputedStyle(element).backgroundColor);
  await page.mouse.up();
  expect(activeBackground).not.toBe(restBackground);

  await button.focus();
  await expect(button).toHaveCSS("outline-width", "3px");
  const outlineColor = await button.evaluate((element) => getComputedStyle(element).outlineColor);
  expect(outlineColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(await page.locator("#busy").evaluate((element) => getComputedStyle(element, "::before").content)).not.toBe("none");
});

test("accent foreground auto-contrasts and preserves explicit overrides", async ({ page }) => {
  await loadCoreBadgeSource(page);
  const colors = await page.evaluate(() => {
    document.body.innerHTML = `
      <style>* { transition: none !important; }</style>
      <button id="probe" class="accent" type="button">Accent</button>
      <i id="black" style="color: oklch(0 0 0)"></i>
      <i id="white" style="color: oklch(1 0 0)"></i>`;
    const root = document.documentElement;
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    const color = (id) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = getComputedStyle(document.getElementById(id)).color;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
    };
    const reference = { black: color("black"), white: color("white") };

    root.style.cssText = "--accent: #a3f0c4";
    const light = color("probe");
    root.style.cssText = "--accent: #052e1b";
    const dark = color("probe");
    root.style.cssText = "--accent: #a3f0c4; --accent-foreground: #052e1b";
    const explicit = color("probe");
    return { ...reference, dark, explicit, light };
  });

  expect(colors.light).toEqual(colors.black);
  expect(colors.dark).toEqual(colors.white);
  expect(colors.explicit).toEqual([5, 46, 27]);
});

test("established surface variants and selected state take precedence over accent", async ({ page }) => {
  await page.goto("/components/");
  const states = await page.evaluate(() => {
    const variants = ["secondary", "destructive", "outline", "ghost", "link"];
    const badgeVariants = ["secondary", "destructive", "outline", "ghost", "success", "warning"];
    const progressVariants = ["secondary", "success", "warning", "destructive"];
    document.body.innerHTML = `<main style="--accent: #a3f0c4; --accent-foreground: #052e1b">
      ${variants.map((variant) => `<button id="plain-${variant}" class="${variant}">${variant}</button><button id="mixed-${variant}" class="accent ${variant}">${variant}</button>`).join("")}
      <input id="reset-plain" type="reset" value="Reset"><input id="reset-accent" class="accent" type="reset" value="Reset accent">
      <button id="selected-plain" aria-pressed="true">Selected</button>
      <button id="selected-accent" class="accent" aria-pressed="true">Selected accent</button>
      ${badgeVariants.map((variant) => `<span id="badge-plain-${variant}" class="badge ${variant}">Badge</span><span id="badge-mixed-${variant}" class="badge accent ${variant}">Badge</span>`).join("")}
      ${progressVariants.map((variant) => `<progress id="progress-plain-${variant}" class="${variant}" value="50" max="100"></progress><progress id="progress-mixed-${variant}" class="accent ${variant}" value="50" max="100"></progress>`).join("")}
    </main>`;
    const read = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return { background: style.backgroundColor, border: style.borderTopColor, color: style.color };
    };
    return {
      badges: Object.fromEntries(badgeVariants.map((variant) => [variant, { mixed: read(`badge-mixed-${variant}`), plain: read(`badge-plain-${variant}`) }])),
      progress: Object.fromEntries(progressVariants.map((variant) => [variant, {
        mixed: getComputedStyle(document.getElementById(`progress-mixed-${variant}`)).getPropertyValue("--progress-color"),
        plain: getComputedStyle(document.getElementById(`progress-plain-${variant}`)).getPropertyValue("--progress-color"),
      }])),
      resetAccent: read("reset-accent"),
      resetPlain: read("reset-plain"),
      selectedAccent: read("selected-accent"),
      selectedPlain: read("selected-plain"),
      variants: Object.fromEntries(variants.map((variant) => [variant, { mixed: read(`mixed-${variant}`), plain: read(`plain-${variant}`) }])),
    };
  });

  for (const state of Object.values(states.variants)) expect(state.mixed).toEqual(state.plain);
  for (const state of Object.values(states.badges)) expect(state.mixed).toEqual(state.plain);
  for (const state of Object.values(states.progress)) expect(state.mixed).toBe(state.plain);
  expect(states.resetAccent).toEqual(states.resetPlain);
  expect(states.selectedAccent).toEqual(states.selectedPlain);
});

test("accent remains scoped to its documented semantic component surfaces", async ({ page }) => {
  await page.goto("/components/");
  const pairs = await page.evaluate(() => {
    document.body.innerHTML = `<main>
      <p id="text-plain">Text</p><p id="text-accent" class="accent">Text</p>
      <a id="link-plain" href="#plain">Link</a><a id="link-accent" class="accent" href="#accent">Link</a>
      <input id="field-plain" value="Field"><input id="field-accent" class="accent" value="Field">
      <input id="choice-plain" type="checkbox"><input id="choice-accent" class="accent" type="checkbox">
      <article id="card-plain">Card</article><article id="card-accent" class="accent">Card</article>
      <details><summary id="ordinary-summary-plain">Summary</summary></details><details><summary id="ordinary-summary-accent" class="accent">Summary</summary></details>
    </main>`;
    const read = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return {
        background: style.backgroundColor,
        border: style.borderTopColor,
        color: style.color,
        display: style.display,
      };
    };
    return Object.fromEntries(["text", "link", "field", "choice", "card", "ordinary-summary"].map((name) => [name, {
      accent: read(`${name}-accent`),
      plain: read(`${name}-plain`),
    }]));
  });

  for (const state of Object.values(pairs)) expect(state.accent).toEqual(state.plain);
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
      return { fontSize: style.fontSize, fontWeight: style.fontWeight, letterSpacing: style.letterSpacing, lineHeight: style.lineHeight };
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

  expect(typography.heading).toEqual({ fontSize: "16px", fontWeight: "500", letterSpacing: "normal", lineHeight: "22px" });
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
      <dialog id="wrapped" open aria-label="Wrapped dialog">
        <article>
          <header><strong>Card title</strong></header>
          <p>Card body</p>
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
    const wrapped = document.getElementById("wrapped");
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
      footers: [directHeader.querySelector("footer"), form.querySelector("footer")].map(readFooter),
      wrapped: {
        articleDisplay: getComputedStyle(wrapped.firstElementChild).display,
        articleBorderWidth: getComputedStyle(wrapped.firstElementChild).borderTopWidth,
        dialogPaddingBottom: getComputedStyle(wrapped).paddingBottom,
        headerPaddingInlineEnd: getComputedStyle(wrapped.querySelector("header")).paddingInlineEnd,
      },
      mutedColor: getComputedStyle(document.getElementById("muted-reference")).color,
      subtitles: [
        directHeader.querySelector("header > p"),
        directHgroup.querySelector("hgroup > p"),
      ].map(readType),
      surfaces: [directHeading, directHeader, directHgroup, withForm].map(readSurface),
      wideSurface: readSurface(wideDialog),
      titles: [
        directHeading.querySelector(":scope > h2"),
        directHeader.querySelector("header > h2"),
        directHgroup.querySelector("hgroup > h2"),
        withForm.querySelector("header > strong"),
      ].map(readType),
    };
  });

  expect(result.cardPadding).toBe("16px");
  expect(result.surfaces[0]).toMatchObject({ maxWidth: "384px", padding: "16px", width: "384px" });
  // Dialogs that close with a footer band drop their bottom padding.
  const withoutPadding = ({ padding, ...surface }) => surface;
  for (const surface of result.surfaces.slice(1)) expect(withoutPadding(surface)).toEqual(withoutPadding(result.surfaces[0]));
  expect(result.surfaces.map((surface) => surface.padding)).toEqual(["16px", "16px 16px 0px", "16px", "16px 16px 0px"]);
  expect(result.wideSurface).toMatchObject({ maxWidth: "640px", padding: "16px", width: "640px" });
  expect(result.close).toMatchObject({
    buttonHeight: "32px",
    headerPaddingInlineEnd: "40px",
    right: "12px",
    top: "12px",
  });
  expect(result.close.centerDelta).toBeLessThan(1);
  for (const title of result.titles) {
    expect(title).toMatchObject({ fontSize: "16px", fontWeight: "500", lineHeight: "24px" });
  }
  for (const subtitle of result.subtitles) {
    expect(subtitle).toMatchObject({
      color: result.mutedColor,
      fontSize: "14px",
      fontWeight: "400",
      lineHeight: "21px",
    });
  }
  // Dialogs keep the ordinary --input-font-size (14px at this desktop width).
  expect(result.controls.input.fontSize).toBe("14px");
  expect(result.controls.label.fontSize).toBe("14px");
  expect(result.controls.button.fontSize).toBe("14px");
  expect(result.footers[0]).toMatchObject({ display: "flex", justifyContent: "flex-end" });
  expect(result.footers[1]).toEqual(result.footers[0]);
  expect(result.form).toEqual({
    background: "rgba(0, 0, 0, 0)",
    borderWidth: "0px",
    boxShadow: "none",
    padding: "0px",
  });
  // An article inside a dialog is an ordinary nested card, not flattened into
  // the dialog surface, and its footer does not turn into the dialog band.
  expect(result.wrapped).toEqual({
    articleDisplay: "block",
    articleBorderWidth: "1px",
    dialogPaddingBottom: "16px",
    headerPaddingInlineEnd: "0px",
  });
});

test("dialog header close buttons are recognized by label prefix or close behavior", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <dialog id="labelled" open aria-label="Labelled close dialog">
        <header><h2>Title</h2><button type="button" class="icon ghost" aria-label="Close dialog"><svg aria-hidden="true" width="16" height="16"></svg></button></header>
        <p>Body</p>
      </dialog>
      <dialog id="behavior" popover aria-label="Behavior close dialog">
        <header><h2>Titel</h2><button type="button" class="icon" aria-label="Schließen" popovertarget="behavior" popovertargetaction="hide"><svg aria-hidden="true" width="16" height="16"></svg></button></header>
        <p>Inhalt</p>
        <footer><button type="button" popovertarget="behavior" popovertargetaction="hide">Abbrechen</button></footer>
      </dialog>`;
    document.getElementById("behavior").showPopover();

    const readClose = (button) => {
      const dialogRect = button.closest("dialog").getBoundingClientRect();
      const rect = button.getBoundingClientRect();
      const style = getComputedStyle(button);
      return {
        height: style.height,
        position: style.position,
        rightInset: Math.round(dialogRect.right - rect.right),
        topInset: Math.round(rect.top - dialogRect.top),
      };
    };
    return {
      labelled: readClose(document.querySelector("#labelled header > button")),
      behavior: readClose(document.querySelector("#behavior header > button")),
      footerPosition: getComputedStyle(document.querySelector("#behavior footer > button")).position,
    };
  });

  const expected = { height: "32px", position: "absolute", rightInset: 12, topInset: 12 };
  expect(result.labelled).toEqual(expected);
  expect(result.behavior).toEqual(expected);
  expect(result.footerPosition).toBe("static");
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
      backdropFilter: getComputedStyle(dialog, "::backdrop").backdropFilter,
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
  // Light 10% black overlay with a 4px blur.
  expect(modalState.backdrop).toMatch(/^(?:oklch\(0%? 0 0 \/ 0\.1\)|rgba\(0, 0, 0, 0\.1\))$/);
  expect(modalState.backdropFilter).toBe("blur(4px)");
  expect(modalState.surface.animationName).toBe("daft-modal-in");
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

test("dialog close controls keep canonical positioning and draw no icon of their own", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <dialog open aria-label="Close controls">
        <button id="svg-close" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        <header><button id="header-close" aria-label="Close"></button><strong>Direct title</strong></header>
        <p>Body</p>
        <button id="prev-button" rel="prev" type="button">Back</button>
      </dialog>`;
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
      positions: ["svg-close", "header-close"].map(readPosition),
      prevPosition: getComputedStyle(document.getElementById("prev-button")).position,
      svgContent: getComputedStyle(svgClose, "::before").content,
      svgCount: svgClose.querySelectorAll("svg").length,
    };
  });

  expect(result.positions[0]).toEqual({ height: "32px", position: "absolute", right: "12px", top: "12px", width: "32px" });
  expect(result.positions[1]).toEqual(result.positions[0]);
  expect(result.svgCount).toBe(1);
  expect(result.svgContent).toBe("none");
  // No generated fallback icon, and rel="prev" is no longer a close hook.
  expect(result.emptyContent).toBe("none");
  expect(result.prevPosition).toBe("static");
});

test("dialog content scrolls within the viewport max-height", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 400 });
  await page.goto("/components/");

  const metrics = await page.evaluate(() => {
    document.body.innerHTML = `
      <dialog id="direct-scroll" open aria-label="Direct scrolling dialog"><header><strong>Title</strong></header><div style="height: 50rem">Tall body</div></dialog>`;
    document.querySelectorAll("dialog").forEach((dialog) => dialog.getAnimations().forEach((animation) => animation.finish()));
    return [document.getElementById("direct-scroll")].map((dialog) => {
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
    fromCardTokens: { footerGap: "12px", headerGap: "12px", padding: "20px 20px 0px" },
    fromRootScale: { footerGap: "20px", headerGap: "20px", padding: "20px 20px 0px" },
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
    padding: "24px 24px 0px",
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

test("busy spinners stay inline in text buttons and centered in icon-only buttons", async ({ page }) => {
  await page.goto("/components/");
  await page.evaluate(() => {
    const icon = '<svg viewBox="0 0 24 24"><path d="M5 12h14"/></svg>';
    document.body.innerHTML = `
      <main style="width: 480px">
        <button id="text" aria-busy="true">Saving</button>
        <button id="text-icon" aria-busy="true">${icon}Save</button>
        <button id="icon-only" class="icon" aria-busy="true" aria-label="Refresh">${icon}</button>
        <button id="empty" aria-busy="true" aria-label="Refresh"></button>
        <form><button id="full" class="w-full" type="submit" aria-busy="true">Sign in</button></form>
        <article id="card" aria-busy="true"></article>
      </main>`;
  });

  const result = await page.evaluate(() => Object.fromEntries(["text", "text-icon", "icon-only", "empty", "full", "card"].map((id) => {
    const element = document.getElementById(id);
    const spinner = getComputedStyle(element, "::before");
    const box = element.getBoundingClientRect();
    const svg = element.querySelector("svg");
    return [id, {
      margin: [spinner.marginTop, spinner.marginRight, spinner.marginBottom, spinner.marginLeft],
      width: spinner.width,
      animationName: spinner.animationName,
      paddingInline: getComputedStyle(element).paddingLeft === getComputedStyle(element).paddingRight,
      svgDisplay: svg ? getComputedStyle(svg).display : null,
      buttonWidth: box.width,
    }];
  })));

  for (const id of ["text", "text-icon", "full"]) {
    expect(result[id].margin).toEqual(["0px", "0px", "0px", "0px"]);
  }
  expect(result["text-icon"].svgDisplay).not.toBe("none");
  for (const id of ["icon-only", "empty"]) {
    expect(result[id].margin).toEqual(["0px", "0px", "0px", "0px"]);
    expect(result[id].width).toBe(result.text.width);
    expect(result[id].paddingInline).toBe(true);
  }
  expect(result["icon-only"].svgDisplay).toBe("none");
  expect(result.full.buttonWidth).toBe(480);
  expect(result.card.margin[1]).toBe(result.card.margin[3]);
  expect(Number.parseFloat(result.card.margin[1])).toBeGreaterThan(0);
  expect(Number.parseFloat(result.card.width)).toBeGreaterThan(Number.parseFloat(result.text.width));
  for (const id of Object.keys(result)) expect(result[id].animationName).toBe("daft-spin");
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

test("inline code wraps long tokens while direct pre code remains a scrolling code block", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 600 });
  await page.goto("/components/");

  const layout = await page.evaluate(() => {
    const token = "very-long-inline-code-token-".repeat(12);
    document.body.innerHTML = `
      <main style="width: 240px">
        <p id="inline-parent">Use <code id="inline-code">${token}</code> in a sentence.</p>
        <pre id="fenced-code"><code>${token}</code></pre>
      </main>`;

    const inline = document.getElementById("inline-code");
    const inlineRange = document.createRange();
    inlineRange.selectNodeContents(inline);
    const pre = document.getElementById("fenced-code");
    const fenced = pre.querySelector("code");
    const inlineStyle = getComputedStyle(inline);
    const fencedStyle = getComputedStyle(fenced);
    const preStyle = getComputedStyle(pre);
    return {
      documentWidth: document.documentElement.scrollWidth,
      fenced: {
        clientWidth: pre.clientWidth,
        codeWhiteSpace: fencedStyle.whiteSpace,
        overflowX: preStyle.overflowX,
        scrollWidth: pre.scrollWidth,
      },
      inline: {
        lineCount: inlineRange.getClientRects().length,
        overflowWrap: inlineStyle.overflowWrap,
        whiteSpace: inlineStyle.whiteSpace,
      },
      viewportWidth: innerWidth,
    };
  });

  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.inline).toMatchObject({ overflowWrap: "anywhere", whiteSpace: "normal" });
  expect(layout.inline.lineCount).toBeGreaterThan(1);
  expect(layout.fenced).toMatchObject({ codeWhiteSpace: "pre", overflowX: "auto" });
  expect(layout.fenced.scrollWidth).toBeGreaterThan(layout.fenced.clientWidth);
});

for (const viewport of [
  { name: "at the compact desktop breakpoint", width: 768 },
  { name: "at a standard desktop viewport", width: 1280 },
]) {
  test(`persistent sidebar keeps descendant container gutters ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: 800 });
    await page.goto("/components/");

    const layout = await page.evaluate(() => {
      document.body.innerHTML = `
        <aside class="sidebar"><nav><ul><li><a href="#overview">Overview</a></li></ul></nav></aside>
        <main id="content-landmark"><div id="content-container" class="container"><div id="content">Application content</div></div></main>`;
      const sidebar = document.querySelector(".sidebar").getBoundingClientRect();
      const main = document.getElementById("content-landmark").getBoundingClientRect();
      const container = document.getElementById("content-container");
      const content = document.getElementById("content").getBoundingClientRect();
      const style = getComputedStyle(container);
      return {
        contentLeft: content.left,
        contentRight: content.right,
        containerPaddingLeft: style.paddingLeft,
        containerPaddingRight: style.paddingRight,
        mainLeft: main.left,
        mainRight: main.right,
        sidebarRight: sidebar.right,
      };
    });

    expect(layout.mainLeft).toBe(layout.sidebarRight);
    expect(layout.containerPaddingLeft).toBe("16px");
    expect(layout.containerPaddingRight).toBe("16px");
    expect(layout.contentLeft - layout.sidebarRight).toBeGreaterThanOrEqual(16);
    expect(layout.mainRight - layout.contentRight).toBeGreaterThanOrEqual(16);
  });
}

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
        backdropFilter: getComputedStyle(element, "::backdrop").backdropFilter,
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
    // The drawer shares the dialog overlay and blur.
    expect(shell.backdrop).toMatch(/^(?:oklch\(0%? 0 0 \/ 0\.1\)|rgba\(0, 0, 0, 0\.1\))$/);
    expect(shell.backdropFilter).toBe("blur(4px)");
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

test("sidebar links use compact rows and share the accent hover and current-page state", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/components/");

  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
      document.body.innerHTML = `
        <aside class="sidebar"><nav><ul>
          <li class="label" id="first-label">Workspace</li>
          <li><a href="#current" aria-current="page">Current page</a></li>
          <li><a href="#inactive">Inactive page</a></li>
          <li><a href="#false" aria-current="false">False current page</a></li>
          <li class="label" id="second-label">Account</li>
        </ul></nav></aside>
        <span id="accent-probe" style="color: var(--accent-foreground); background-color: var(--accent)">Accent</span>`;
    }, theme);

    const states = await page.evaluate(() => {
      const sidebar = document.querySelector(".sidebar");
      const current = document.querySelector('a[href="#current"]');
      const inactive = document.querySelector('a[href="#inactive"]');
      const falseCurrent = document.querySelector('a[href="#false"]');
      const accent = getComputedStyle(document.getElementById("accent-probe"));
      const sidebarRect = sidebar.getBoundingClientRect();
      const inactiveRect = inactive.getBoundingClientRect();
      const sidebarStyle = getComputedStyle(sidebar);
      const sidebarContentRight = sidebarRect.right - Number.parseFloat(sidebarStyle.borderRightWidth);
      const label = (id) => {
        const element = document.getElementById(id);
        const style = getComputedStyle(element);
        return { fontSize: style.fontSize, height: element.getBoundingClientRect().height, marginTop: style.marginTop };
      };
      return {
        accent: { background: accent.backgroundColor, color: accent.color },
        sidebarBackground: getComputedStyle(sidebar).backgroundColor,
        current: {
          background: getComputedStyle(current).backgroundColor,
          color: getComputedStyle(current).color,
          fontWeight: getComputedStyle(current).fontWeight,
        },
        inactiveWeight: getComputedStyle(inactive).fontWeight,
        falseCurrentBackground: getComputedStyle(falseCurrent).backgroundColor,
        labels: { first: label("first-label"), second: label("second-label") },
        geometry: {
          borderRadius: getComputedStyle(inactive).borderRadius,
          height: inactiveRect.height,
          paddingLeft: getComputedStyle(inactive).paddingLeft,
          paddingRight: getComputedStyle(inactive).paddingRight,
          leftInset: inactiveRect.left - sidebarRect.left,
          rightInset: sidebarContentRight - inactiveRect.right,
          rowGap: inactiveRect.top - current.getBoundingClientRect().bottom,
        },
      };
    });

    expect(states.sidebarBackground).not.toBe(states.accent.background);
    expect(states.current.background).toBe(states.accent.background);
    expect(states.current.color).toBe(states.accent.color);
    expect(states.current.fontWeight).toBe("500");
    expect(states.inactiveWeight).toBe("400");
    expect(states.falseCurrentBackground).toBe("rgba(0, 0, 0, 0)");
    expect(states.labels).toEqual({
      first: { fontSize: "12px", height: 32, marginTop: "0px" },
      second: { fontSize: "12px", height: 32, marginTop: "16px" },
    });
    expect(states.geometry).toEqual({
      borderRadius: "6px",
      height: 32,
      paddingLeft: "8px",
      paddingRight: "8px",
      leftInset: 8,
      rightInset: 8,
      rowGap: 0,
    });

    await page.locator('a[href="#inactive"]').hover();
    await page.waitForTimeout(200);
    const hover = await page.locator('a[href="#inactive"]').evaluate((element) => {
      const style = getComputedStyle(element);
      return { background: style.backgroundColor, color: style.color, textDecoration: style.textDecorationLine };
    });
    expect(hover.background).toBe(states.accent.background);
    expect(hover.color).toBe(states.accent.color);
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

test("an ordered list inside a nav is a breadcrumb trail with keyboard focus, whatever its label", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/components/");
  await page.evaluate(() => {
    document.body.innerHTML = `
      <main>
        <nav id="canonical" aria-label="Brotkrumenpfad">
          <ol id="canonical-list">
            <li><a id="canonical-home" href="#home">Home</a></li>
            <li><a id="canonical-services" href="#services">Services</a></li>
            <li id="canonical-current">Current</li>
          </ol>
        </nav>
        <nav id="english" aria-label="Breadcrumb">
          <ol id="english-list">
            <li><a href="#home">Home</a></li>
            <li><a href="#services">Services</a></li>
            <li>Current</li>
          </ol>
        </nav>
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
    const canonicalList = canonical.querySelector("ol");
    const canonicalBreadcrumb = read("canonical-list");
    const englishBreadcrumb = read("english-list");
    const probe = document.createElement("span");
    probe.style.color = "var(--foreground)";
    document.body.append(probe);
    const dividerBeforeOverride = getComputedStyle(canonicalList.firstElementChild, "::after").content;
    canonical.style.setProperty("--breadcrumb-divider", '"/"');
    const dividerAfterOverride = getComputedStyle(canonicalList.firstElementChild, "::after").content;
    document.getElementById("english").style.setProperty("--breadcrumb-divider", '"/"');
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
      english: englishBreadcrumb,
      spacing: {
        canonical: readDividerSpacing(canonicalList),
        english: readDividerSpacing(document.getElementById("english-list")),
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
  expect(breadcrumbs.english).toEqual(breadcrumbs.canonical);
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
  expect(breadcrumbs.spacing.english).toEqual(breadcrumbs.spacing.canonical);

  const focusability = await page.locator("#canonical-home").evaluate((link) => link.tabIndex);
  expect(focusability).toBe(0);
  await page.locator("#canonical-home").focus();
  await expect(page.locator("#canonical-home")).toBeFocused();
  await expect(page.locator("#canonical-home")).toHaveCSS("outline-style", "solid");
  await expect(page.locator("#canonical-home")).toHaveCSS("outline-width", "2px");
});

test("breadcrumb label matching and bare breadcrumb lists are no longer hooks", async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.goto("/components/");
  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <main>
        <ul id="bare" aria-label="Breadcrumb">
          <li><a href="#home">Home</a></li>
          <li>Current</li>
        </ul>
        <nav id="labelled" aria-label="breadcrumb">
          <ul id="labelled-list">
            <li><a href="#home">Home</a></li>
            <li>Current</li>
          </ul>
        </nav>
        <nav id="ordinary" aria-label="Primary"><ul><li><a href="#a">A</a></li></ul></nav>
      </main>`;
    const readList = (id) => {
      const list = document.getElementById(id);
      return {
        display: getComputedStyle(list).display,
        divider: getComputedStyle(list.firstElementChild, "::after").content,
        listStyle: getComputedStyle(list).listStyleType,
      };
    };
    const readNav = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return { display: style.display, paddingBlock: style.paddingBlock };
    };
    return {
      bare: readList("bare"),
      labelled: readList("labelled-list"),
      labelledNav: readNav("labelled"),
      ordinaryNav: readNav("ordinary"),
    };
  });

  // A bare list keeps prose list styling; a labelled nav > ul is an ordinary nav bar.
  expect(result.bare).toMatchObject({ display: "block", divider: "none", listStyle: "disc" });
  expect(result.labelled).toMatchObject({ display: "flex", divider: "none", listStyle: "none" });
  expect(result.labelledNav).toEqual(result.ordinaryNav);
  expect(result.labelledNav.display).toBe("flex");
});

test("current navigation and sidebar links use the accent state without leaking into breadcrumbs or trees", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/components/");

  const states = await page.evaluate(() => {
    document.body.innerHTML = `
      <style>* { transition: none !important; }</style>
      <aside class="sidebar" aria-label="Workspace navigation">
        <nav aria-label="Workspace"><ul>
          <li><a id="sidebar-current" href="#a" aria-current="page">Overview</a></li>
          <li><a href="#b">Settings</a></li>
        </ul></nav>
      </aside>
      <main>
        <nav aria-label="Primary"><div class="container"><ul>
          <li><a id="nav-current" href="#docs" aria-current="page">Docs</a></li>
          <li><a id="nav-sibling" href="#blog">Blog</a></li>
          <li><a id="nav-false" href="#about" aria-current="false">About</a></li>
          <li><a id="nav-empty" href="#team" aria-current="">Team</a></li>
          <li><a id="nav-button-current" class="button ghost" href="#app" aria-current="page">App</a></li>
        </ul></div></nav>
        <nav class="justify-center" aria-label="Pagination"><ul>
          <li><a href="?page=1">1</a></li>
          <li><a id="page-current" href="?page=2" aria-current="page">2</a></li>
        </ul></nav>
        <nav aria-label="Breadcrumb"><ol>
          <li><a href="#home">Home</a></li>
          <li><a id="crumb-current" href="#here" aria-current="page">Here</a></li>
        </ol></nav>
        <nav aria-label="Files"><ul class="tree">
          <li><a id="tree-current" href="#file" aria-current="page">file.css</a></li>
          <li><a id="tree-active" class="active" href="#other">other.css</a></li>
          <li><a id="tree-false" href="#third" aria-current="false">third.css</a></li>
          <li><a id="tree-empty" href="#fifth" aria-current="">fifth.css</a></li>
          <li><a id="tree-plain" href="#fourth">fourth.css</a></li>
        </ul></nav>
        <a id="button-current" class="button outline" href="#x" aria-current="page">Current</a>
        <a id="button-false" class="button outline" href="#y" aria-current="false">Not current</a>
        <a id="button-empty" class="button outline" href="#w" aria-current="">Empty current</a>
        <a id="button-plain" class="button outline" href="#z">Plain</a>
        <span id="accent-probe" style="color: var(--accent-foreground); background-color: var(--accent)">Accent</span>
        <span id="primary-probe" style="color: var(--primary-foreground); background-color: var(--primary)">Primary</span>
      </main>`;
    const read = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return { background: style.backgroundColor, color: style.color };
    };
    return {
      accent: read("accent-probe"),
      buttonCurrent: read("button-current"),
      buttonEmpty: read("button-empty"),
      buttonFalse: read("button-false"),
      buttonPlain: read("button-plain"),
      crumbCurrent: read("crumb-current"),
      navButtonCurrent: read("nav-button-current"),
      navCurrent: read("nav-current"),
      navEmpty: read("nav-empty"),
      navFalse: read("nav-false"),
      navSibling: read("nav-sibling"),
      pageCurrent: read("page-current"),
      primary: read("primary-probe"),
      sidebarCurrent: {
        ...read("sidebar-current"),
        fontWeight: getComputedStyle(document.getElementById("sidebar-current")).fontWeight,
      },
      treeActive: read("tree-active"),
      treeCurrent: read("tree-current"),
      treeEmpty: read("tree-empty"),
      treeFalse: read("tree-false"),
      treePlain: read("tree-plain"),
    };
  });

  const transparent = "rgba(0, 0, 0, 0)";
  expect(states.navCurrent).toEqual(states.accent);
  expect(states.pageCurrent).toEqual(states.accent);
  expect(states.navSibling.background).toBe(transparent);
  expect(states.navFalse).toEqual(states.navSibling);
  // ARIA treats an empty aria-current like "false".
  expect(states.navEmpty).toEqual(states.navSibling);
  expect(states.crumbCurrent.background).toBe(transparent);
  expect(states.treeCurrent.background).not.toBe(states.accent.background);
  expect(states.treeCurrent.background).not.toBe(states.treePlain.background);
  // aria-current is the only tree current-state hook; .active is plain.
  expect(states.treeActive).toEqual(states.treePlain);
  expect(states.treeFalse).toEqual(states.treePlain);
  expect(states.treeEmpty).toEqual(states.treePlain);
  expect(states.sidebarCurrent).toEqual({ ...states.accent, fontWeight: "500" });
  expect(states.buttonCurrent).toEqual(states.primary);
  expect(states.navButtonCurrent).toEqual(states.primary);
  expect(states.buttonFalse).toEqual(states.buttonPlain);
  expect(states.buttonEmpty).toEqual(states.buttonPlain);
  expect(states.buttonFalse.background).not.toBe(states.primary.background);
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

test("slide page size applies only to decks when printing", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "page.pdf is Chromium-only");

  async function firstPageSize(route, setup) {
    await page.goto(route);
    if (setup) await page.evaluate(setup);
    const pdf = (await page.pdf({ preferCSSPageSize: true })).toString("latin1");
    const [, x0, y0, x1, y1] = pdf.match(/\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/);
    return { width: Number(x1) - Number(x0), height: Number(y1) - Number(y0) };
  }

  const deck = await firstPageSize("/slides/");
  expect(deck.width).toBeCloseTo(16 * 72, 0);
  expect(deck.height).toBeCloseTo(9 * 72, 0);

  const customDeck = await firstPageSize("/slides/", () => {
    document.documentElement.style.setProperty("--slide-width", "4");
    document.documentElement.style.setProperty("--slide-height", "3");
  });
  expect(customDeck.width).toBeCloseTo(4 * 72, 0);
  expect(customDeck.height).toBeCloseTo(3 * 72, 0);

  const docs = await firstPageSize("/components/");
  expect(docs.height).toBeGreaterThan(docs.width);
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

test("mark renders a visible highlight tint with AA text contrast in both themes", async ({ page }) => {
  await page.goto("/components/");
  await page.evaluate(() => {
    document.body.innerHTML = `<p>Price <mark id="mark">Save 14%</mark></p>`;
  });

  for (const theme of ["light", "dark"]) {
    const result = await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      const paint = (...colors) => {
        context.clearRect(0, 0, 1, 1);
        for (const color of colors) {
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
        }
        return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
      };
      const mark = getComputedStyle(document.getElementById("mark"));
      const page = getComputedStyle(document.body).backgroundColor;
      return { page: paint(page), mark: paint(page, mark.backgroundColor), text: paint(page, mark.color) };
    }, theme);

    const luminance = (rgb) => {
      const [r, g, b] = rgb.map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const contrast = (a, b) => {
      const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (high + 0.05) / (low + 0.05);
    };
    const [red, , blue] = result.mark;
    expect(red - blue, `${theme} mark is tinted`).toBeGreaterThan(25);
    expect(contrast(result.mark, result.page), `${theme} mark separates from page`).toBeGreaterThan(1.15);
    expect(contrast(result.mark, result.text), `${theme} mark text contrast`).toBeGreaterThanOrEqual(4.5);
  }
});

test("small stays inline in prose and becomes block helper text only after form controls", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <span id="muted" class="muted">Muted reference</span>
      <p><strong>$49</strong> <small id="inline">/month</small></p>
      <input id="bare-input" type="text"><small id="after-input">Helper</small>
      <label>Email <input type="email"></label><small id="after-label">Helper</small>
      <label>Name <small id="in-label">Nested hint</small></label>
      <label for="ok">Username</label>
      <input id="ok" type="text" aria-invalid="false"><small id="valid">Available</small>
      <label for="bad">Code</label>
      <input id="bad" type="text" aria-invalid="true"><small id="invalid">Fix this</small>
      <label>Email <input type="email" aria-invalid="true"></label><small id="wrapped-invalid">Invalid</small>
      <article><header><h3>Card</h3><small id="card">Subtitle</small></header></article>`;
    const style = (id) => getComputedStyle(document.getElementById(id));
    const pick = (id) => ({ display: style(id).display, marginTop: style(id).marginTop, color: style(id).color });
    const probe = document.createElement("span");
    document.body.append(probe);
    probe.style.color = "var(--destructive)";
    const destructive = getComputedStyle(probe).color;
    probe.style.color = "var(--primary)";
    const primary = getComputedStyle(probe).color;
    const inline = document.getElementById("inline").getBoundingClientRect();
    const strong = document.querySelector("p strong").getBoundingClientRect();
    return {
      muted: style("muted").color,
      destructive,
      primary,
      sameLine: Math.abs(inline.bottom - strong.bottom) < strong.height,
      inline: pick("inline"),
      afterInput: pick("after-input"),
      afterLabel: pick("after-label"),
      inLabel: pick("in-label"),
      valid: pick("valid"),
      invalid: pick("invalid"),
      wrappedInvalid: pick("wrapped-invalid"),
      card: pick("card"),
    };
  });

  expect(result.inline.display).toBe("inline");
  expect(result.inline.color).toBe(result.muted);
  expect(result.sameLine).toBe(true);

  for (const helper of [result.afterInput, result.afterLabel, result.inLabel]) {
    expect(helper.display).toBe("block");
    expect(parseFloat(helper.marginTop)).toBeGreaterThan(0);
    expect(helper.color).toBe(result.muted);
  }

  expect(result.valid.color).toBe(result.muted);
  expect(result.invalid.color).toBe(result.destructive);
  expect(result.wrappedInvalid.color).toBe(result.destructive);
  expect(result.card.color).toBe(result.muted);
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

test("badges use the canonical fixed geometry and overridable pill radius", async ({ page }) => {
  await loadCoreBadgeSource(page);

  const geometry = await page.evaluate(() => {
    document.body.innerHTML = `
      <span class="badge" id="badge">
        <svg id="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg>
        12,345
      </span>
      <span class="badge" id="custom-radius" style="--badge-radius: 7px">Custom</span>`;
    const badge = document.getElementById("badge");
    const badgeStyle = getComputedStyle(badge);
    const icon = document.getElementById("icon");
    const iconStyle = getComputedStyle(icon);
    return {
      badge: {
        borderColor: badgeStyle.borderTopColor,
        borderRadius: badgeStyle.borderTopLeftRadius,
        borderWidth: badgeStyle.borderTopWidth,
        boxSizing: badgeStyle.boxSizing,
        fontSize: badgeStyle.fontSize,
        fontVariantNumeric: badgeStyle.fontVariantNumeric,
        fontWeight: badgeStyle.fontWeight,
        gap: badgeStyle.gap,
        height: badge.getBoundingClientRect().height,
        lineHeight: badgeStyle.lineHeight,
        paddingLeft: badgeStyle.paddingLeft,
        paddingRight: badgeStyle.paddingRight,
        whiteSpace: badgeStyle.whiteSpace,
      },
      customRadius: getComputedStyle(document.getElementById("custom-radius")).borderTopLeftRadius,
      icon: {
        flexShrink: iconStyle.flexShrink,
        height: icon.getBoundingClientRect().height,
        width: icon.getBoundingClientRect().width,
      },
    };
  });

  expect(geometry.badge).toEqual({
    borderColor: "rgba(0, 0, 0, 0)",
    borderRadius: "9999px",
    borderWidth: "1px",
    boxSizing: "border-box",
    fontSize: "12px",
    fontVariantNumeric: "tabular-nums",
    fontWeight: "500",
    gap: "4px",
    height: 20,
    lineHeight: "12px",
    paddingLeft: "8px",
    paddingRight: "8px",
    whiteSpace: "nowrap",
  });
  expect(geometry.icon).toEqual({ flexShrink: "0", height: 12, width: 12 });
  expect(geometry.customRadius).toBe("7px");
});

test("badge variants share each button static color recipe in light and dark themes", async ({ page }) => {
  await loadCoreBadgeSource(page);

  const stylesByTheme = await page.evaluate(() => {
    const themes = ["light", "dark"];
    const variants = ["primary", "secondary", "outline", "ghost", "destructive"];
    document.body.innerHTML = themes.map((theme) => `
      <section data-theme="${theme}">
        ${variants.map((variant) => {
          const className = variant === "primary" ? "" : ` class="${variant}"`;
          return `<span class="badge${variant === "primary" ? "" : ` ${variant}`}" id="badge-${theme}-${variant}">${variant}</span>
            <button type="button"${className} id="button-${theme}-${variant}">${variant}</button>`;
        }).join("")}
        <span id="border-${theme}" style="color: var(--border)"></span>
      </section>`).join("");

    const read = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return {
        background: style.backgroundColor,
        borderColor: style.borderTopColor,
        borderStyle: style.borderTopStyle,
        borderWidth: style.borderTopWidth,
        color: style.color,
      };
    };

    return Object.fromEntries(themes.map((theme) => [theme, {
      border: getComputedStyle(document.getElementById(`border-${theme}`)).color,
      variants: Object.fromEntries(variants.map((variant) => [
        variant,
        { badge: read(`badge-${theme}-${variant}`), button: read(`button-${theme}-${variant}`) },
      ])),
    }]));
  });

  for (const [theme, { border, variants }] of Object.entries(stylesByTheme)) {
    for (const [variant, styles] of Object.entries(variants)) {
      // Outline badges keep the text and border recipe without the button's surface fill.
      const expected = variant === "outline"
        ? { ...styles.button, background: "rgba(0, 0, 0, 0)", borderColor: border }
        : styles.button;
      expect(styles.badge, `${theme} ${variant} badge recipe`).toEqual(expected);
    }
  }
});

test("badges have one size: size and link classes do not change a badge", async ({ page }) => {
  await loadCoreBadgeSource(page);

  const styles = await page.evaluate(() => {
    document.body.innerHTML = `
      <main>
        <span class="badge" id="default">Default</span>
        <span class="badge small" id="small">Small</span>
        <span class="badge large" id="large">Large</span>
        <span class="badge link" id="link">Link</span>
      </main>`;
    const read = (id) => {
      const element = document.getElementById(id);
      const style = getComputedStyle(element);
      return {
        background: style.backgroundColor,
        borderColor: style.borderTopColor,
        color: style.color,
        fontSize: style.fontSize,
        height: element.getBoundingClientRect().height,
        paddingLeft: style.paddingLeft,
        paddingRight: style.paddingRight,
        textDecoration: style.textDecorationLine,
      };
    };
    return Object.fromEntries(["default", "small", "large", "link"].map((id) => [id, read(id)]));
  });

  for (const variant of ["small", "large", "link"]) {
    expect(styles[variant], `.badge.${variant}`).toEqual(styles.default);
  }
});

test("success, warning, and destructive badges share one tinted tone recipe from their tokens", async ({ page }) => {
  await page.goto("/components/");
  const byTheme = await page.evaluate(() => {
    const tones = ["destructive", "success", "warning"];
    const themes = ["light", "dark"];
    document.body.innerHTML = themes.map((theme) => `
      <main data-theme="${theme}" style="--success: rgb(1 101 1); --warning: rgb(202 102 2)">
        ${tones.map((tone) => `
          <span class="badge ${tone}" id="${theme}-${tone}">${tone}</span>
          <span id="${theme}-${tone}-probe" style="color: color-mix(in oklab, var(--${tone}) 70%, var(--foreground)); background-color: color-mix(in oklch, var(--${tone}) ${theme === "light" ? 10 : 20}%, transparent)"></span>`).join("")}
        <span class="badge secondary" id="${theme}-secondary">Secondary</span>
        <span class="badge outline" id="${theme}-outline">Outline</span>
        <span id="${theme}-foreground" style="color: var(--foreground)"></span>
      </main>`).join("");
    const read = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return { background: style.backgroundColor, color: style.color };
    };
    return Object.fromEntries(themes.map((theme) => [theme, {
      foreground: read(`${theme}-foreground`).color,
      outline: read(`${theme}-outline`),
      secondary: read(`${theme}-secondary`),
      tones: Object.fromEntries(tones.map((tone) => [tone, { badge: read(`${theme}-${tone}`), probe: read(`${theme}-${tone}-probe`) }])),
    }]));
  });

  for (const [theme, { foreground, outline, secondary, tones }] of Object.entries(byTheme)) {
    for (const [tone, { badge, probe }] of Object.entries(tones)) {
      expect(badge, `${theme} .badge.${tone}`).toEqual(probe);
      expect(badge.color, `${theme} .badge.${tone} text`).not.toBe(foreground);
      expect(badge.background).not.toBe(secondary.background);
      expect(badge.background).not.toBe(outline.background);
      expect(badge.background).not.toBe("rgba(0, 0, 0, 0)");
    }
  }
  expect(byTheme.light.tones.success.badge.background).not.toBe(byTheme.dark.tones.success.badge.background);
});

test("success and warning are badge and alert tones only, never half-applied to buttons", async ({ page }) => {
  await page.goto("/components/");
  const styles = await page.evaluate(() => {
    document.head.insertAdjacentHTML("beforeend", "<style>*{transition:none!important}</style>");
    document.body.innerHTML = `<main>
      <button type="button" id="plain">Plain</button>
      <button type="button" class="success" id="success">Success</button>
      <button type="button" class="warning" id="warning">Warning</button>
      <button type="button" class="outline success" id="outline-success">Outline</button>
      <button type="button" class="outline" id="outline">Outline</button>
    </main>`;
    const read = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return { background: style.backgroundColor, border: style.borderTopColor, color: style.color };
    };
    return Object.fromEntries(["plain", "success", "warning", "outline-success", "outline"].map((id) => [id, read(id)]));
  });

  expect(styles.success).toEqual(styles.plain);
  expect(styles.warning).toEqual(styles.plain);
  expect(styles["outline-success"]).toEqual(styles.outline);
});

test("status tones tint polite and assertive messages while plain status stays neutral", async ({ page }) => {
  await page.goto("/components/");
  const byTheme = await page.evaluate(() => {
    const themes = ["light", "dark"];
    const cases = [
      ["status-neutral", "status", ""],
      ["status-success", "status", "success"],
      ["status-warning", "status", "warning"],
      ["alert-destructive", "alert", ""],
      ["alert-warning", "alert", "warning"],
    ];
    const toneOf = (role, tone) => tone || (role === "alert" ? "destructive" : "");
    document.body.innerHTML = themes.map((theme) => `
      <main data-theme="${theme}">
        ${cases.map(([id, role, tone]) => `
          <div role="${role}" class="${tone}" id="${theme}-${id}"><strong>Title</strong><p>Body</p></div>
          ${toneOf(role, tone) ? `<span id="${theme}-${id}-probe" style="color: color-mix(in oklab, var(--${toneOf(role, tone)}) 70%, var(--foreground)); background-color: color-mix(in oklab, var(--${toneOf(role, tone)}) ${theme === "light" ? 12 : 20}%, var(--background))"></span>` : ""}`).join("")}
        <span id="${theme}-muted-foreground" style="color: var(--muted-foreground)"></span>
      </main>`).join("");
    const read = (id) => {
      const element = document.getElementById(id);
      const probe = document.getElementById(`${id}-probe`);
      return {
        background: getComputedStyle(element).backgroundColor,
        body: getComputedStyle(element.querySelector("p")).color,
        probe: probe && { background: getComputedStyle(probe).backgroundColor, color: getComputedStyle(probe).color },
        title: getComputedStyle(element.querySelector("strong")).color,
      };
    };
    return Object.fromEntries(themes.map((theme) => [theme, {
      cases: Object.fromEntries(cases.map(([id]) => [id, read(`${theme}-${id}`)])),
      mutedForeground: getComputedStyle(document.getElementById(`${theme}-muted-foreground`)).color,
    }]));
  });

  for (const [theme, { cases, mutedForeground }] of Object.entries(byTheme)) {
    expect(cases["status-neutral"].body, `${theme} neutral status body`).toBe(mutedForeground);
    for (const id of ["status-success", "status-warning", "alert-destructive", "alert-warning"]) {
      const state = cases[id];
      expect(state.background, `${theme} ${id} surface`).toBe(state.probe.background);
      expect(state.title, `${theme} ${id} title`).toBe(state.probe.color);
      expect(state.body, `${theme} ${id} body`).toBe(state.probe.color);
      expect(state.background).not.toBe(cases["status-neutral"].background);
    }
  }
});

test("presentational badge spans do not inherit button interaction or shadow behavior", async ({ page }) => {
  await loadCoreBadgeSource(page);
  await page.evaluate(() => {
    document.body.innerHTML = `
      <main style="--button-shadow: 0 0 0 2px rgb(12 34 56)">
        <span class="badge" id="badge">Presentational</span>
        <button id="button" type="button">Interactive</button>
      </main>`;
  });

  const readBadge = () => page.locator("#badge").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      borderColor: style.borderTopColor,
      boxShadow: style.boxShadow,
      color: style.color,
      cursor: style.cursor,
      outlineStyle: style.outlineStyle,
      tabIndex: element.tabIndex,
      transitionDuration: style.transitionDuration,
      userSelect: style.userSelect || style.webkitUserSelect,
    };
  });

  const before = await readBadge();
  await page.locator("#badge").hover();
  const hovered = await readBadge();
  expect(hovered).toEqual(before);
  expect(before).toMatchObject({
    boxShadow: "none",
    cursor: "auto",
    outlineStyle: "none",
    tabIndex: -1,
    transitionDuration: "0s",
  });
  expect(before.userSelect).not.toBe("none");

  expect(await page.locator("#button").evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe("none");
  const focus = await page.locator("#badge").evaluate((element) => {
    element.focus();
    return { activeId: document.activeElement.id, buttonTabIndex: document.getElementById("button").tabIndex };
  });
  expect(focus.activeId).not.toBe("badge");
  expect(focus.buttonTabIndex).toBe(0);
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

test("avatars use a quiet ringed fallback at 24, 32, and 40px with images filling the circle", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <span class="avatar small" id="small">SM</span>
      <span class="avatar" id="default">MD</span>
      <span class="avatar large" id="large">LG</span>
      <span class="avatar large" id="photo"><img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="></span>
      <span id="probe" style="color: var(--muted-foreground); outline-color: var(--border)">Probe</span>`;
    const read = (id) => {
      const element = document.getElementById(id);
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return { fontSize: style.fontSize, height: rect.height, width: rect.width };
    };
    const avatar = getComputedStyle(document.getElementById("default"));
    const probe = getComputedStyle(document.getElementById("probe"));
    const photo = document.getElementById("photo").getBoundingClientRect();
    const image = document.querySelector("#photo > img").getBoundingClientRect();
    return {
      fallback: {
        color: avatar.color,
        fontWeight: avatar.fontWeight,
        outlineColor: avatar.outlineColor,
        outlineOffset: avatar.outlineOffset,
        outlineStyle: avatar.outlineStyle,
        outlineWidth: avatar.outlineWidth,
      },
      image: { height: image.height, width: image.width },
      photo: { height: photo.height, width: photo.width },
      probe: { color: probe.color, outlineColor: probe.outlineColor },
      sizes: Object.fromEntries(["small", "default", "large"].map((id) => [id, read(id)])),
    };
  });

  expect(result.sizes).toEqual({
    small: { fontSize: "12px", height: 24, width: 24 },
    default: { fontSize: "14px", height: 32, width: 32 },
    large: { fontSize: "14px", height: 40, width: 40 },
  });
  expect(result.fallback).toEqual({
    color: result.probe.color,
    fontWeight: "400",
    outlineColor: result.probe.outlineColor,
    outlineOffset: "-1px",
    outlineStyle: "solid",
    outlineWidth: "1px",
  });
  expect(result.image).toEqual(result.photo);
});

test("progress tracks are 4px for determinate, indeterminate, and color variants", async ({ page }) => {
  await page.goto("/components/");

  const heights = await page.evaluate(() => {
    document.body.innerHTML = `
      <progress value="40" max="100"></progress>
      <progress></progress>
      ${["accent", "secondary", "success", "warning", "destructive"].map((variant) => `<progress class="${variant}" value="40" max="100"></progress>`).join("")}
      <label>Upload <progress id="labelled" value="40" max="100"></progress></label>`;
    return [...document.querySelectorAll("progress")].map((element) => element.getBoundingClientRect().height);
  });

  expect(heights).toHaveLength(8);
  for (const height of heights) expect(height).toBe(4);
});

for (const width of [1280, 375]) {
test(`line-height positioned controls keep a line box that can hold their glyphs at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 800 });
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
}

test("text fields match button density on desktop and avoid iOS focus zoom on mobile", async ({ page }) => {
  const readFields = () => page.evaluate(() => {
    document.body.innerHTML = `
      <main class="container">
        <input id="text" value="Release gjpqy">
        <select id="select"><option>Weekly digest</option></select>
        <select id="small-select" class="small"><option>Weekly digest</option></select>
        <textarea id="textarea"></textarea>
        <div role="group"><span id="addon">https://</span><input aria-label="Site"></div>
        <div role="group"><input aria-label="Price"><button id="group-button" type="button">Apply</button></div>
      </main>`;
    const read = (id) => {
      const element = document.getElementById(id);
      const style = getComputedStyle(element);
      return {
        fontSize: style.fontSize,
        height: Math.round(element.getBoundingClientRect().height),
        padding: style.padding,
      };
    };
    return Object.fromEntries(["text", "select", "small-select", "textarea", "addon", "group-button"].map((id) => [id, read(id)]));
  });

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/components/");
  const desktop = await readFields();
  expect(desktop.text).toEqual({ fontSize: "14px", height: 32, padding: "4px 10px" });
  expect(desktop.select).toMatchObject({ fontSize: "14px", height: 32, padding: "4px 32px 4px 10px" });
  // Size modifiers keep the chevron clearance on selects.
  expect(desktop["small-select"]).toMatchObject({ height: 28, padding: "4px 32px 4px 8px" });
  expect(desktop.textarea).toMatchObject({ fontSize: "14px", padding: "8px 10px" });
  expect(desktop.addon.fontSize).toBe("14px");
  expect(desktop.text.fontSize).toBe(desktop["group-button"].fontSize);

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/components/");
  const mobile = await readFields();
  for (const id of ["text", "select", "textarea", "addon"]) {
    expect(mobile[id].fontSize, `${id} at 375px`).toBe("16px");
  }
  expect(mobile.text).toMatchObject({ height: 32, padding: "4px 10px" });

  // Daft's token lives in a layer, so an ordinary unlayered override wins at every width.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/components/");
  await page.addStyleTag({ content: ":root { --input-font-size: 18px; }" });
  const overridden = await readFields();
  for (const id of ["text", "select", "textarea", "addon"]) {
    expect(overridden[id].fontSize, `${id} with override`).toBe("18px");
  }
});

test("labels use tight leading that still clears wrapped lines", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <main>
        <div><label id="field-label" for="field">Release ID</label><input id="field"></div>
        <label id="wrapping-label">Email <input id="wrapped-input" type="email"></label>
        <label id="check-label"><input type="checkbox"> Receive newsletter</label>
        <label id="helper-label">Name <small>Nested hint</small></label>
      </main>`;
    const read = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return { fontSize: style.fontSize, lineHeight: style.lineHeight, marginBottom: style.marginBottom };
    };
    const label = document.getElementById("field-label").getBoundingClientRect();
    const input = document.getElementById("field").getBoundingClientRect();
    return {
      check: read("check-label"),
      field: read("field-label"),
      gap: input.top - label.bottom,
      helper: read("helper-label"),
      wrappedInput: getComputedStyle(document.getElementById("wrapped-input")).lineHeight,
      wrapping: read("wrapping-label"),
    };
  });

  // 1.25 is the tightest token step that keeps wrapped descenders clear of accents.
  expect(result.field).toEqual({ fontSize: "14px", lineHeight: "17.5px", marginBottom: "8px" });
  expect(result.gap).toBe(8);
  for (const label of [result.wrapping, result.check, result.helper]) expect(label.lineHeight).toBe("17.5px");
  // Controls inside a label keep their own line box.
  expect(result.wrappedInput).toBe("21px");
});

test("card and dialog text reads as UI and closing footers become full-bleed bands", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <main style="width: 480px">
        <p id="prose">Prose paragraph</p>
        <article id="card">
          <header><h3>Release readiness</h3><p>One change awaits review.</p></header>
          <p id="card-body">Review the affected service before publishing.</p>
          <footer><button type="button" class="outline">Details</button><button type="button">Approve</button></footer>
        </article>
        <article id="footer-only"><footer>Only a footer</footer></article>
        <article id="parent"><p>Parent</p><article id="nested"><p>Nested</p><footer>Nested footer</footer></article></article>
        <article id="plain" class="plain"><p>Plain</p><footer>Plain footer</footer></article>
        <div class="grid">
          <article id="short"><header><strong>Short</strong></header><p>One line.</p><footer><button type="button">Go</button></footer></article>
          <article id="tall"><header><strong>Tall</strong></header><p>Line</p><p>Line</p><p>Line</p><p>Line</p><footer><button type="button">Go</button></footer></article>
          <article id="inline"><span id="inline-badge" class="badge">New</span> <button id="inline-button" type="button">Preview</button><footer>Footer</footer></article>
        </div>
      </main>
      <dialog id="dialog" open aria-label="Band dialog">
        <header><h2>Invite teammate</h2></header>
        <p id="dialog-body">They will get an email.</p>
        <footer><button type="button" class="outline">Cancel</button><button type="button">Send</button></footer>
      </dialog>`;

    const band = (surfaceId) => {
      const surface = document.getElementById(surfaceId);
      const footer = surface.querySelector(":scope > footer");
      const surfaceStyle = getComputedStyle(surface);
      const footerStyle = getComputedStyle(footer);
      const surfaceBox = surface.getBoundingClientRect();
      const footerBox = footer.getBoundingClientRect();
      const border = parseFloat(surfaceStyle.borderTopWidth);
      return {
        background: footerStyle.backgroundColor,
        borderTopWidth: footerStyle.borderTopWidth,
        // Rounded: subpixel border snapping differs slightly between engines.
        bottomDelta: Math.round(surfaceBox.bottom - border - footerBox.bottom) + 0,
        bottomRadius: [footerStyle.borderBottomLeftRadius, footerStyle.borderBottomRightRadius],
        leftDelta: Math.round(footerBox.left - (surfaceBox.left + border)) + 0,
        padding: footerStyle.padding,
        surfacePaddingBottom: surfaceStyle.paddingBottom,
        surfaceRadius: parseFloat(surfaceStyle.borderBottomLeftRadius),
        widthDelta: Math.round(surfaceBox.width - 2 * border - footerBox.width) + 0,
      };
    };
    const type = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return { fontSize: style.fontSize, lineHeight: style.lineHeight };
    };
    const plainRow = (id) => {
      const style = getComputedStyle(document.querySelector(`#${id} > footer`));
      return { background: style.backgroundColor, borderTopWidth: style.borderTopWidth, marginLeft: style.marginLeft };
    };

    return {
      card: band("card"),
      cardBody: type("card-body"),
      dialog: band("dialog"),
      gridShort: band("short"),
      gridTall: band("tall"),
      inline: (() => {
        const card = document.getElementById("inline").getBoundingClientRect();
        const badge = document.getElementById("inline-badge").getBoundingClientRect();
        const button = document.getElementById("inline-button").getBoundingClientRect();
        const style = getComputedStyle(document.getElementById("inline"));
        const content = card.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth);
        // Stretched children would fill the content box exactly.
        return { badgeNarrow: badge.width < content - 1, buttonNarrow: button.width < content - 1, display: getComputedStyle(document.getElementById("inline")).display };
      })(),
      dialogBody: type("dialog-body"),
      footerOnly: { ...plainRow("footer-only"), padding: getComputedStyle(document.getElementById("footer-only")).padding },
      nested: plainRow("nested"),
      plain: plainRow("plain"),
      prose: type("prose"),
    };
  });

  expect(result.cardBody).toEqual({ fontSize: "14px", lineHeight: "21px" });
  expect(result.dialogBody).toEqual(result.cardBody);
  // Prose outside UI surfaces keeps its roomier document leading.
  expect(result.prose).toEqual({ fontSize: "16px", lineHeight: "28px" });

  // A grid-stretched card pins its band to the bottom instead of floating it.
  for (const surface of [result.card, result.dialog, result.gridShort, result.gridTall]) {
    expect(surface).toMatchObject({
      borderTopWidth: "1px",
      bottomDelta: 0,
      leftDelta: 0,
      padding: "16px",
      surfacePaddingBottom: "0px",
      widthDelta: 0,
    });
    expect(surface.background).not.toBe("rgba(0, 0, 0, 0)");
    // The band's corners follow the surface's inner radius rather than overflow clipping.
    expect(surface.bottomRadius).toEqual(Array(2).fill(`${surface.surfaceRadius - 1}px`));
  }

  for (const row of [result.footerOnly, result.nested, result.plain]) {
    expect(row).toMatchObject({ background: "rgba(0, 0, 0, 0)", borderTopWidth: "0px", marginLeft: "0px" });
  }
  expect(result.footerOnly.padding).toBe("16px");
  // Direct inline children keep normal flow instead of a stretched, stacked column.
  expect(result.inline).toEqual({ badgeNarrow: true, buttonNarrow: true, display: "block" });
});

test("outline surfaces tint in dark mode, table headers use foreground, and valid fields stay neutral", async ({ page }) => {
  await page.goto("/components/");

  const result = await page.evaluate(() => {
    document.body.innerHTML = `
      <style>* { transition: none !important; }</style>
      ${["light", "dark"].map((theme) => `
        <section data-theme="${theme}">
          <button id="outline-${theme}" type="button" class="outline">Outline</button>
          <span id="badge-${theme}" class="badge outline">Badge</span>
          <span id="probe-${theme}" style="color: var(--background); background-color: var(--input); border-color: var(--border)"></span>
        </section>`).join("")}
      <table>
        <thead><tr><th id="column">Service</th><th>Status</th></tr></thead>
        <tbody><tr><th id="row" scope="row">Checkout API</th><td>Healthy</td></tr></tbody>
      </table>
      <input id="valid" aria-invalid="false" value="maya@example.com">
      <input id="plain" value="maya@example.com">
      <span id="foreground" style="color: var(--foreground)"></span>`;

    const probe = (theme) => {
      const style = getComputedStyle(document.getElementById(`probe-${theme}`));
      return { background: style.color, border: style.borderTopColor, input: style.backgroundColor };
    };
    const read = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return { background: style.backgroundColor, border: style.borderTopColor };
    };
    const cell = (id) => {
      const style = getComputedStyle(document.getElementById(id));
      return { color: style.color, fontWeight: style.fontWeight };
    };
    return {
      badges: { dark: read("badge-dark"), light: read("badge-light") },
      foreground: getComputedStyle(document.getElementById("foreground")).color,
      headers: { column: cell("column"), row: cell("row") },
      outline: { dark: read("outline-dark"), light: read("outline-light") },
      plainField: read("plain"),
      probes: { dark: probe("dark"), light: probe("light") },
      validField: { ...read("valid"), boxShadow: getComputedStyle(document.getElementById("valid")).boxShadow },
    };
  });

  // Light mode keeps the page-colored outline surface; dark mode swaps it for an input tint.
  expect(result.outline.light).toEqual({ background: result.probes.light.background, border: result.probes.light.border });
  expect(result.outline.dark.background).not.toBe(result.probes.dark.background);
  expect(result.outline.dark.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(result.outline.dark.border).toBe(result.probes.dark.input);
  for (const theme of ["light", "dark"]) {
    expect(result.badges[theme]).toEqual({ background: "rgba(0, 0, 0, 0)", border: result.probes[theme].border });
  }

  expect(result.headers.column).toEqual({ color: result.foreground, fontWeight: "500" });
  expect(result.headers.row).toEqual(result.headers.column);

  expect(result.validField.border).toBe(result.plainField.border);
  expect(result.validField.boxShadow).toBe("none");
});

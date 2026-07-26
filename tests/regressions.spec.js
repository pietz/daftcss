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

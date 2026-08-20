import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { discoverHtmlRoutes } from "./docs-routes.js";

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

function formatViolations(violations) {
  return violations.map((violation) => {
    const nodes = violation.nodes
      .map((node) => `    ${node.target.join(" ")}: ${node.failureSummary ?? "failed"}`)
      .join("\n");
    return `${violation.id} (${violation.impact ?? "unknown"}): ${violation.help}\n${nodes}`;
  }).join("\n\n");
}

test.beforeEach(async ({ context }) => {
  await context.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.origin === "http://127.0.0.1:4175") await route.continue();
    else await route.abort();
  });
});

for (const path of discoverHtmlRoutes()) {
  for (const theme of ["light", "dark"]) {
    test(`${path} has no automated WCAG A/AA violations in ${theme} theme`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(path);
      await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);

      const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
      expect(results.violations, formatViolations(results.violations)).toEqual([]);
    });
  }
}

test("Site Sequel accent components meet automated WCAG contrast expectations", async ({ page }) => {
  await page.goto("/components/");
  await page.evaluate(() => {
    document.body.innerHTML = `
      <main style="--accent: #a3f0c4; --accent-foreground: #052e1b">
        <button class="accent" type="button">Accent action</button>
        <button class="accent" type="button" disabled aria-busy="true">Publishing</button>
        <a class="button accent" href="#next">Accent link action</a>
        <details class="dropdown"><summary class="accent">Accent menu</summary><ul><li><a href="#edit">Edit</a></li></ul></details>
        <span class="badge accent">Accent badge</span>
        <label>Accent progress <progress class="accent" value="64" max="100">64%</progress></label>
      </main>`;
  });

  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
  expect(results.violations, formatViolations(results.violations)).toEqual([]);
});

for (const theme of ["light", "dark"]) {
  test(`the canonical breadcrumb has a named navigation landmark and no automated WCAG A/AA violations in ${theme} theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto("/components/");
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
      document.body.innerHTML = `
        <main>
          <nav aria-label="breadcrumb">
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#services">Services</a></li>
              <li>Current</li>
            </ul>
          </nav>
        </main>`;
    }, theme);

    await expect(page.getByRole("navigation", { name: "breadcrumb" })).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "breadcrumb" }).getByText("Current", { exact: true })).toBeVisible();
    await expect(page.locator('[aria-label="breadcrumb"] [aria-current]')).toHaveCount(0);

    const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  test(`the open mobile top navigation has no automated WCAG A/AA violations in ${theme} theme`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ colorScheme: theme });
    await page.goto("/");
    await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
    await page.getByRole("button", { name: "Toggle primary navigation" }).click();

    const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze();
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });
}

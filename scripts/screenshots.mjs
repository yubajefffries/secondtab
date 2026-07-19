// Regenerates the README screenshots against a running local server.
// Usage: node scripts/screenshots.mjs [baseUrl]
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
const outDir = "docs/screenshots";
mkdirSync(outDir, { recursive: true });

let browser;
for (const channel of ["chrome", "msedge"]) {
  try {
    browser = await chromium.launch({ channel });
    break;
  } catch {}
}
if (!browser) throw new Error("No Chrome or Edge found for screenshots");

async function shot({ name, url, theme, width, height }) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
  await page.goto(`${base}${url}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${outDir}/${name}.png` });
  await ctx.close();
  console.log(`saved ${outDir}/${name}.png`);
}

await shot({ name: "dashboard-light", url: "/dashboard", theme: "light", width: 1512, height: 960 });
await shot({ name: "pipeline-dark", url: "/pipeline", theme: "dark", width: 1512, height: 960 });
await shot({ name: "mobile-record-dark", url: "/companies/c2", theme: "dark", width: 390, height: 844 });

await browser.close();

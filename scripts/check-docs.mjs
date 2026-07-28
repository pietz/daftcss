import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, normalize, relative, resolve, sep } from "node:path";

const docsRoot = resolve("docs");
const htmlFiles = [];
const skillMarkdownFiles = [];

function walk(directory, extension, files) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path, extension, files);
    else if (entry.name.endsWith(extension)) files.push(path);
  }
}

function resolveLocalTarget(file, reference) {
  const withoutFragment = reference.split("#", 1)[0];
  const withoutQuery = withoutFragment.split("?", 1)[0];
  if (!withoutQuery || withoutQuery === "...") return null;
  if (/^(?:[a-z][a-z+.-]*:|\/\/)/i.test(withoutQuery)) return null;

  let target = withoutQuery.startsWith("/")
    ? join(docsRoot, withoutQuery.replace(/^\/+/, ""))
    : resolve(dirname(file), withoutQuery);

  target = normalize(target);
  const fromRoot = relative(docsRoot, target);
  if (fromRoot === ".." || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)) {
    return { error: "resolves outside docs", target };
  }
  if (existsSync(target) && statSync(target).isDirectory()) target = join(target, "index.html");
  return { target };
}

walk(docsRoot, ".html", htmlFiles);
walk(resolve("skills/daftcss"), ".md", skillMarkdownFiles);
const errors = [];
const idCache = new Map();

function checkHgroupHeadings(file) {
  const source = readFileSync(file, "utf8").replace(/`[^`\n]+`/g, "");
  const voidElements = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);

  for (const group of source.matchAll(/<hgroup\b[^>]*>([\s\S]*?)<\/hgroup>/gi)) {
    let depth = 0;
    for (const tag of group[1].matchAll(/<\/?([a-z][\w-]*)\b[^>]*>/gi)) {
      const name = tag[1].toLowerCase();
      const closing = tag[0].startsWith("</");
      if (!closing && depth === 0 && name === "strong") {
        const contentOffset = group.index + group[0].indexOf(group[1]);
        const line = source.slice(0, contentOffset + tag.index).split("\n").length;
        errors.push(`${file}:${line}: hgroup must use an h1-h6, not a direct strong child`);
      }
      if (closing) depth = Math.max(0, depth - 1);
      else if (!voidElements.has(name) && !tag[0].endsWith("/>")) depth += 1;
    }
  }
}

for (const file of [...htmlFiles, ...skillMarkdownFiles, resolve("README.md"), resolve("DOCS.md")]) {
  checkHgroupHeadings(file);
}

function idsFor(file) {
  if (!idCache.has(file)) {
    const html = readFileSync(file, "utf8").replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, "");
    idCache.set(file, new Set([...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1])));
  }
  return idCache.get(file);
}

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const renderedHtml = html.replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, "");
  const ids = new Set();

  for (const match of renderedHtml.matchAll(/^[ \t]*<(?:script|link)\b[^>]*(?:src|href)=["']https?:\/\/[^"']+["'][^>]*>/gim)) {
    if (!/\sintegrity=["'][^"']+["']/i.test(match[0])) {
      errors.push(`${file}: remote script or stylesheet is missing an integrity attribute`);
    }
  }

  for (const match of renderedHtml.matchAll(/\sid=["']([^"']+)["']/gi)) {
    if (ids.has(match[1])) errors.push(`${file}: duplicate id ${JSON.stringify(match[1])}`);
    ids.add(match[1]);
  }

  for (const match of renderedHtml.matchAll(/\s(?:href|src)=["']([^"']+)["']/gi)) {
    const reference = match[1];
    const resolved = resolveLocalTarget(file, reference);
    if (resolved?.error) errors.push(`${file}: ${reference} ${resolved.error}`);
    else if (resolved && !existsSync(resolved.target)) errors.push(`${file}: missing target ${reference}`);

    const fragment = reference.includes("#") ? reference.slice(reference.indexOf("#") + 1) : "";
    if (!fragment || /^(?:[a-z][a-z+.-]*:|\/\/)/i.test(reference)) continue;

    const fragmentTarget = resolved?.target ?? file;
    if (existsSync(fragmentTarget) && fragmentTarget.endsWith(".html")) {
      let id;
      try { id = decodeURIComponent(fragment); }
      catch { errors.push(`${file}: invalid fragment encoding in ${reference}`); continue; }
      if (!idsFor(fragmentTarget).has(id)) errors.push(`${file}: missing fragment target ${reference}`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Checked links, duplicate IDs, remote asset integrity, and hgroup headings in ${htmlFiles.length} HTML files and ${skillMarkdownFiles.length + 2} Markdown files.`);

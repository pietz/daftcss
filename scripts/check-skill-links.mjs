import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

const repositoryRoot = resolve(".");
const skillRoot = resolve("skills/daftcss");
const rootMarkdownFiles = ["README.md", "DOCS.md", "SLIDES.md", "AGENTS.md", "CLAUDE.md"];
const markdownFiles = [];
const headingCache = new Map();

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith(".md")) markdownFiles.push(path);
  }
}

function withoutCodeFences(markdown) {
  return markdown.replace(/```[\s\S]*?```/g, "");
}

function slug(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[`*_~]/g, "")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function headingsFor(file) {
  if (!headingCache.has(file)) {
    const markdown = withoutCodeFences(readFileSync(file, "utf8"));
    const headings = new Set([...markdown.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) => slug(match[1])));
    headingCache.set(file, headings);
  }
  return headingCache.get(file);
}

walk(skillRoot);
for (const file of rootMarkdownFiles) {
  const path = resolve(file);
  if (existsSync(path)) markdownFiles.push(path);
}
const errors = [];

for (const file of markdownFiles) {
  const markdown = withoutCodeFences(readFileSync(file, "utf8"));

  for (const match of markdown.matchAll(/(?<!!)\[[^\]]+\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const reference = match[1];
    if (/^(?:[a-z][a-z+.-]*:|\/\/)/i.test(reference)) continue;

    const [pathPart, fragmentPart = ""] = reference.split("#", 2);
    let target = pathPart ? resolve(dirname(file), decodeURIComponent(pathPart)) : file;
    const fromRoot = relative(repositoryRoot, target);
    if (fromRoot === ".." || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)) {
      errors.push(`${relative(repositoryRoot, file)}: link resolves outside the repository: ${reference}`);
      continue;
    }
    if (!existsSync(target)) {
      errors.push(`${relative(repositoryRoot, file)}: missing link target: ${reference}`);
      continue;
    }
    if (statSync(target).isDirectory()) {
      const indexMarkdown = join(target, "index.md");
      const indexHtml = join(target, "index.html");
      if (existsSync(indexMarkdown)) target = indexMarkdown;
      else if (existsSync(indexHtml)) target = indexHtml;
      else {
        errors.push(`${relative(repositoryRoot, file)}: linked directory has no index file: ${reference}`);
        continue;
      }
    }

    if (fragmentPart && target.endsWith(".md")) {
      const fragment = slug(decodeURIComponent(fragmentPart));
      if (!headingsFor(target).has(fragment)) {
        errors.push(`${relative(repositoryRoot, file)}: missing heading target: ${reference}`);
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Checked local links in ${markdownFiles.length} skill and repository Markdown files.`);

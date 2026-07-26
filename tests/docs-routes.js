import { readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

const docsRoot = resolve("docs");

export function discoverHtmlRoutes(directory = docsRoot) {
  const routes = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) routes.push(...discoverHtmlRoutes(path));
    else if (entry.name === "index.html") {
      const directoryPath = relative(docsRoot, directory).split(sep).join("/");
      routes.push(directoryPath ? `/${directoryPath}/` : "/");
    } else if (entry.name.endsWith(".html")) {
      routes.push(`/${relative(docsRoot, path).split(sep).join("/")}`);
    }
  }
  return routes.sort();
}

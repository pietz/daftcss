import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const temporaryDirectory = mkdtempSync(join(tmpdir(), "daftcss-build-"));
const executable = join("node_modules", ".bin", process.platform === "win32" ? "lightningcss.cmd" : "lightningcss");
const outputs = [
  { path: "dist/daft.css", arguments: ["--bundle", "src/daft.css"] },
  { path: "dist/daft.min.css", arguments: ["--bundle", "--minify", "src/daft.css"] },
];

try {
  let failed = false;

  for (const output of outputs) {
    const generated = join(temporaryDirectory, output.path.split("/").at(-1));
    const result = spawnSync(executable, [...output.arguments, "-o", generated], {
      encoding: "utf8",
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });

    if (result.status !== 0) {
      process.stderr.write(result.stderr || result.stdout);
      process.exit(result.status ?? 1);
    }

    const expected = readFileSync(output.path);
    const actual = readFileSync(generated);
    if (!expected.equals(actual)) {
      console.error(`${output.path} does not match a fresh build from src/daft.css.`);
      failed = true;
    }

    const docsCopy = readFileSync(output.path.replace("dist/", "docs/dist/"));
    if (!expected.equals(docsCopy)) {
      console.error(`${output.path} and its docs/dist copy differ.`);
      failed = true;
    }
  }

  if (failed) process.exit(1);
  console.log("Generated CSS matches source and docs copies.");
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}

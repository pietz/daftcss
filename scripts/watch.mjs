import { watch } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";

const executable = join("node_modules", ".bin", process.platform === "win32" ? "lightningcss.cmd" : "lightningcss");
const outputs = ["dist/daft.css", "docs/dist/daft.css"];
let building = false;
let pending = false;
let debounce;

function compile(output) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, ["--bundle", "src/daft.css", "-o", output], {
      shell: process.platform === "win32",
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`Lightning CSS stopped with ${signal || `exit code ${code}`}.`));
    });
  });
}

async function build() {
  if (building) {
    pending = true;
    return;
  }

  building = true;
  try {
    await Promise.all(outputs.map(compile));
    console.log("Updated dist/daft.css and docs/dist/daft.css");
  } catch (error) {
    console.error(error.message);
  } finally {
    building = false;
    if (pending) {
      pending = false;
      void build();
    }
  }
}

await build();
const watcher = watch("src", { recursive: true }, (_event, filename) => {
  if (filename && !filename.endsWith(".css")) return;
  clearTimeout(debounce);
  debounce = setTimeout(() => void build(), 75);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    clearTimeout(debounce);
    watcher.close();
    process.exit();
  });
}

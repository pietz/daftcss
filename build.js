import { bundle, Features } from "lightningcss";
import { writeFileSync, mkdirSync, existsSync, watch } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const isWatch = process.argv.includes("--watch");

// Target modern browsers only
const targets = {
  chrome: 100 << 16,
  firefox: 100 << 16,
  safari: 15 << 16,
  edge: 100 << 16,
};

function build() {
  const startTime = Date.now();

  try {
    // Ensure dist directory exists
    const distDir = join(__dirname, "dist");
    if (!existsSync(distDir)) {
      mkdirSync(distDir, { recursive: true });
    }

    // Bundle and transform CSS
    const { code: fullCode } = bundle({
      filename: join(__dirname, "src/daft.css"),
      targets,
      include:
        Features.Nesting |
        Features.ColorFunction |
        Features.CustomMediaQueries,
      drafts: {
        customMedia: true,
      },
      errorRecovery: true,
    });

    // Write full version
    writeFileSync(join(distDir, "daft.css"), fullCode);

    // Bundle minified version
    const { code: minCode } = bundle({
      filename: join(__dirname, "src/daft.css"),
      targets,
      minify: true,
      include:
        Features.Nesting |
        Features.ColorFunction |
        Features.CustomMediaQueries,
      drafts: {
        customMedia: true,
      },
      errorRecovery: true,
    });

    // Write minified version
    writeFileSync(join(distDir, "daft.min.css"), minCode);

    const elapsed = Date.now() - startTime;
    const fullSize = (fullCode.length / 1024).toFixed(2);
    const minSize = (minCode.length / 1024).toFixed(2);

    console.log(`✓ Built in ${elapsed}ms`);
    console.log(`  dist/daft.css     ${fullSize} KB`);
    console.log(`  dist/daft.min.css ${minSize} KB`);
  } catch (error) {
    console.error("Build error:", error.message);
    if (error.loc) {
      console.error(`  at ${error.loc.filename}:${error.loc.line}:${error.loc.column}`);
    }
    if (!isWatch) {
      process.exit(1);
    }
  }
}

// Initial build
build();

// Watch mode
if (isWatch) {
  console.log("\nWatching for changes...\n");

  const srcDir = join(__dirname, "src");

  watch(srcDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith(".css")) {
      console.log(`\nChanged: ${filename}`);
      build();
    }
  });
}

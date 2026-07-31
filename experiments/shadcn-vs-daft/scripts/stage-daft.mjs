import { createHash } from "node:crypto"
import { copyFile, mkdir, readFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const experimentRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const source = resolve(experimentRoot, "../../dist/daft.css")
const destination = resolve(experimentRoot, "public/vendor/daft.css")
const baseline = resolve(experimentRoot, "public/vendor/daft-old.css")

await mkdir(dirname(destination), { recursive: true })
await copyFile(source, destination)

const [sourceBytes, stagedBytes] = await Promise.all([
  readFile(source),
  readFile(destination),
])

if (!sourceBytes.equals(stagedBytes)) {
  throw new Error("Staged Daft CSS differs from the root dist/daft.css artifact.")
}

const digest = createHash("sha256").update(stagedBytes).digest("hex").slice(0, 12)
const baselineBytes = await readFile(baseline)
const baselineDigest = createHash("sha256").update(baselineBytes).digest("hex").slice(0, 12)
if (baselineDigest !== "6dbecc21405b") {
  throw new Error(`Frozen Daft baseline changed unexpectedly (sha256 ${baselineDigest}).`)
}
console.log(`Staged ${stagedBytes.length} bytes from dist/daft.css (sha256 ${digest}).`)
console.log(`Verified ${baselineBytes.length} byte Daft v1.20.1 baseline (sha256 ${baselineDigest}).`)

const fs = require("fs")
const path = require("path")

const projectRoot = path.resolve(__dirname, "..")
const roots = ["app", "components", "lib", "tmp-v0"].map((p) =>
  path.join(projectRoot, p),
)

const exts = new Set([".ts", ".tsx", ".js", ".jsx"])

const importRes = [
  /\bfrom\s+["']([^"']+)["']/g,
  /\brequire\(\s*["']([^"']+)["']\s*\)/g,
  /\bimport\(\s*["']([^"']+)["']\s*\)/g,
]

function isExternal(spec) {
  if (!spec) return false
  if (spec.startsWith(".") || spec.startsWith("/")) return false
  if (spec.startsWith("@/")) return false
  return true
}

function toPackageName(spec) {
  if (spec.startsWith("@")) return spec.split("/").slice(0, 2).join("/")
  return spec.split("/")[0]
}

function walk(dir, onFile) {
  if (!fs.existsSync(dir)) return
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, onFile)
    else if (exts.has(path.extname(ent.name))) onFile(p)
  }
}

const found = new Set()
for (const root of roots) {
  walk(root, (filePath) => {
    const text = fs.readFileSync(filePath, "utf8")
    for (const re of importRes) {
      re.lastIndex = 0
      let m
      while ((m = re.exec(text))) {
        const spec = m[1]
        if (!isExternal(spec)) continue
        const pkg = toPackageName(spec)
        found.add(pkg)
      }
    }
  })
}

const pkgJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"))
const declared = new Set([
  ...Object.keys(pkgJson.dependencies || {}),
  ...Object.keys(pkgJson.devDependencies || {}),
])

// These are always expected in Next projects, but already handled separately.
declared.add("next")
declared.add("react")
declared.add("react-dom")

const missing = [...found].filter((p) => !declared.has(p)).sort()

process.stdout.write(JSON.stringify(missing, null, 2))

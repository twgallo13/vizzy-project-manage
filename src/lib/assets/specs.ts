export const COMMON_ASSETS = [
  { type: "IG Reel", spec: "1080x1920, mp4, <= 60s" },
  { type: "IG Post", spec: "1080x1350, jpg/png" },
  { type: "Story", spec: "1080x1920, jpg/png/mp4" },
  { type: "Email Banner", spec: "1200x600, jpg/png" },
  { type: "Site Hero", spec: "1920x800, jpg/png" }
]

export function ensureAssetUniq(assets: {type:string; spec:string}[]) {
  const seen = new Set<string>()
  return assets.filter(a => {
    const k = `${a.type}::${a.spec}`.toLowerCase()
    if (seen.has(k)) return false
    seen.add(k); return true
  })
}

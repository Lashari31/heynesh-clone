// Webflow reuses base filenames across different assets ("Frame 116046198.avif"
// exists twice under different hashes), so the hash prefix cannot be dropped
// entirely or one asset silently overwrites the other. Keep a short hash.
export function slugFor(url) {
  const file = decodeURIComponent(url.split('/').pop().split('?')[0]);
  const m = file.match(/^([a-f0-9]{16,})_(.*)$/i);
  const hash = m ? m[1].slice(-6).toLowerCase() : '';
  const base = (m ? m[2] : file)
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return hash ? `${hash}-${base}` : base;
}

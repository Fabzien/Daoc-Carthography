// URL of a file of public/ (given from its root, like '/maps/…'), under the
// path the site is served from: '/' in development, '/<repository>/' on GitHub
// Pages (BASE_PATH in vite.config.ts).
export function publicUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}

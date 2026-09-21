export const basePath = process.env.GITHUB_PAGES === "true" ? "/TrovaBenzina-frontend" : "";

export function withBasePath(path: string): string {
  return `${basePath}${path}`;
}

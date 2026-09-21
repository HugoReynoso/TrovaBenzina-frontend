/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath: isGithubPages ? "/TrovaBenzina-frontend" : "",
  assetPrefix: isGithubPages ? "/TrovaBenzina-frontend/" : "",
  images: {
    unoptimized: true
  }
};

export default nextConfig;

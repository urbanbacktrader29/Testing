import type { NextConfig } from "next";

// Only applied when building for GitHub Pages (set by the deploy workflow),
// so local `npm run dev` / `npm run build` keep working at the site root.
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoName = "Testing";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  ...(isGithubPages
    ? { basePath: `/${repoName}`, assetPrefix: `/${repoName}/` }
    : {}),
};

export default nextConfig;

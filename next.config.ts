import type { NextConfig } from "next";
import { WIDTHS } from "./lib/image-loader";

/**
 * Static export: plain HTML/CSS/JS in out/, hostable on any static host
 * (the current Hostinger plan included). trailingSlash gives /about-us/index.html,
 * which Apache serves at the same /about-us/ URLs the WordPress site used.
 *
 * Security headers and the CSP live in public/.htaccess — next.config headers()
 * does not apply to an export.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    // Every size is already a file in public/_img (scripts/images.mjs).
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    deviceSizes: WIDTHS.filter((w) => w >= 640),
    imageSizes: WIDTHS.filter((w) => w < 640),
  },
};

export default nextConfig;

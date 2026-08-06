import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  // Next's on-the-fly image optimizer does a self-fetch for local images that doesn't
  // account for running behind Apache's path-prefixed reverse proxy, which makes it
  // fetch the wrong URL and fail ("received null"). These are static local assets with
  // no need for resizing, so skip the optimizer and serve them as-is.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

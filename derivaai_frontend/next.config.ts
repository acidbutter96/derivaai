import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  sassOptions: {
    // lets any .scss do: @use "styles/mixins" as *;  (independent of the cwd next was started from)
    loadPaths: [fileURLToPath(new URL("./src", import.meta.url))],
  },
};

export default nextConfig;

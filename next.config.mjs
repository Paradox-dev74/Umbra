import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      child_process: false,
      "fs/promises": false,
      "pino-pretty": false,
      "@react-native-async-storage/async-storage": false,
    };

    const permitsStub = path.resolve(__dirname, "lib/stubs/cofhe-sdk/permits.ts");
    const permitsReal = path.resolve(__dirname, "node_modules/@cofhe/sdk/dist/permits.js");

    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@cofhe/react": path.resolve(__dirname, "lib/stubs/cofhe-react.ts"),
        "@cofhe/sdk/chains": path.resolve(__dirname, "lib/stubs/cofhe-sdk/chains.ts"),
        "@cofhe/sdk/permits": permitsStub,
        "@cofhe/sdk": path.resolve(__dirname, "lib/stubs/cofhe-sdk/index.ts"),
      };
    } else {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@cofhe/sdk/permits": permitsReal,
      };
    }

    return config;
  },
};

export default nextConfig;

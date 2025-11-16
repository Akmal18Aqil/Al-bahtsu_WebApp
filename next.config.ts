import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "http://192.168.83.1:3000",
    "http://localhost:3000",
  ],
  /* config options here */
  // 禁用 Next.js 热重载，由 nodemon 处理重编译
  reactStrictMode: false,
  webpack: (config, { dev }) => {
    if (dev) {
      // 禁用 webpack 的热模块替换
      config.watchOptions = {
        ignored: ["**/*"], // 忽略所有文件变化
      };
    }
    return config;
  },
};

export default nextConfig;

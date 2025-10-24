import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5091", // thêm port nếu bạn dùng cổng 5091
        pathname: "/uploads/**", // hoặc "*/**" nếu bạn không chắc
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5091",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;

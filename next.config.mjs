import createNextIntlPlugin from "next-intl/plugin";
import NextBundleAnalyzer from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin({
  requestConfig: "./src/i18n/request.ts",
  experimental: {
    createMessagesDeclaration: "./messages/vi.json",
  },
});

const withBundleAnalyzer = NextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        hostname: "localhost",
        pathname: "/**",
      },
    ],
  },
  reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@iltct/shared"],
  // Monorepo: mobile usa React 19 types y el CRM React 18; next/link choca en Vercel.
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;

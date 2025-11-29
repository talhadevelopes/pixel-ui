/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove transpilePackages - it's forcing Next.js to use src files
  experimental: {
    externalDir: true,
  },
}

export default nextConfig
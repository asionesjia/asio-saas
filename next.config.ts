import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    ppr: true,
    useLightningcss: true,
  },
  devIndicators: {
    appIsrStatus: true,
    buildActivity: true,
    buildActivityPosition: 'top-left',
  },
}

export default nextConfig

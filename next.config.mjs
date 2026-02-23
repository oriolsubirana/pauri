/** @type {import('next').NextConfig} */
const nextConfig = {
    // No experimental features - Netlify compatible
    reactStrictMode: true,
    poweredByHeader: false,
    // Image optimization config
    images: {
        formats: ['image/avif', 'image/webp'],
        localPatterns: [{ pathname: '/photos/**' }, { pathname: '/venue/**' }],
    },
}

export default nextConfig

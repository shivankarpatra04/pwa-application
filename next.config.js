/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        // Add these settings to prevent layout shifts with images
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    // Enable production optimizations
    swcMinify: true,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    // Add optimization for unused JavaScript and CSS
    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['react', 'react-dom', 'next'],
        // Add this to help with layout stability
        scrollRestoration: true,
    },

    // Rest of your webpack config remains the same
    webpack: (config, { dev, isServer }) => {
        // Only run in production client-side builds
        if (!dev && !isServer) {
            // Enable tree shaking and dead code elimination
            config.optimization.usedExports = true;

            // Split chunks more aggressively
            config.optimization.splitChunks = {
                chunks: 'all',
                maxInitialRequests: 25,
                minSize: 20000,
                cacheGroups: {
                    default: false,
                    vendors: false,
                    framework: {
                        name: 'framework',
                        test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
                        priority: 40,
                        enforce: true,
                    },
                    lib: {
                        test: /[\\/]node_modules[\\/]/,
                        name(module) {
                            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                            return `npm.${packageName.replace('@', '')}`;
                        },
                        priority: 30,
                        minChunks: 1,
                        reuseExistingChunk: true,
                    },
                    commons: {
                        name: 'commons',
                        minChunks: 2,
                        priority: 20,
                    },
                },
            };
        }

        return config;
    },
}

module.exports = nextConfig
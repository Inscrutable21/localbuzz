/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add transpilePackages to handle Three.js properly
  transpilePackages: ['three'],
  // Enable standalone output for optimized production deployment
  output: 'standalone',
  // Disable production source maps for better performance
  productionBrowserSourceMaps: false,
  // Ignore ESLint errors during build
  eslint: {
    // This allows production builds to successfully complete even if
    // your project has ESLint errors
    ignoreDuringBuilds: true,
  },
  // Ensure proper handling of WebGL context
  webpack: (config) => {
    // This is needed for Three.js to work properly
    config.externals = config.externals || [];
    config.externals.push({
      canvas: 'canvas',
      'gl': 'gl',
      'document': 'document',
      'navigator': 'navigator',
      'umd': 'umd',
    });
    
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Get the name. E.g. node_modules/packageName/not/this/part.js
              // or node_modules/packageName
              const packageNameMatch = module.context ? 
                module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/) : null;
              
              // Safely extract the package name or use a default
              const packageName = packageNameMatch && packageNameMatch[1] ? 
                packageNameMatch[1] : 'vendor';
              
              // Return specific chunks for large packages
              if (packageName === 'three' || 
                  (typeof packageName === 'string' && packageName.includes('@react-three'))) {
                return `3d-vendor`;
              }
              return `vendor`;
            },
          },
        },
      },
    };
    
    return config;
  },
  // Improve performance for mobile devices
  experimental: {
    // Disable optimizeCss to avoid critters dependency issues
    optimizeCss: false,
    optimizePackageImports: ['three', '@react-three/fiber', '@react-three/drei'],
    // Add more aggressive optimizations
    optimizeFonts: true,
    scrollRestoration: true,
    largePageDataBytes: 128 * 1000, // 128KB
  },
};

export default nextConfig;






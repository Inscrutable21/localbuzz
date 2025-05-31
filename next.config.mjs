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
    
    // Add support for GLB/GLTF files with more explicit configuration
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
      },
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
              const packageNameMatch = module.context ? 
                module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/) : null;
              
              const packageName = packageNameMatch && packageNameMatch[1] ? 
                packageNameMatch[1] : 'vendor';
              
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
    outputFileTracingRoot: process.cwd(),
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
    outputFileTracingIncludes: {
      '/': ['public/**/*'],
    },
  },
  // Ensure 3D model files are copied to the output directory
  async rewrites() {
    return [
      {
        source: '/3dmodel/:path*',
        destination: '/3dmodel/:path*',
      },
    ];
  },
  // Add this to ensure 3D models are copied correctly
  async headers() {
    return [
      {
        source: '/3dmodel/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Add static asset handling
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
};

export default nextConfig;










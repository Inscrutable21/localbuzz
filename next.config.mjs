/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add transpilePackages to handle Three.js properly
  transpilePackages: ['three'],
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
    
    return config;
  },
};

export default nextConfig;


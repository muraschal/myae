/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config) => {
    // Verbessere die Modul-Auflösung
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, './src'),
      },
      modules: [
        path.resolve(__dirname, './src'),
        'node_modules'
      ]
    };
    return config;
  }
};

module.exports = nextConfig;

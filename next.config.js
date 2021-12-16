const { withPlausibleProxy } = require("next-plausible");
const withPWA = require("next-pwa");

module.exports = withPlausibleProxy()(withPWA({
  reactStrictMode: false, //true
  images: {
    domains: [],
  },
  async rewrites() {
    return [
      {
        source: "/js/script.js",
        destination: "https://plausible.io/js/plausible.js",
      },
      {
        source: "/api/event", // Or '/api/event/' if you have `trailingSlash: true` in this config
        destination: "https://plausible.io/api/event",
      },
    ];
  },
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
  },
}));

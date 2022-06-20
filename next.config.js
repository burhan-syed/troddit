const { withPlausibleProxy } = require("next-plausible");
const withPWA = require("next-pwa");

module.exports = withPlausibleProxy()(
  withPWA({
    reactStrictMode: false, //true
    images: {
      domains: [],
    },
    async redirects() {
      return [
        {
          source: "/user/:path*",
          destination: "/u/:path*",
          permanent: true,
        },
        { source: "/comments/:path*", destination: "/:path*", permanent: true },
      {source: "/r/:sub/w/:page*", destination: "/r/:sub/wiki/:page*", permanent: true}
      ];
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
      disable: process.env.NODE_ENV === "development",
      dest: "public",
      register: true,
      skipWaiting: true,
    },
  })
);

const { createProxyMiddleware } = require("http-proxy-middleware");

const apiToken = process.env.API_TOKEN;
const platformBaseUrl = process.env.PLATFORM_BASE_URL;

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/core/v1", {
      target: platformBaseUrl,
      changeOrigin: true,
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader("Authorization", `Bearer ${apiToken}`);
      },
    })
  );
};

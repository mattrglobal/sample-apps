const { createProxyMiddleware } = require("http-proxy-middleware");

const apiToken = process.argv[2];
if (!apiToken) {
  throw new Error("Access token is missing - include a valid JWT as an argument");
}

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/core/v1", {
      target: process.env.REACT_APP_API_BASE_URL,
      changeOrigin: true,
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader("Authorization", `Bearer ${apiToken}`);
      },
    })
  );
  // The following proxy rule translates `https://localhost:3000/manifest/${custom-domain}` to `https://${custom-domain}/manifest.json`
  app.use(
    "/manifest",
    createProxyMiddleware({
      changeOrigin: true,
      pathRewrite: (path, req) => {
        return "/manifest.json";
      },
      router: (req) => {
        const host = req.url.replace(/\/manifest\//, "");
        return `https://${host}`;
      },
      followRedirects: true,
    })
  );
};

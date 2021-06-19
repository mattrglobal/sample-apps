/*
 * Copyright 2019 - MATTR Limited
 * All rights reserved
 * Confidential and proprietary
 */

const { createProxyMiddleware } = require("http-proxy-middleware");

const apiToken = ""; // MATTR platform API token
const baseServerUrl = ""; // MATTR platform URL

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/core/v1", {
      target: baseServerUrl,
      changeOrigin: true,
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader("Authorization", `Bearer ${apiToken}`);
      },
    })
  );
};

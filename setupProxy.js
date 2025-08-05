const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api', // Path to proxy
    createProxyMiddleware({
      target: 'http://localhost:5000', // The backend server URL
      changeOrigin: true, // Modify the origin header to match the target
    })
  );
};

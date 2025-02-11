const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    ['/api/', '/uploads'],
    createProxyMiddleware({
      target: 'http://16.170.235.27:5000/',
      changeOrigin: true,
      allowedHosts: ['127.0.0.1']
    })
  );
};
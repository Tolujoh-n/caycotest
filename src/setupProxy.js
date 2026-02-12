const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Only proxy API requests, ignore static files
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      logLevel: 'warn',
      onError: (err, req, res) => {
        // Handle proxy errors gracefully
        if (err.code === 'ECONNREFUSED') {
          console.warn('Backend server is not running. Please start the backend server on port 5000.');
        }
        // Don't send error response for favicon or other static files
        if (!req.url.includes('/api')) {
          return;
        }
      },
      onProxyReq: (proxyReq, req, res) => {
        // Only log actual API requests
        if (req.url.startsWith('/api')) {
          console.log(`Proxying ${req.method} ${req.url} to http://localhost:5000`);
        }
      }
    })
  );
};

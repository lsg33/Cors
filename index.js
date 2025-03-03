const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const url = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS (optional but recommended)
app.use(cors());

// Middleware for logging requests
app.use((req, res, next) => {
  console.log(`Request URL: ${req.originalUrl}`);
  next();
});

// Dynamic Proxy Middleware
app.use(
  '/*',
  (req, res, next) => {
    const targetUrl = req.params[0]; // Get the full target URL from the path

    try {
      const parsedUrl = url.parse(targetUrl); // Parse the URL to validate

      if (!parsedUrl.protocol || !parsedUrl.host) {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      // Create proxy for this request
      createProxyMiddleware({
        target: `${parsedUrl.protocol}//${parsedUrl.host}`, // Base target URL
        changeOrigin: true,
        pathRewrite: {
          // Rewrite the URL path to remove the target URL part from the path
          [`^/${targetUrl}`]: '', // remove the entire target URL from the local request path
        },
        onError: (err, req, res) => {
          res.status(500).json({ error: 'Proxy error', details: err.message });
        },
        onProxyRes: (proxyRes) => {
          // Security improvements: remove unnecessary headers
          delete proxyRes.headers['x-powered-by'];
        },
      })(req, res, next); // Call proxy
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL' });
    }
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});

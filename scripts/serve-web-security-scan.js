'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const root = path.resolve(__dirname, '..', 'dist');
const hostname = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 8081);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const securityHeaders = {
  'Content-Security-Policy':
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http://localhost:8080",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

function writeResponse(response, status, headers, body = '') {
  response.writeHead(status, {
    ...securityHeaders,
    'Cache-Control': 'no-store',
    ...headers,
  });
  response.end(body);
}

function resolveAsset(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const assetPath = path.resolve(root, relativePath);
  return assetPath.startsWith(`${root}${path.sep}`) ? assetPath : null;
}

if (!fs.existsSync(path.join(root, 'index.html'))) {
  console.error('Missing dist/index.html. Run "npm run build:web:security" first.');
  process.exit(1);
}

const server = http.createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    writeResponse(response, 405, { Allow: 'GET, HEAD', 'Content-Length': '0' });
    return;
  }

  let assetPath;
  try {
    assetPath = resolveAsset(request.url);
  } catch {
    writeResponse(response, 400, { 'Content-Length': '0' });
    return;
  }

  if (!assetPath || !fs.existsSync(assetPath) || !fs.statSync(assetPath).isFile()) {
    writeResponse(response, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Not found');
    return;
  }

  const contentType = contentTypes[path.extname(assetPath).toLowerCase()] || 'application/octet-stream';
  response.writeHead(200, {
    ...securityHeaders,
    'Cache-Control': assetPath.endsWith('.html') ? 'no-store' : 'public, max-age=31536000, immutable',
    'Content-Type': contentType,
  });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  fs.createReadStream(assetPath).pipe(response);
});

server.on('clientError', (_error, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\nContent-Length: 0\r\n\r\n');
});

server.listen(port, hostname, () => {
  console.log(`StatusScope production web scan server listening on http://${hostname}:${port}`);
});

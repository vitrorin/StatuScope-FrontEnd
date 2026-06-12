const fs = require('fs');
const http = require('http');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const port = Number(process.argv[2] || 4173);
const indexPath = path.join(distDir, 'index.html');

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function sendFile(response, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Unable to read static file.');
      return;
    }

    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
    });
    response.end(content);
  });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url || '/', 'http://localhost');
  const relativePath = decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const requestedPath = path.normalize(path.join(distDir, relativePath));

  if (!requestedPath.startsWith(distDir)) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  fs.stat(requestedPath, (error, stat) => {
    if (!error && stat.isFile()) {
      sendFile(response, requestedPath);
      return;
    }

    sendFile(response, indexPath);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving dist at http://127.0.0.1:${port}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

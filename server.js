const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8689;
const distDir = path.join(__dirname, 'dist');

const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
};

const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);

    // Strip base path prefix if present
    if (urlPath.startsWith('/bazifenxi')) {
        urlPath = urlPath.slice('/bazifenxi'.length) || '/';
    }

    let filePath = path.join(distDir, urlPath);

    // Serve index.html for directory requests or SPA fallback
    if (urlPath === '/' || !path.extname(filePath)) {
        const tryIndex = path.join(filePath, 'index.html');
        if (fs.existsSync(tryIndex)) {
            filePath = tryIndex;
        } else if (!fs.existsSync(filePath)) {
            // SPA fallback
            filePath = path.join(distDir, 'index.html');
        }
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`bazifenxi server running at http://0.0.0.0:${port}`);
});

const http = require('http');
const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <html>
      <body>
        <h1>SalesTrack Frontend Test</h1>
        <p>Server is running on port ${port}</p>
        <p>Environment: ${process.env.NODE_ENV}</p>
        <p>API URL: ${process.env.NEXT_PUBLIC_API_URL}</p>
        <p>Time: ${new Date().toISOString()}</p>
      </body>
    </html>
  `);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Test server running on http://0.0.0.0:${port}`);
});

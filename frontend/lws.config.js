// config for serving pre-built static frontend for e2e test on pipeline
const API_HOST = process.env.API_HOST || 'localhost';

module.exports = {
  directory: './dist/browser',
  spa: 'index.html',
  port: 8080,
  rewrite: [{ from: '/api/(.*)', to: `http://${API_HOST}:3000/api/$1` }],
};

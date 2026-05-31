const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzc5ODg0MzY1LCJleHAiOjE3ODA0ODkxNjV9.2_Ln5GZpVB5cwYzWAEcuQ0B1RvmuUnVXjazv9st23WE';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/users',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(data));
});

req.on('error', (e) => console.error('Error:', e.message));
req.end();
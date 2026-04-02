// Quick test script to verify server endpoints
const http = require('http');

const testEndpoint = (path) => {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5001${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`✓ ${path}: ${json.length || 0} records`);
          resolve(json);
        } catch (e) {
          console.log(`✗ ${path}: Invalid JSON`);
          reject(e);
        }
      });
    }).on('error', (e) => {
      console.log(`✗ ${path}: ${e.message}`);
      reject(e);
    });
  });
};

async function runTests() {
  console.log('Testing OceanRaksha API endpoints...\n');
  
  try {
    await testEndpoint('/api/pollution');
    await testEndpoint('/api/fish');
    await testEndpoint('/api/risk');
    console.log('\n✓ All endpoints working!');
  } catch (e) {
    console.log('\n✗ Some endpoints failed. Make sure server is running: cd server && npm start');
  }
}

runTests();

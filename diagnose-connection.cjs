// Quick diagnostic script to test backend-frontend connection
const http = require('http');

console.log('🔍 Diagnosing OceanRaksha API Connection...\n');

const tests = [
  {
    name: 'Backend Server (Direct)',
    host: 'localhost',
    port: 5001,
    path: '/api/pollution'
  },
  {
    name: 'Frontend Server',
    host: 'localhost',
    port: 5173,
    path: '/'
  },
  {
    name: 'Frontend Proxy to Backend',
    host: 'localhost',
    port: 5173,
    path: '/api/pollution'
  }
];

async function testConnection(test) {
  return new Promise((resolve) => {
    const req = http.get({
      hostname: test.host,
      port: test.port,
      path: test.path,
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          success: true,
          status: res.statusCode,
          data: data.substring(0, 200)
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Connection timeout'
      });
    });
  });
}

async function runDiagnostics() {
  for (const test of tests) {
    console.log(`Testing: ${test.name}`);
    console.log(`  URL: http://${test.host}:${test.port}${test.path}`);
    
    const result = await testConnection(test);
    
    if (result.success) {
      console.log(`  ✅ Status: ${result.status}`);
      if (result.data) {
        console.log(`  📦 Data: ${result.data.substring(0, 100)}...`);
      }
    } else {
      console.log(`  ❌ Error: ${result.error}`);
    }
    console.log('');
  }

  console.log('📊 Summary:');
  console.log('  Backend: http://localhost:5001');
  console.log('  Frontend: http://localhost:5173');
  console.log('  Test Page: http://localhost:5173/test-connection.html');
  console.log('\n✨ Open the test page in your browser to see detailed results!');
}

runDiagnostics();

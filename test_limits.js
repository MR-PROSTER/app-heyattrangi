const http = require('http');

async function sendChatRequest(message) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/pragya/chat',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on('error', (e) => resolve({ status: 500, error: e.message }));
    req.write(JSON.stringify({ message }));
    req.end();
  });
}

async function testConcurrency() {
  console.log('Testing Concurrency (limit 1)...');
  const req1 = sendChatRequest('Hello 1');
  const req2 = sendChatRequest('Hello 2');
  
  const [res1, res2] = await Promise.all([req1, req2]);
  console.log(`Req 1: HTTP ${res1.status}`);
  console.log(`Req 2: HTTP ${res2.status} - Body: ${res2.body}`);
}

async function testRPM() {
  console.log('\\Testing RPM (limit 10 for guest)...');
  for (let i = 1; i <= 10; i++) {
    const res = await sendChatRequest(`Test message ${i}`);
    console.log(`Request ${i}: HTTP ${res.status}`);
    if (res.status === 429) {
      console.log(`Blocked at request ${i}: ${res.body}`);
      break;
    }
  }
}

async function run() {
  await testConcurrency();
  console.log('Waiting 12s to clear concurrency lock...');
  await new Promise(r => setTimeout(r, 12000));
  await testRPM();
}

run();

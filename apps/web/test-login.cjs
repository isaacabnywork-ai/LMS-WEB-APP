const http = require('http');

async function test() {
  // 1. Get CSRF Token
  const csrfRes = await fetch('http://localhost:3000/api/auth/csrf');
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  const cookies = csrfRes.headers.get('set-cookie').split(';')[0];
  console.log('CSRF Token:', csrfToken);

  // 2. Login
  const loginRes = await fetch('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookies
    },
    body: new URLSearchParams({
      csrfToken,
      email: 'teacher@edunova.com',
      password: 'password123',
      json: 'true'
    })
  });
  
  const loginData = await loginRes.json();
  console.log('Login Response:', loginData);
  const sessionCookie = loginRes.headers.get('set-cookie');
  console.log('Session Cookie:', sessionCookie ? 'YES' : 'NO');

  // 3. Access Dashboard
  const dashRes = await fetch('http://localhost:3000/teacher/dashboard', {
    headers: {
      'Cookie': sessionCookie
    }
  });
  console.log('Dashboard Status:', dashRes.status);
}

test().catch(console.error);

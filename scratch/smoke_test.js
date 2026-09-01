/**
 * Automated Smoke Test Suite
 * Tests server health, public endpoints, authentication, sensitive data filtering, rate limiting, and security headers.
 */
const http = require('http');
const app = require('../server');

const runTests = async () => {
  console.log('🚀 Starting Automated Smoke Test Suite...\n');

  // Start test server on dynamic port
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, extraInfo = '') => {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${extraInfo}`);
      failed++;
    }
  };

  const fetchJson = async (endpoint, options = {}) => {
    const res = await fetch(`${baseUrl}${endpoint}`, options);
    const headers = Object.fromEntries(res.headers.entries());
    let body = null;
    try {
      body = await res.json();
    } catch (e) {
      body = await res.text();
    }
    return { status: res.status, headers, body };
  };

  try {
    // Test 1: Health Check Endpoint
    console.log('📦 1. Health & Server Status');
    const health = await fetchJson('/api/health');
    assert(health.status === 200, 'Health check returns 200 OK');
    assert(health.body?.status === 'ok', 'Health response contains status: "ok"');

    // Test 2: Security Headers
    console.log('\n🔒 2. Security Headers');
    assert(health.headers['x-content-type-options'] === 'nosniff', 'X-Content-Type-Options is nosniff');
    assert(Boolean(health.headers['content-security-policy']), 'Content-Security-Policy header is active');

    // Test 3: Public Settings Filtering (SEC-05 verification)
    console.log('\n🛡️ 3. Public Settings Filtering (SEC-05)');
    const settings = await fetchJson('/api/settings');
    assert(settings.status === 200, 'Public settings returns 200 OK');
    assert(settings.body?.success === true, 'Settings success is true');
    assert(!settings.body?.data?.cloudinary_api_secret, 'cloudinary_api_secret is NOT exposed in public settings');
    assert(!settings.body?.data?.smtp_pass, 'smtp_pass is NOT exposed in public settings');
    assert(!settings.body?.data?.jwt_secret, 'jwt_secret is NOT exposed in public settings');

    // Test 4: Public Portfolio Endpoints
    console.log('\n🎨 4. Public Portfolio & Content Endpoints');
    const projects = await fetchJson('/api/projects');
    assert(projects.status === 200, 'Projects endpoint returns 200 OK');
    assert(Array.isArray(projects.body?.data), 'Projects data is an array');

    const homepage = await fetchJson('/api/homepage');
    assert(homepage.status === 200, 'Consolidated Homepage endpoint returns 200 OK');
    assert(Boolean(homepage.body?.data?.settings), 'Homepage contains settings data');

    const services = await fetchJson('/api/services');
    assert(services.status === 200, 'Services endpoint returns 200 OK');

    const packages = await fetchJson('/api/packages');
    assert(packages.status === 200, 'Packages endpoint returns 200 OK');

    const testimonials = await fetchJson('/api/testimonials');
    assert(testimonials.status === 200, 'Testimonials endpoint returns 200 OK');

    const faqs = await fetchJson('/api/faqs');
    assert(faqs.status === 200, 'FAQs endpoint returns 200 OK');

    const brands = await fetchJson('/api/brands');
    assert(brands.status === 200, 'Brands endpoint returns 200 OK');

    // Test 5: Authentication & Backdoor Removal (SEC-01 & SEC-04)
    console.log('\n🔑 5. Authentication & Security Fix Validation');
    const fakeAuth = await fetchJson('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'fake@attacker.com', password: 'wrongpassword' }),
    });
    assert(fakeAuth.status === 401, 'Invalid credentials properly rejected with 401 Unauthorized');

    // Backdoor check: random email with admin123456 must fail
    const backdoorTest = await fetchJson('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'unknown_attacker@domain.com', password: 'admin123456' }),
    });
    assert(backdoorTest.status === 401, 'SEC-01 Backdoor is successfully neutralized');

    // Admin protected endpoint without token
    const meWithoutToken = await fetchJson('/api/auth/me');
    assert(meWithoutToken.status === 401, 'Protected /api/auth/me rejects unauthenticated request (401)');

    // Fake forged token test
    const meWithForgedToken = await fetchJson('/api/auth/me', {
      headers: { Authorization: 'Bearer forged_fake_token_12345' },
    });
    assert(meWithForgedToken.status === 401, 'Forged JWT token rejected with 401');

    console.log('\n======================================================');
    console.log(`📊 Smoke Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('Smoke test runtime failure:', err);
    failed++;
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();

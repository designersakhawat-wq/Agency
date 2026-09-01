/**
 * Distributed Cache Engine Benchmark & Validation Test
 */
const http = require('http');
const app = require('../server');
const cacheService = require('../src/services/cacheService');

const runCacheBenchmark = async () => {
  console.log('⚡ Starting Distributed Cache Engine Benchmark & Test...\n');

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
    const t0 = performance.now();
    const res = await fetch(`${baseUrl}${endpoint}`, options);
    const duration = performance.now() - t0;
    const body = await res.json();
    return { status: res.status, body, duration };
  };

  try {
    // 1. Initial Cold Fetch (Cache Miss)
    console.log('❄️ 1. Cold Fetch (Cache Miss Baseline)');
    await cacheService.flushAll();
    const coldReq = await fetchJson('/api/homepage');
    assert(coldReq.status === 200, 'Cold fetch succeeds with 200 OK');
    console.log(`     Cold Fetch Duration: ${coldReq.duration.toFixed(2)}ms`);

    // 2. Warm Fetches (Cache Hits)
    console.log('\n🔥 2. Warm Fetches (L1/L2 Cache Hits)');
    const warmDurations = [];
    for (let i = 0; i < 20; i++) {
      const warmReq = await fetchJson('/api/homepage');
      warmDurations.push(warmReq.duration);
    }
    const avgWarmDuration = warmDurations.reduce((a, b) => a + b, 0) / warmDurations.length;
    console.log(`     Average Warm Fetch Duration: ${avgWarmDuration.toFixed(2)}ms (over 20 requests)`);
    assert(avgWarmDuration < coldReq.duration, `Cache hit speedup achieved (${avgWarmDuration.toFixed(2)}ms vs ${coldReq.duration.toFixed(2)}ms)`);

    // 3. Singleflight Mutex / Cache Stampede Prevention Test
    console.log('\n🛡️ 3. Singleflight Mutex / Stampede Prevention Test');
    await cacheService.flushAll();
    let dbFetchCount = 0;
    const concurrentRequests = Array.from({ length: 25 }, () =>
      cacheService.wrap('test:stampede:key', async () => {
        dbFetchCount++;
        await new Promise((r) => setTimeout(r, 50));
        return { message: 'database_result', timestamp: Date.now() };
      })
    );
    const results = await Promise.all(concurrentRequests);
    assert(dbFetchCount === 1, `Singleflight executed only 1 DB query for 25 concurrent callers (Count = ${dbFetchCount})`);
    assert(results.every((r) => r.message === 'database_result'), 'All 25 callers received identical valid data');

    // 4. Tag-Based Invalidation Test
    console.log('\n🏷️ 4. Tag-Based Cache Invalidation Test');
    await cacheService.set('test:tagged:project1', { name: 'P1' }, 300, ['projects', 'homepage']);
    await cacheService.set('test:tagged:project2', { name: 'P2' }, 300, ['projects']);
    await cacheService.set('test:tagged:other', { name: 'O1' }, 300, ['other']);

    assert((await cacheService.get('test:tagged:project1')) !== null, 'Tagged key 1 exists in cache before invalidation');
    await cacheService.invalidateTags(['projects']);
    assert((await cacheService.get('test:tagged:project1')) === null, 'Tagged key 1 was evicted after tag invalidation');
    assert((await cacheService.get('test:tagged:project2')) === null, 'Tagged key 2 was evicted after tag invalidation');
    assert((await cacheService.get('test:tagged:other')) !== null, 'Untagged key was preserved');

    // 5. Cache Diagnostics & Health Telemetry
    console.log('\n📊 5. Cache Diagnostics & Telemetry');
    const cacheHealth = await fetchJson('/api/health/cache');
    assert(cacheHealth.status === 200, 'Cache diagnostics endpoint returns 200 OK');
    assert(Boolean(cacheHealth.body?.cache?.status), `Cache mode: ${cacheHealth.body?.cache?.status}`);
    assert(cacheHealth.body?.cache?.metrics?.totalRequests > 0, `Recorded total cache requests: ${cacheHealth.body?.cache?.metrics?.totalRequests}`);
    console.log(`     Reported Hit Ratio: ${cacheHealth.body?.cache?.metrics?.hitRatio}`);

    console.log('\n======================================================');
    console.log(`🎯 Cache Benchmark Summary: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('Cache benchmark error:', err);
    failed++;
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runCacheBenchmark();

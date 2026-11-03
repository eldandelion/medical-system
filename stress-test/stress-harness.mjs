import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load answers template
const answersTemplate = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'answers-template.json'), 'utf8')
);

// High-performance HTTP agent
const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 2000,
  maxFreeSockets: 500,
  timeout: 30000,
});

/**
 * Make an HTTP request and track microsecond-precision latency
 */
export function httpRequest({
  host = 'localhost',
  port = 8080,
  path = '/',
  method = 'GET',
  headers = {},
  body = null,
  timeout = 20000,
}) {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    const payload = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;

    const reqHeaders = {
      ...headers,
      ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
    };

    const req = http.request(
      {
        host,
        port,
        path,
        method,
        headers: reqHeaders,
        agent,
        timeout,
      },
      (res) => {
        let responseData = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        res.on('end', () => {
          const end = process.hrtime.bigint();
          const latencyMs = Number(end - start) / 1_000_000;
          resolve({
            statusCode: res.statusCode,
            latencyMs,
            data: responseData,
            error: null,
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('Request timeout'));
    });

    req.on('error', (err) => {
      const end = process.hrtime.bigint();
      const latencyMs = Number(end - start) / 1_000_000;
      resolve({
        statusCode: 0,
        latencyMs,
        data: null,
        error: err.message,
      });
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

/**
 * Calculate statistical percentiles
 */
export function calculateStats(latencies, durationSec) {
  if (latencies.length === 0) {
    return {
      count: 0,
      min: 0,
      max: 0,
      avg: 0,
      p50: 0,
      p90: 0,
      p95: 0,
      p99: 0,
      rps: 0,
    };
  }

  const sorted = [...latencies].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const avg = sum / sorted.length;

  const getPercentile = (p) => {
    const idx = Math.min(Math.floor((p / 100) * sorted.length), sorted.length - 1);
    return sorted[idx];
  };

  return {
    count: sorted.length,
    min: Math.round(sorted[0] * 100) / 100,
    max: Math.round(sorted[sorted.length - 1] * 100) / 100,
    avg: Math.round(avg * 100) / 100,
    p50: Math.round(getPercentile(50) * 100) / 100,
    p90: Math.round(getPercentile(90) * 100) / 100,
    p95: Math.round(getPercentile(95) * 100) / 100,
    p99: Math.round(getPercentile(99) * 100) / 100,
    rps: Math.round((sorted.length / durationSec) * 100) / 100,
  };
}

/**
 * Run a multi-VU stress session
 */
export async function runStressTest({
  name = 'Stress Test',
  vus = 10,
  durationSec = 15,
  scenario = 'journey', // 'journey' | 'login' | 'catalog' | 'draft' | 'submit'
  host = 'localhost',
  port = 8080,
  pacingMs = 50,
}) {
  console.log(`\n======================================================`);
  console.log(` Starting: ${name}`);
  console.log(` Concurrency: ${vus} VUs | Duration: ${durationSec}s | Scenario: ${scenario}`);
  console.log(`======================================================`);

  const startTime = Date.now();
  const endTime = startTime + durationSec * 1000;

  const results = {
    totalRequests: 0,
    success2xx: 0,
    clientError4xx: 0,
    serverError5xx: 0,
    networkErrors: 0,
    latencies: [],
    endpoints: {},
  };

  function recordMetric(endpointName, res) {
    results.totalRequests++;
    results.latencies.push(res.latencyMs);

    if (!results.endpoints[endpointName]) {
      results.endpoints[endpointName] = {
        count: 0,
        success: 0,
        error4xx: 0,
        error5xx: 0,
        netError: 0,
        latencies: [],
      };
    }

    const ep = results.endpoints[endpointName];
    ep.count++;
    ep.latencies.push(res.latencyMs);

    if (res.error) {
      results.networkErrors++;
      ep.netError++;
    } else if (res.statusCode >= 200 && res.statusCode < 300) {
      results.success2xx++;
      ep.success++;
    } else if (res.statusCode >= 400 && res.statusCode < 500) {
      results.clientError4xx++;
      ep.error4xx++;
    } else if (res.statusCode >= 500) {
      results.serverError5xx++;
      ep.error5xx++;
    }
  }

  // Pre-seed token map or pre-authenticate
  const tokenCache = new Map();

  async function getStudentToken(studentId) {
    if (tokenCache.has(studentId)) {
      return tokenCache.get(studentId);
    }
    const studentNum = `TEST_S${studentId}`;
    const res = await httpRequest({
      host,
      port,
      path: '/api/auth/login',
      method: 'POST',
      body: { studentNumber: studentNum, password: '123456' },
    });
    if (res.statusCode === 200) {
      try {
        const json = JSON.parse(res.data);
        tokenCache.set(studentId, json.token);
        return json.token;
      } catch {
        return null;
      }
    }
    return null;
  }

  // Virtual User worker loop
  async function runVUWorker(vuIndex) {
    // Map VU to one of our 500 seeded students (2001 - 2500)
    const studentId = 2001 + (vuIndex % 500);
    const studentNum = `TEST_S${studentId}`;

    while (Date.now() < endTime) {
      if (scenario === 'login') {
        // High-density login stress
        const res = await httpRequest({
          host,
          port,
          path: '/api/auth/login',
          method: 'POST',
          body: { studentNumber: studentNum, password: '123456' },
        });
        recordMetric('POST /api/auth/login', res);
      } else if (scenario === 'catalog') {
        // High-density read stress
        const token = await getStudentToken(studentId);
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res1 = await httpRequest({
          host,
          port,
          path: '/api/scales',
          method: 'GET',
          headers,
        });
        recordMetric('GET /api/scales', res1);

        const res2 = await httpRequest({
          host,
          port,
          path: '/api/scales/comprehensive_student_intake_survey',
          method: 'GET',
          headers,
        });
        recordMetric('GET /api/scales/detail (377 Qs)', res2);
      } else if (scenario === 'draft') {
        // High-frequency draft write stress
        const token = await getStudentToken(studentId);
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await httpRequest({
          host,
          port,
          path: '/api/scales/comprehensive_student_intake_survey/draft',
          method: 'PUT',
          headers,
          body: {
            answers: { q1: 1, q2: 2, q3: Math.floor(Math.random() * 4) },
            updatedAt: Date.now(),
          },
        });
        recordMetric('PUT /api/scales/{code}/draft', res);
      } else {
        // Full User Intake Journey
        // 1. Login
        const loginRes = await httpRequest({
          host,
          port,
          path: '/api/auth/login',
          method: 'POST',
          body: { studentNumber: studentNum, password: '123456' },
        });
        recordMetric('1. POST /api/auth/login', loginRes);

        let token = null;
        if (loginRes.statusCode === 200) {
          try {
            token = JSON.parse(loginRes.data).token;
          } catch {}
        }
        if (!token) {
          token = await getStudentToken(studentId);
        }
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

        // 2. Profile
        const profileRes = await httpRequest({
          host,
          port,
          path: '/api/students/me/profile',
          method: 'GET',
          headers: authHeaders,
        });
        recordMetric('2. GET /api/students/me/profile', profileRes);

        // 3. Scales catalog
        const scalesRes = await httpRequest({
          host,
          port,
          path: '/api/scales',
          method: 'GET',
          headers: authHeaders,
        });
        recordMetric('3. GET /api/scales', scalesRes);

        // 4. Survey details (heavy 100KB payload)
        const detailRes = await httpRequest({
          host,
          port,
          path: '/api/scales/comprehensive_student_intake_survey',
          method: 'GET',
          headers: authHeaders,
        });
        recordMetric('4. GET /api/scales/{code} (377 Qs)', detailRes);

        // 5. Draft save
        const draftRes = await httpRequest({
          host,
          port,
          path: '/api/scales/comprehensive_student_intake_survey/draft',
          method: 'PUT',
          headers: authHeaders,
          body: {
            answers: { demo_name: `学生${studentId}`, G1: 1, phq9_1: 0 },
            updatedAt: Date.now(),
          },
        });
        recordMetric('5. PUT /api/scales/{code}/draft', draftRes);

        // 6. Submit survey
        const answers = { ...answersTemplate };
        answers.demo_student_number = studentNum;
        answers.demo_name = `压测学生${studentId}`;
        answers.demo_phone = `199${String(studentId).padStart(8, '0')}`;
        answers.demo_id_card = `11010120050101${String(studentId).padStart(4, '0')}`;

        const submitRes = await httpRequest({
          host,
          port,
          path: '/api/scales/comprehensive_student_intake_survey/submit',
          method: 'POST',
          headers: authHeaders,
          body: { answers },
        });
        recordMetric('6. POST /api/scales/{code}/submit', submitRes);

        // 7. Referral status query
        const refRes = await httpRequest({
          host,
          port,
          path: '/api/referrals',
          method: 'GET',
          headers: authHeaders,
        });
        recordMetric('7. GET /api/referrals', refRes);
      }

      // Small pacing pause between iterations
      if (pacingMs > 0) {
        await new Promise((r) => setTimeout(r, pacingMs));
      }
    }
  }

  // Launch all VUs concurrently
  const workers = [];
  for (let i = 0; i < vus; i++) {
    workers.push(runVUWorker(i));
  }
  await Promise.all(workers);

  const actualDurationSec = (Date.now() - startTime) / 1000;
  const overallStats = calculateStats(results.latencies, actualDurationSec);

  const endpointStats = {};
  for (const [epName, epData] of Object.entries(results.endpoints)) {
    endpointStats[epName] = {
      ...calculateStats(epData.latencies, actualDurationSec),
      success: epData.success,
      error4xx: epData.error4xx,
      error5xx: epData.error5xx,
      netError: epData.netError,
    };
  }

  const summary = {
    name,
    vus,
    durationSec: Math.round(actualDurationSec * 10) / 10,
    totalRequests: results.totalRequests,
    success2xx: results.success2xx,
    clientError4xx: results.clientError4xx,
    serverError5xx: results.serverError5xx,
    networkErrors: results.networkErrors,
    successRate:
      results.totalRequests > 0
        ? Math.round((results.success2xx / results.totalRequests) * 10000) / 100
        : 0,
    overall: overallStats,
    endpoints: endpointStats,
  };

  // Print Summary Table
  console.log(`\n--- [Results: ${name}] ---`);
  console.log(`Total Requests:  ${summary.totalRequests}`);
  console.log(`Throughput:      ${summary.overall.rps} req/sec`);
  console.log(
    `Success Rate:    ${summary.successRate}% (2xx: ${summary.success2xx}, 4xx: ${summary.clientError4xx}, 5xx: ${summary.serverError5xx}, NetErr: ${summary.networkErrors})`
  );
  console.log(
    `Latencies (ms):  p50: ${summary.overall.p50}ms | p90: ${summary.overall.p90}ms | p95: ${summary.overall.p95}ms | p99: ${summary.overall.p99}ms | Max: ${summary.overall.max}ms`
  );

  console.log(`\nEndpoint Breakdown:`);
  console.table(
    Object.entries(endpointStats).map(([ep, s]) => ({
      Endpoint: ep,
      Reqs: s.count,
      Success: s.success,
      '5xx': s.error5xx,
      RPS: s.rps,
      'p50 (ms)': s.p50,
      'p95 (ms)': s.p95,
      'p99 (ms)': s.p99,
      'Max (ms)': s.max,
    }))
  );

  return summary;
}

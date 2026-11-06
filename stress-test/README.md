# Mobile Intake Stress Testing Suite

This directory contains the automated end-to-end load and stress testing suite for the University Medical System's mobile intake application (`http://localhost:8080/`).

---

## 1. Directory Structure

```text
stress-test/
├── seed-students.mjs       # Seeds 500 test student accounts into MySQL (IDs 2001-2500)
├── answers-template.json   # Valid 377-question answers dictionary for the intake survey
├── stress-harness.mjs      # Core asynchronous load harness with microsecond timing & percentiles
├── run-all-tests.mjs       # Automated 5-phase test orchestrator (10 to 500 VUs)
├── stress-test-results.json# Saved empirical benchmark results
└── README.md               # Documentation and execution guide
```

---

## 2. Prerequisites

- **Node.js**: v18+ (tested on Node v25 with native `http.Agent` connection pooling).
- **Backend**: Spring Boot server running on `http://localhost:8080/`.
- **Database**: MySQL running on port 3307 (`medical_db`).

---

## 3. How to Run

### Step 1: Seed Test Students into MySQL
Seeds 500 active test students (`TEST_S2001` to `TEST_S2500`, password: `123456`) into the MySQL container:
```bash
node stress-test/seed-students.mjs
```

### Step 2: Run All 5 Stress Test Phases
Executes the full automated benchmark suite:
```bash
node stress-test/run-all-tests.mjs
```
This runs 5 consecutive load stages:
1. **Phase 1: Smoke Test** (10 concurrent students, 10s)
2. **Phase 2: Baseline Load** (50 concurrent students, 15s)
3. **Phase 3: High Concurrency** (150 concurrent students, 20s)
4. **Phase 4: Peak Stress** (300 concurrent students, 20s)
5. **Phase 5: Spike Surge** (500 concurrent students, 15s)

Results are automatically saved to `stress-test/stress-test-results.json`.

---

## 4. Running Custom Single Scenarios

You can also run standalone scenarios using `stress-harness.mjs` directly in Node:

```javascript
import { runStressTest } from './stress-harness.mjs';

// Test 200 concurrent students running the full intake journey for 30s
await runStressTest({
  name: 'Custom 200 VU Run',
  vus: 200,
  durationSec: 30,
  scenario: 'journey', // 'journey' | 'login' | 'catalog' | 'draft' | 'submit'
  pacingMs: 30,
});
```

---

## 5. Backend Configuration Requirements

In `backend/src/main/resources/application.properties`, the connection and thread pools must be configured:

```properties
# HikariCP Connection Pool (Scaled from default 10 to 60)
spring.datasource.hikari.maximum-pool-size=60
spring.datasource.hikari.minimum-idle=20
spring.datasource.hikari.connection-timeout=15000

# Tomcat Worker Pool (Scaled from default 200 to 400)
server.tomcat.threads.max=400
server.tomcat.threads.min-spare=50
server.tomcat.accept-count=1000
server.tomcat.max-connections=10000
```

And in MySQL:
```sql
SET GLOBAL max_connections = 500;
```

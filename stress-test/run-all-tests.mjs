import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runStressTest } from './stress-harness.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log(`========================================================================`);
  console.log(` UNIVERSITY MEDICAL SYSTEM - MOBILE INTAKE STRESS TEST SUITE`);
  console.log(` Target: http://localhost:8080/`);
  console.log(` Node Runtime: ${process.version} | Timestamp: ${new Date().toISOString()}`);
  console.log(`========================================================================\n`);

  const report = {
    timestamp: new Date().toISOString(),
    phases: [],
  };

  // --------------------------------------------------------------------------
  // Phase 1: Smoke Test (10 VUs)
  // --------------------------------------------------------------------------
  const p1 = await runStressTest({
    name: 'Phase 1: Smoke Test (Functional Verification)',
    vus: 10,
    durationSec: 10,
    scenario: 'journey',
    pacingMs: 100,
  });
  report.phases.push(p1);

  // Short cooldown
  await new Promise((r) => setTimeout(r, 2000));

  // --------------------------------------------------------------------------
  // Phase 2: Baseline Load (50 Concurrent Students)
  // --------------------------------------------------------------------------
  const p2 = await runStressTest({
    name: 'Phase 2: Baseline Load (50 Concurrent Students)',
    vus: 50,
    durationSec: 15,
    scenario: 'journey',
    pacingMs: 50,
  });
  report.phases.push(p2);

  await new Promise((r) => setTimeout(r, 2000));

  // --------------------------------------------------------------------------
  // Phase 3: High Concurrency Load (150 Concurrent Students)
  // --------------------------------------------------------------------------
  const p3 = await runStressTest({
    name: 'Phase 3: High Concurrency Stress (150 Concurrent Students)',
    vus: 150,
    durationSec: 20,
    scenario: 'journey',
    pacingMs: 30,
  });
  report.phases.push(p3);

  await new Promise((r) => setTimeout(r, 3000));

  // --------------------------------------------------------------------------
  // Phase 4: Peak Stress (300 Concurrent Students)
  // --------------------------------------------------------------------------
  const p4 = await runStressTest({
    name: 'Phase 4: Peak Capacity Stress (300 Concurrent Students)',
    vus: 300,
    durationSec: 20,
    scenario: 'journey',
    pacingMs: 20,
  });
  report.phases.push(p4);

  await new Promise((r) => setTimeout(r, 3000));

  // --------------------------------------------------------------------------
  // Phase 5: Spike Test (500 Concurrent Students Influx)
  // --------------------------------------------------------------------------
  const p5 = await runStressTest({
    name: 'Phase 5: Spike Surge Test (500 Concurrent Students)',
    vus: 500,
    durationSec: 15,
    scenario: 'journey',
    pacingMs: 10,
  });
  report.phases.push(p5);

  // Save JSON report locally
  fs.writeFileSync(
    path.join(__dirname, 'stress-test-results.json'),
    JSON.stringify(report, null, 2)
  );

  console.log(`\n========================================================================`);
  console.log(` ALL PHASES COMPLETE! Results saved to stress-test/stress-test-results.json`);
  console.log(`========================================================================\n`);
}

main().catch((err) => {
  console.error('Stress test suite encountered an unhandled exception:', err);
  process.exit(1);
});

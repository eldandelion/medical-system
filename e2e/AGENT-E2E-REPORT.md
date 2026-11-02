# Agent-driven local E2E validation — 2026-11-02

## Verdict: partial browser coverage; HTTP regressions passed

An agent operated installed Chrome through Puppeteer against a disposable H2 backend and the real mobile UI. No mocks intercepted API responses; browser requests were restricted to the local mobile origin. Teacher and student used separate browser contexts and real password login. No remote environment, real patient dataset, installation, or deployment was used.

This is **not** acceptance of the complete multi-role browser journey. The complete 377-question UI submission, desktop high-risk/referral creation, doctor diagnosis editor and browser-level unrelated-doctor access were not exercised. No screenshots are published; the evidence below is sanitized assertion output, reproducible scripts, and regression tests.

## Browser assertions

`e2e/browser-local.cjs` completed four assertions:

1. Teacher logs in through rendered Material fields; real login response is HTTP 200.
2. Teacher selects one student and dispatches through the UI; HTTP 201 reports **one newly created assignment**, not an idempotent success. A success notification renders.
3. Student logs in using a separate browser context.
4. Student opens the questionnaire, edits the first rendered answer and advances; polling the real draft endpoint confirms the changed value persisted.

Synthetic fixture labels are already defined by the demo initializer. The browser suite requires a fresh disposable database; a repeated dispatch with `assignedCount: 0` intentionally fails. Initial harness attempts needed selector adjustments because Material buttons include icon text and React sets some custom-element properties rather than attributes. These were automation issues, not accepted test passes.

## Live HTTP suite and defect found

The first local `node e2e/run-e2e.mjs <local-backend>` returned **35 PASS / 3 FAIL / 0 SKIP**. The assigned doctor's diagnosis write returned HTTP 500; propagation checks consequently failed.

Root cause: with `spring.jpa.open-in-view=false`, `StudentProfileController.updateHealthProfile` loaded a profile outside a transaction. Saving the detached entity attempted to merge the lazy `riskFlags` collection and raised `LazyInitializationException`. The earlier authorization integration test had an enclosing test transaction and therefore masked this production-shaped failure.

Fix: make the complete scoped read/update method transactional. A new integration test explicitly uses `Propagation.NOT_SUPPORTED` around its caller and performs repeated updates without an enclosing test transaction. The endpoint retains the same clinical visibility check.

After the fix, the HTTP suite returned **38 PASS / 0 FAIL / 0 SKIP**. Two additional checks were then added: login as a second, unrelated doctor and reject their diagnosis overwrite with HTTP 403. Existing student referral-detail and high-risk-list assertions compare the diagnosis with the authorized doctor's value **after** the rejected overwrite, verifying no unauthorized mutation. This extended rerun returned **40 PASS / 0 FAIL / 0 SKIP**.

The extended rerun reused the same database: repeat submissions can be idempotent and are **not additional fresh-scoring evidence**. Notification coverage retains the pre-existing soft-success fallback. API-only diagnosis/propagation checks are not browser checks.

## Developer regression checks

- `cd backend && ./mvnw -o test`: **377 tests, zero failures/errors/skips**.
- Focused `ClinicalAuthorizationIntegrationTest`: passed, including the non-enclosing-transaction regression.
- Node syntax checks for the browser harness, local proxy and HTTP runner: passed.
- No frontend/mobile production source changed. Their unit suites/builds were not rerun in this task.

## Reproduction

Use existing dependencies and Chrome; the scripts never install or download them. Start only against a disposable database. Do **not** reuse an existing database with demo seeding enabled.

Backend (from `backend/`):

```sh
./mvnw -o spring-boot:run '-Dspring-boot.run.arguments=--server.address=127.0.0.1 --server.port=18080 --spring.datasource.url=jdbc:h2:mem:browser_e2e;NON_KEYWORDS=YEAR --spring.datasource.driver-class-name=org.h2.Driver --spring.datasource.username=sa --spring.datasource.password= --spring.jpa.database-platform=org.hibernate.dialect.H2Dialect --spring.jpa.hibernate.ddl-auto=create-drop --SEED_DEMO_DATA=true --spring.mail.host= --storage.s3.endpoint-internal=http://127.0.0.1:19000 --storage.s3.endpoint-external=http://127.0.0.1:19000'
```

Wait for **`Initialized Colleges, Majors, Students, Referrals, and Assessments into the database.`**, not just Tomcat listening: startup seeding runs after the listening message. Running login before initialization finishes can yield a misleading failure.

From the repository root, in a separate terminal:

```sh
node e2e/local-mobile-server.mjs
```

Then:

```sh
E2E_MOBILE_URL=http://127.0.0.1:13005 E2E_BACKEND_URL=http://127.0.0.1:18080 node e2e/browser-local.cjs
node e2e/run-e2e.mjs http://127.0.0.1:18080
```

`CHROME_PATH` optionally selects an already installed Chrome binary; the default is macOS Chrome. Browser targets must be explicit loopback HTTP addresses. The local proxy overrides mobile's development proxy without changing deployment configuration. Stop both services after use; stopping the backend destroys this in-memory database. Generated HTTP reports remain ignored and must not be committed.

## Outstanding acceptance work

- Complete questionnaire through browser and verify newly computed scores.
- Desktop staff high-risk/referral creation and doctor diagnosis editor.
- Browser-visible authorization denial and cross-role diagnosis display.
- Production MySQL behavior, concurrency, attachments and browser/mobile-device compatibility.

The PR remains draft; green HTTP and developer suites do not close these browser coverage gaps.

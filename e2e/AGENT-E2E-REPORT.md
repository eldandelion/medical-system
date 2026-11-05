# Agent-driven local E2E validation — 2026-11-02

## Verdict: full local browser coverage of the multi-role journey

An agent operated installed Chrome through Puppeteer against a disposable H2 backend, the real mobile UI and the real desktop UI. No mocks intercepted API responses; browser requests were restricted to explicit loopback origins. Teacher, student, assigned doctor and unrelated doctor used separate browser contexts and real password logins. No remote environment, real patient dataset, installation, or deployment was used. No screenshots are published; the evidence is sanitized assertion output, reproducible scripts, and regression tests.

## Complete browser journey (2026-11-02, single fresh backend lifecycle)

Environment: fresh in-memory H2 (`create-drop`, demo seeding on, mail disabled, S3 pointed at an unused loopback address), loopback-only backend 18080, mobile UI 13005, desktop UI 13000 with `/medical-system/api` proxied to the backend, installed headless Chrome via Puppeteer, all data synthetic seed/demo data.

`e2e/browser-local.cjs` (mobile journeys):

1. Teacher logs in through rendered Material fields (HTTP 200).
2. Teacher dispatches the assessment to one student through the UI; HTTP 201 reports one newly created assignment (fresh-count assertion, not idempotent success).
3. Student logs in in a separate context; the first edited answer persists to the server-side draft.
4. All 377 questionnaire answers are entered through real browser controls and submitted; the server response reports the completed submission.

`e2e/browser-desktop.cjs` (desktop and cross-role journeys, same backend):

5. Teacher desktop login; the freshly browser-scored student appears in the desktop high-risk list.
6. Teacher creates a referral for that student through the desktop referral form (risk level selected with the UI buttons); POST `/api/referrals` returns 2xx and the created referral identifies the student.
7. Assigned doctor logs in on the desktop, opens the referral, switches to the psychometrics tab, types the SCID diagnosis into the editor and saves; the health-profile PUT returns 200 and the saved indicator renders.
8. Diagnosis persistence is verified server-side: after a fresh doctor login in the same browser, the reopened referral shows exactly the saved diagnosis text.
9. An unrelated doctor logging in does not see the referred student or the referral anywhere in his referral-management UI (browser-level denial, no mutation).
10. The referred student logs in on the mobile app in a separate context, opens the referral detail and sees the doctor-written diagnosis (cross-role display).

Every check passed in one uninterrupted run against one freshly created database; no assertion was relaxed to obtain the pass.

Automation notes (not product defects): React-controlled inputs required native-value typing (login overlay, SCID textarea); the desktop vite proxy needed a `/medical-system/api` rule because the desktop app is served under a base path; a leftover backend from an earlier attempt had a stale schema and was replaced by a fresh instance rather than treated as product behavior. One product behavior worth knowing: desktop login state lives in React memory, so a hard reload returns to the default (mock-token) student shell rather than restoring the doctor session; persistence evidence therefore uses a fresh re-login, which matches how server-side truth is defined.

## Earlier partial-browser evidence (same date)

The initial run covered teacher/student mobile logins, dispatch, draft persistence and the full 377-question submission against a then-fresh database, and found the detached-profile diagnosis bug fixed in commit `1a85a60` (transaction + non-enclosing-transaction regression test). Those checks are subsumed by the complete journey above.

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
node e2e/local-desktop-server.mjs
```

Then:

```sh
E2E_MOBILE_URL=http://127.0.0.1:13005 E2E_BACKEND_URL=http://127.0.0.1:18080 node e2e/browser-local.cjs
E2E_DESKTOP_URL=http://127.0.0.1:13000 E2E_BACKEND_URL=http://127.0.0.1:18080 E2E_MOBILE_URL=http://127.0.0.1:13005 node e2e/browser-desktop.cjs
node e2e/run-e2e.mjs http://127.0.0.1:18080
```

`CHROME_PATH` optionally selects an already installed Chrome binary; the default is macOS Chrome. Browser targets must be explicit loopback HTTP addresses. The local proxy overrides mobile's development proxy without changing deployment configuration. Stop both services after use; stopping the backend destroys this in-memory database. Generated HTTP reports remain ignored and must not be committed.

## Outstanding acceptance work

- Production MySQL behavior, concurrency, attachments and browser/mobile-device compatibility.

The PR remains draft; the complete local browser journey above does not replace production-environment acceptance.

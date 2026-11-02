
## Backend data initialization and clinical access

Demo initialization is **disabled by default**. An unset `SEED_DEMO_DATA`,
`false`, or any value other than `true` leaves existing application data untouched.
For a disposable demo database only, explicitly set `SEED_DEMO_DATA=true` in the
backend process environment. **This deletes existing application tables' data and
recreates synthetic fixtures on every startup. Never enable it for production or
any database containing real patient/student records.** Deployments that previously
relied on automatic demo accounts must opt in explicitly for disposable demos;
production account provisioning is a separate administrative task.

Clinical health-profile updates require a doctor, head counsellor, or system
administrator role **and** the existing student visibility policy. Doctors are
scoped to students with a referral destination assigned to them; head counsellors
and system administrators retain the global scope defined by that policy.
Other roles cannot update clinical diagnoses. This reuses the current policy,
including its historical-referral visibility; changing that policy to active-only
assignments requires a separate product decision.

Optional demographics projection runs after a successful assessment commit in a
separate transaction. A failed projection leaves the core submission committed and
the previous demographic profile unchanged; failures are logged without raw health
or identity values. There is no automatic retry or durable projection queue yet.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

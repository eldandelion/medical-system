---
name: start-local-dev
description: >
  Start, verify, and tear down the local development environment for the University Medical Screening System
  (MySQL 8, MinIO, Spring Boot backend, Vite web frontend, and optional mobile intake app). Use when the user
  asks to "start local dev", "spin up dev env", "boot backend and frontend", "run locally", "start servers",
  "check local ports", or troubleshoot local startup failures (missing env vars, JWT_SECRET, Docker/MySQL 3307,
  or MinIO buckets).
user-invokable: true
argument-hint: "[full|h2|mock|docker|mobile|status|stop]"
---

# Start Local Dev Environment

Orchestrate the local development stack for this monorepo (`backend/`, `frontend/`, `mobile/`, and Docker infrastructure in `docker-compose.yml`).

---

## 1. Pre-flight Check (Always Run First)

Check which ports are already bound before launching new processes so you do not start conflicting servers:

```bash
lsof -i :3000 -i :3001 -i :3005 -i :3307 -i :8080 -i :8082 -i :9000 -i :9001
```

| Service | Default Port | Instance 2 (`-2`) | Notes |
|---|---|---|---|
| Frontend (`frontend/`) | `3000` | `3001` | Served at `/medical-system/` (`frontend/vite.config.ts`) |
| Mobile Intake (`mobile/`) | `3005` | — | Proxies `/api` -> `http://localhost:8080` (`mobile/vite.config.ts`) |
| Backend (`backend/`) | `8080` | `8082` | Spring Boot 4.1 / Kotlin |
| MySQL 8 (`db` container) | `3307` (`127.0.0.1:3307->3306`) | `3307` | Schema `medical_db` |
| MinIO S3 (`minio` container) | `9000` (API), `9001` (Console) | `9000` / `9001` | Buckets `medical-attachments`, `medical-avatars` |

Also check whether root `.env` exists (never print secret values; only check key names if needed):

```bash
test -f .env && echo ".env present" || echo "No root .env"
```

---

## 2. Startup Modes — Choose Based on Intent

### Mode A: Standard Full-Stack (`full` — Recommended)
Runs **Docker MySQL + MinIO** plus **host Spring Boot** and **host Vite** via `scripts/dev.sh`.

#### Required Environment Variables
`backend/src/main/resources/application.properties` has **no defaults** for the following 4 properties; Spring Boot will fail on startup if any are unset or invalid:

| Variable | Local Docker Dev Value | Notes / Source |
|---|---|---|
| `SPRING_DATASOURCE_PASSWORD` | `rootpassword` | Matches `MYSQL_ROOT_PASSWORD` in `docker-compose.yml` |
| `STORAGE_S3_ACCESS_KEY` | `minioadmin` | Matches `MINIO_ROOT_USER` in `docker-compose.yml` |
| `STORAGE_S3_SECRET_KEY` | `miniopassword` | Matches `MINIO_ROOT_PASSWORD` in `docker-compose.yml` |
| `JWT_SECRET` | Random >= 48 bytes | Validated by `JwtService.kt` (`MINIMUM_SECRET_BYTES = 48`, cannot equal legacy committed secret) |

Optional dev flags:
- `SEED_DEMO_DATA=true` / `false`: In `DataInitializer.kt`, an unset flag defaults to seed-if-empty (`studentRepository.count() == 0L`). Leave `SEED_WIPE_ALL_TABLES` unset (`false`) unless resetting a disposable database (`<= 25` student rows).
- `SPRING_MAIL_HOST` (empty disables SMTP and uses `LoggingEmailSender`; see `.env.example` for QQ Mail SMTP).
- `ALIYUN_SMS_ENABLED=false` (default `false`).

#### Launch Command
If the vars above are not already in root `.env` (note `.env.example` only includes database/mail examples, not S3/JWT), generate `JWT_SECRET` and pass the required vars inline without modifying committed files:

```bash
export SPRING_DATASOURCE_PASSWORD=rootpassword
export STORAGE_S3_ACCESS_KEY=minioadmin
export STORAGE_S3_SECRET_KEY=miniopassword
export JWT_SECRET="$(openssl rand -base64 48)"
./scripts/dev.sh
```

Useful `scripts/dev.sh` flags:
- `./scripts/dev.sh -2` — Second instance (`BACKEND_PORT=8082`, `FRONTEND_PORT=3001`, shares Docker DB/MinIO).
- `./scripts/dev.sh --backend-only` — Only start Docker infra + Spring Boot.
- `./scripts/dev.sh --frontend-only` — Only start Docker infra check + Vite (`npm run dev`).
- `./scripts/dev.sh --db <name>` — Override MySQL database schema name (default `medical_db`).

If `scripts/dev.sh` stops on Docker connectivity (`docker info`), verify Docker Desktop is running and start infra manually first if needed:

```bash
docker compose -p medical-system up -d db minio minio-init
```

> **Agent Execution Note**: `./scripts/dev.sh`, `./mvnw spring-boot:run`, and `npm run dev` are long-running processes. Run them with `IsDaemon: true` and `WaitMsBeforeAsync: 500`. If Docker socket access or host port binding is blocked by the terminal sandbox, re-run only the specific command that requires host access with `BypassSandbox: true`.

---

### Mode B: Docker-Free Backend + Frontend (`h2`)
Use when Docker/MySQL is unavailable and you do not need persistent MySQL state or MinIO file uploads (`application-h2.properties` sets H2 `create-drop`, placeholder S3 keys, and dev `jwt.secret`).

1. Start backend with `h2` profile (`IsDaemon: true`):
   ```bash
   cd backend && ./mvnw spring-boot:run -Dspring-boot.run.profiles=h2
   ```
2. Start frontend (`IsDaemon: true`):
   ```bash
   cd frontend && npm run dev
   ```

---

### Mode C: Frontend-Only with MSW Mocks (`mock`)
Use for pure UI work without any backend or database (`frontend/src/main.tsx` activates MSW only when `VITE_ENABLE_MOCK=true`):

```bash
cd frontend && [ -d node_modules ] || npm install
cd frontend && VITE_ENABLE_MOCK=true npm run dev
```

---

### Mode D: Mobile Intake App (`mobile`)
`scripts/dev.sh` does **not** launch `mobile/`. Start it separately alongside a running backend on `:8080` (`IsDaemon: true`):

```bash
cd mobile && [ -d node_modules ] || npm install
cd mobile && npm run dev
```

---

### Mode E: Full Containerized Stack (`docker`)
Builds and runs `frontend` (`:3000`), `mobile` (`:3005`), `backend` (`:8080` internal), `db` (`:3307`), `minio` (`:9000`/`:9001`), and `minio-init`:

```bash
JWT_SECRET="$(openssl rand -base64 48)" docker compose -p medical-system up --build -d
```

---

## 3. Verification Checklist (Run Before Reporting Ready)

Wait until backend and frontend finish booting (Spring Boot + Maven compilation typically takes 10-30s on first run), then verify:

1. **Backend direct API check**:
   ```bash
   curl -sf http://localhost:8080/api/dictionaries/schools | head -c 200
   ```
2. **Frontend + Vite `/api` proxy end-to-end check** (Notice the `/medical-system/` base path!):
   ```bash
   curl -sf http://localhost:3000/medical-system/api/dictionaries/schools | head -c 200
   ```
3. **Frontend HTML root check**:
   ```bash
   curl -sfI http://localhost:3000/medical-system/ | head -n 5
   ```
4. **If Mobile (`:3005`) was started**:
   ```bash
   curl -sf http://localhost:3005/api/dictionaries/schools | head -c 200
   ```

Report the verified URLs to the user:
- **Web App**: `http://localhost:3000/medical-system/` (or `:3001/medical-system/` for `-2`)
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **Mobile Intake** (if started): `http://localhost:3005/`
- **MinIO Console** (if Docker infra running): `http://localhost:9001` (`minioadmin` / `miniopassword`)

---

## 4. Common Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Backend exits with `Could not resolve placeholder 'SPRING_DATASOURCE_PASSWORD'` or `'STORAGE_S3_ACCESS_KEY'` | Missing required env vars in shell / `.env` | Export `SPRING_DATASOURCE_PASSWORD=rootpassword`, `STORAGE_S3_ACCESS_KEY=minioadmin`, `STORAGE_S3_SECRET_KEY=miniopassword`, or use `-Dspring-boot.run.profiles=h2` |
| Backend exits with `jwt.secret is missing or empty` or `< 48 bytes` | `JWT_SECRET` unset or too short for HS384 (`JwtService.kt`) | Set `JWT_SECRET="$(openssl rand -base64 48)"` |
| `localhost:3000/` shows blank page or 404 | Vite `base` is `/medical-system/` (`frontend/vite.config.ts`) | Open `http://localhost:3000/medical-system/` |
| Frontend requests show old mock data or ignore backend | Stale MSW Service Worker or `VITE_ENABLE_MOCK=true` | Ensure `VITE_ENABLE_MOCK` is unset/`false`; `main.tsx` unregisters `mockServiceWorker.js` automatically on reload |
| Connection refused on `localhost:3307` | Docker Desktop stopped or `db` container not started | Start Docker Desktop and run `docker compose -p medical-system up -d db minio minio-init` |

---

## 5. Teardown (`stop`)

- **Daemon tasks started by agent**: Terminate via task management (`manage_task` `kill`) or stop local dev PIDs cleanly.
- **Keep DB/MinIO warm vs full stop**:
  - Stop only backend/frontend: terminate `./mvnw` / `vite` processes.
  - Stop Docker containers (preserves `db-data` and `minio-data` volumes):
    ```bash
    docker compose -p medical-system down
    ```

#!/usr/bin/env bash
set -eo pipefail

# Color formatting
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Load root .env if present (ignored by git)
if [ -f "${ROOT_DIR}/.env" ]; then
  set -a
  source "${ROOT_DIR}/.env"
  set +a
fi

BACKEND_PORT=8080
FRONTEND_PORT=3000
RUN_BACKEND=true
RUN_FRONTEND=true
DB_NAME="medical_db"

# Parse CLI arguments
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --instance|-i)
      if [[ "$2" == "2" ]]; then
        BACKEND_PORT=8082
        FRONTEND_PORT=3001
      elif [[ "$2" == "1" ]]; then
        BACKEND_PORT=8080
        FRONTEND_PORT=3000
      fi
      shift 2
      ;;
    -2)
      BACKEND_PORT=8082
      FRONTEND_PORT=3001
      shift
      ;;
    -1)
      BACKEND_PORT=8080
      FRONTEND_PORT=3000
      shift
      ;;
    --backend-port)
      BACKEND_PORT="$2"
      shift 2
      ;;
    --frontend-port)
      FRONTEND_PORT="$2"
      shift 2
      ;;
    --backend-only)
      RUN_FRONTEND=false
      shift
      ;;
    --frontend-only)
      RUN_BACKEND=false
      shift
      ;;
    --db)
      DB_NAME="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: ./scripts/dev.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --instance 1|2    Instance preset (1: BE=8080/FE=3000, 2: BE=8082/FE=3001)"
      echo "  -1                Shortcut for --instance 1"
      echo "  -2                Shortcut for --instance 2"
      echo "  --backend-port    Override backend port (default: 8080)"
      echo "  --frontend-port   Override frontend port (default: 3000)"
      echo "  --backend-only    Only start Spring Boot backend"
      echo "  --frontend-only   Only start Vite frontend"
      echo "  --db <name>       Database name (default: medical_db)"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Run './scripts/dev.sh --help' for available options."
      exit 1
      ;;
  esac
done

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}  🏥 Medical System Development Orchestrator           ${NC}"
echo -e "${BLUE}  Working Directory: ${CYAN}${ROOT_DIR}${NC}"
echo -e "${BLUE}  Backend Port:      ${GREEN}${BACKEND_PORT}${NC}"
echo -e "${BLUE}  Frontend Port:     ${GREEN}${FRONTEND_PORT}${NC}"
echo -e "${BLUE}  Database Schema:   ${GREEN}${DB_NAME}${NC}"
echo -e "${BLUE}======================================================${NC}"

# 1. Docker Pre-flight Checks
if ! command -v docker &> /dev/null; then
  echo -e "${RED}[ERROR] Docker command not found. Please install Docker to run the database & MinIO.${NC}"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo -e "${RED}[ERROR] Docker daemon is not running. Please start Docker Desktop first.${NC}"
  exit 1
fi

echo -e "${YELLOW}[1/4] Checking shared infrastructure (MySQL & MinIO)...${NC}"
cd "$ROOT_DIR"
if ! docker ps --format "{{.Names}}" | grep -q "medical-system-db" || ! docker ps --format "{{.Names}}" | grep -q "medical-system-minio"; then
  echo -e "${YELLOW}Starting db, minio, and minio-init containers...${NC}"
  docker compose -p medical-system up -d db minio minio-init
fi

echo -e "${YELLOW}[2/4] Verifying MySQL connection on port 3307...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0
until nc -z localhost 3307 >/dev/null 2>&1 || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
  echo "Waiting for MySQL on port 3307... ($((RETRY_COUNT+1))/$MAX_RETRIES)"
  sleep 1
  RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo -e "${RED}[ERROR] Timed out waiting for MySQL on port 3307.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ MySQL database is online and reachable.${NC}"

# PID tracking for clean teardown
BE_PID=""
FE_PID=""

cleanup() {
  # Avoid double trap execution
  trap - SIGINT SIGTERM EXIT
  echo -e "\n${YELLOW}Shutting down development servers...${NC}"
  
  if [[ -n "$BE_PID" ]] && kill -0 "$BE_PID" 2>/dev/null; then
    echo -e "Stopping Backend (PID: ${BE_PID})..."
    kill "$BE_PID" 2>/dev/null || true
  fi
  
  if [[ -n "$FE_PID" ]] && kill -0 "$FE_PID" 2>/dev/null; then
    echo -e "Stopping Frontend (PID: ${FE_PID})..."
    kill "$FE_PID" 2>/dev/null || true
  fi
  
  # Ensure any child processes spawned by maven or vite are also terminated
  kill -- -$$ 2>/dev/null || true
  echo -e "${GREEN}✓ All services stopped cleanly.${NC}"
}
trap cleanup SIGINT SIGTERM EXIT

# 2. Start Backend
if [ "$RUN_BACKEND" = true ]; then
  echo -e "${YELLOW}[3/4] Launching Spring Boot Backend on http://localhost:${BACKEND_PORT}...${NC}"
  cd "$ROOT_DIR/backend"
  SERVER_PORT="$BACKEND_PORT" \
  SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3307/${DB_NAME}?useSSL=false&allowPublicKeyRetrieval=true" \
  ./mvnw spring-boot:run &
  BE_PID=$!
fi

# 3. Start Frontend
if [ "$RUN_FRONTEND" = true ]; then
  echo -e "${YELLOW}[4/4] Launching Vite Frontend on http://localhost:${FRONTEND_PORT}/medical-system/...${NC}"
  cd "$ROOT_DIR/frontend"
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend node_modules...${NC}"
    npm install
  fi
  BACKEND_PORT="$BACKEND_PORT" ./node_modules/.bin/vite --port "$FRONTEND_PORT" --host 0.0.0.0 &
  FE_PID=$!
fi

echo -e "${GREEN}✓ Development environment initialized. Press Ctrl+C to stop.${NC}"

# Wait for background jobs
wait

#!/bin/bash

# ==============================================================================
# HRMS Enterprise - Microservices Multi-process Manager Script
# ==============================================================================
# This script manages launching, monitoring, and stopping all Spring Boot
# microservices concurrently.
# ==============================================================================

PROJECT_ROOT="$(pwd)"
LOG_DIR="$PROJECT_ROOT/backend/logs"
PID_FILE="$LOG_DIR/services.pids"

# Ordered list of services to launch
SERVICES=(
  "api-gateway"
  "auth-service"
  "employee-service"
  "attendance-service"
  "leave-service"
  "payroll-service"
  "claim-service"
  "loan-service"
  "performance-service"
  "recruitment-service"
  "asset-service"
  "notification-service"
  "offboarding-service"
  "travel-service"
  "training-service"
)

# Colors for output formatting
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

mkdir -p "$LOG_DIR"

start_services() {
  echo -e "${YELLOW}Starting all HRMS backend services...${NC}"
  
  if [ -f "$PID_FILE" ]; then
    echo -e "${RED}Warning: Pid file already exists. Checking if services are already running...${NC}"
    status_services
    echo -e "${YELLOW}Please stop them first using: ./start-all-services.sh stop${NC}"
    exit 1
  fi

  # Build/package all projects first to ensure latest changes are compiled
  echo -e "${YELLOW}Packaging parent modules with Maven... (Skipping tests)${NC}"
  cd "$PROJECT_ROOT/backend" || exit 1
  mvn clean package -DskipTests
  if [ $? -ne 0 ]; then
    echo -e "${RED}Maven build failed. Aborting startup.${NC}"
    exit 1
  fi

  touch "$PID_FILE"

  for service in "${SERVICES[@]}"; do
    echo -e "Launching ${GREEN}$service${NC}..."
    log_file="$LOG_DIR/${service}.log"
    
    # Run the Spring Boot app in the background and redirect output to a log file
    cd "$PROJECT_ROOT/backend/$service" || continue
    nohup mvn spring-boot:run > "$log_file" 2>&1 &
    PID=$!
    
    echo "$service:$PID" >> "$PID_FILE"
    echo -e "${GREEN}$service${NC} running in background (PID: $PID). Logs: backend/logs/${service}.log"
    # Brief pause to avoid CPU spike on database connections
    sleep 2
  done
  
  echo -e "${GREEN}All services successfully spawned!${NC}"
  echo -e "To view logs in real-time, run: ${YELLOW}tail -f backend/logs/<service-name>.log${NC}"
  echo -e "To check status, run: ${YELLOW}./start-all-services.sh status${NC}"
}

stop_services() {
  echo -e "${YELLOW}Stopping all running HRMS microservices...${NC}"
  if [ ! -f "$PID_FILE" ]; then
    echo -e "${RED}No active pid file found. Nothing to stop.${NC}"
    return
  fi

  while IFS= read -r line; do
    if [ -n "$line" ]; then
      service=$(echo "$line" | cut -d':' -f1)
      pid=$(echo "$line" | cut -d':' -f2)
      
      if ps -p "$pid" > /dev/null 2>&1; then
        echo -e "Stopping ${RED}$service${NC} (PID: $pid)..."
        kill "$pid"
        
        # Wait a bit and force kill if still running
        sleep 1
        if ps -p "$pid" > /dev/null 2>&1; then
          kill -9 "$pid"
        fi
      else
        echo -e "$service (PID: $pid) is already stopped."
      fi
    fi
  done < "$PID_FILE"

  rm -f "$PID_FILE"
  echo -e "${GREEN}All services stopped successfully.${NC}"
}

status_services() {
  echo -e "${YELLOW}HRMS Microservices Status Check:${NC}"
  echo "----------------------------------------"
  if [ ! -f "$PID_FILE" ]; then
    echo -e "${RED}No services appear to be running (No services.pids file found).${NC}"
    return
  fi

  while IFS= read -r line; do
    if [ -n "$line" ]; then
      service=$(echo "$line" | cut -d':' -f1)
      pid=$(echo "$line" | cut -d':' -f2)
      
      if ps -p "$pid" > /dev/null 2>&1; then
        echo -e "${GREEN}● $service${NC} is running (PID: $pid)"
      else
        echo -e "${RED}○ $service${NC} is offline/dead (PID: $pid)"
      fi
    fi
  done < "$PID_FILE"
  echo "----------------------------------------"
}

case "$1" in
  start)
    start_services
    ;;
  stop)
    stop_services
    ;;
  status)
    status_services
    ;;
  *)
    echo "Usage: $0 {start|stop|status}"
    exit 1
    ;;
esac

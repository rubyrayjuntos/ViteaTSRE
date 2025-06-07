
# ============================================================
# Papi Chispa — Makefile for Local Dev + Render Deployment
# ============================================================

# ====================
# GLOBAL VARIABLES
# ====================
FRONTEND_DIR = frontend
BACKEND_DIR = backend
FRONTEND_PORT = 5173
BACKEND_PORT = 8000

# ====================
# PHONY TARGETS
# ====================
.PHONY: dev-backend dev-frontend dev-up dev-down \
        build-frontend build-backend build-prod \
        deploy-frontend deploy-backend deploy \
        logs clean

# ====================
# SECTION 1 — DEV SERVER (LOCAL)
# Run locally in Cursor IDE or any dev environment
# ====================

# Start FastAPI backend locally (dev)
dev-backend:
	cd $(BACKEND_DIR) && \
	python -m venv venv && \
	source venv/bin/activate && \
	pip install -r requirements.txt && \
	uvicorn main:app --reload --port=$(BACKEND_PORT)

# Start Vite frontend locally (dev)
dev-frontend:
	cd $(FRONTEND_DIR) && \
	corepack enable && \
	pnpm install && \
	pnpm run dev -- --host

# Start both (manual terminal split recommended)
dev-up: dev-backend dev-frontend

# Stop both (placeholder for future enhancements)
dev-down:
	echo "Stop servers manually in terminal or Cursor IDE."

# ====================
# SECTION 2 — PROD SERVER (RENDER)
# Deploy via Render CLI
# ====================

# Build frontend for production
build-frontend:
	cd $(FRONTEND_DIR) && \
	corepack enable && \
	pnpm install && \
	pnpm run build

# Prepare backend (lint/test/install)
build-backend:
	cd $(BACKEND_DIR) && \
	pip install -r requirements.txt

# Build all production assets
build-prod: build-frontend build-backend

# Deploy frontend to Render
deploy-frontend: build-frontend
	render deploy --service papi-chispa-frontend --from-render-yaml

# Deploy backend to Render
deploy-backend: build-backend
	render deploy --service papi-chispa-backend --from-render-yaml

# Deploy both frontend and backend to Render
deploy: build-prod
	render deploy --from-render-yaml

# ====================
# UTILITIES
# ====================

# Placeholder for Render logs (may be replaced with `render logs`)
logs:
	echo "Use Render dashboard or CLI to view logs."

# Clean up local environments (future-proofing)
clean:
	rm -rf $(BACKEND_DIR)/venv $(FRONTEND_DIR)/node_modules

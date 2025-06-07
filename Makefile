# Variables
DOCKER_COMPOSE = docker compose
FRONTEND_PORT = 5173
BACKEND_PORT = 8000

# Commands
.PHONY: up down build frontend backend logs clean

# Start both frontend and backend
up:
	$(DOCKER_COMPOSE) up

# Start both frontend and backend with rebuild
build-up:
	$(DOCKER_COMPOSE) up --build

# Stop all services
down:
	$(DOCKER_COMPOSE) down

# Build the Docker images
build:
	$(DOCKER_COMPOSE) build

# Start only the frontend
frontend:
	$(DOCKER_COMPOSE) up --build frontend

# Start only the backend
backend:
	$(DOCKER_COMPOSE) up --build backend

# Deploy frontend via Render CLI
deploy-frontend:
	render deploy --service papi-chispa-frontend --from-render-yaml

# Deploy backend via Render CLI
deploy-backend:
	render deploy --service papi-chispa-backend --from-render-yaml

# Deploy both from render.yaml
deploy:
	render deploy --from-render-yaml

# View logs for all services
logs:
	$(DOCKER_COMPOSE) logs -f

# Clean up Docker (remove containers, images, volumes)
clean:
	docker system prune -af --volumes

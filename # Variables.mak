# Variables
DOCKER_COMPOSE = docker compose
FRONTEND_PORT = 5173
BACKEND_PORT = 8000

# Docker Compose Commands
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

# View logs for all services
logs:
	$(DOCKER_COMPOSE) logs -f

# Clean up Docker (remove containers, images, volumes)
clean:
	docker system prune -af --volumes
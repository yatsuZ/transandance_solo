DOCKER_COMPOSE= srcs/docker-compose.yml

all:
	@echo "Building and starting containers..."
	@echo "Using Docker Compose file: $(DOCKER_COMPOSE)"
	docker compose -f $(DOCKER_COMPOSE) up --build -d

down:
	@echo "Stopping and removing containers..."
	docker compose -f $(DOCKER_COMPOSE) down -v --remove-orphans

fclean:
	@echo "Removing volumes and orphan containers..."
	@echo "Cleaning up Docker system..."
	docker compose -f $(DOCKER_COMPOSE) down --volumes --remove-orphans
	docker volume prune -af
	docker system prune -af

.Phony: all down fclean

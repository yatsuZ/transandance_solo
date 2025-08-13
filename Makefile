# Default targets
.PHONY:	all help local install build_local clean fclean exec test_local docker \
		build_img up_cont stop_dock clean_dock test_dock show_img \
		show_container go_in_container re test check_goinfre

# OTHER
SHELL := /bin/bash


# Colors
GREEN  = \033[1;32m
BLUE   = \033[1;34m
YELLOW = \033[1;33m
RED    = \033[1;31m
NC     = \033[0m # No Color

# Variables
PORT             = 3000
PROJECT_NAME     = transandance
DOCKER_COMPOSE   := docker-compose
COMPOSE_FILE     := ./code/docker-compose.yml
DC               := $(DOCKER_COMPOSE) -f $(COMPOSE_FILE)
IMG_NAME         = game_project_img
CONTAINER_NAME   = game_project_cont

# Default action
all: help

### Docker Management

docker: build_img up_cont

# check_goinfre:
# 	@if [ ! -d /sgoinfre/$(USER)/ft_trans/db ]; then \
# 		echo "📁 Dossier /sgoinfre/$(USER)/ft_trans/db non trouvé. Création..."; \
# 		sudo mkdir -p /sgoinfre/$(USER)/ft_trans/db; \
# 	else \
# 		echo "✅ Dossier /sgoinfre/$(USER)/ft_trans/db déjà présent."; \
# 	fi

# Build Docker image
build_img: # check_goinfre
	@echo -e "$(YELLOW)🐳 Building Docker image...$(NC)"
	@$(DC) build --no-cache
	@echo -e "$(GREEN)✔ Docker image "$(IMG_NAME)" built successfully!$(NC)"

# Start Docker containers
up_cont:
	@echo -e "$(YELLOW)🚀 Starting Docker containers...$(NC)"
	@$(DC) up -d --remove-orphans --no-deps
	@echo -e "$(GREEN)✔ Docker containers started successfully!$(NC)"
	@echo ""
	@echo -e "🌐 Access your application at http://localhost:$(PORT)"
	@echo ""

# Stop Docker containers
stop_dock:
	@echo -e "$(YELLOW)🛑 Stopping Docker containers...$(NC)"
	@$(DC) down
	@echo -e "$(GREEN)✔ Docker containers stopped!$(NC)"

# Clean Docker containers, volumes, and networks
clean_dock: stop_dock
	@echo -e "$(YELLOW)🧹 Cleaning Docker resources...$(NC)"
	@$(DC) down -v --rmi all
	@echo -e "$(RED)🗑️ Docker resources cleaned!$(NC)"

# Show existing Docker images
show_img:
	@echo -e "$(YELLOW)🖼️ Showing existing Docker images...$(NC)"
	@docker images
	@echo -e "$(GREEN)✔ Docker images listed!$(NC)"

# Show running Docker containers
show_container:
	@echo -e "$(YELLOW)🐳 Showing running Docker containers...$(NC)"
	@docker ps
	@echo -e "$(GREEN)✔ Running Docker containers listed!$(NC)"

# Enter the running Docker container
go_in_container:
	@echo -e "$(YELLOW)🚪 Entering Docker container "$(CONTAINER_NAME)"...$(NC)"
	@docker exec -it "$(CONTAINER_NAME)" /bin/sh
	@echo -e "$(GREEN)✔ You are now inside the container! Type 'exit' to return.$(NC)"

### Combined Actions

# Rebuild and restart Docker containers
re_docker: clean_dock build_img up_cont
	@echo -e "$(BLUE)🔄 Rebuilding and restarting Docker environment...$(NC)"
	@echo -e "$(GREEN)✔ Docker environment rebuilt and restarted!$(NC)"

# Commande pour afficher les logs du conteneur
dock_logs:
	docker logs -f $(CONTAINER_NAME)

# Help message
help:
	@echo -e "$(BLUE)✨ Makefile Help for $(PROJECT_NAME) ✨$(NC)"
	@echo -e " "
	@echo -e "$(YELLOW)🐳 Docker Management:$(NC)"
	@echo -e " $(BLUE)make docker$(NC)    : Builds and starts Docker containers."
	@echo -e " $(GREEN)make build_img$(NC) : Builds the Docker image."
	@echo -e " $(BLUE)make up_cont$(NC)  : Starts Docker containers."
	@echo -e " $(GREEN)make stop_dock$(NC) : Stops Docker containers."
	@echo -e " $(GREEN)make clean_dock$(NC): Cleans Docker containers, volumes, and networks."
	@echo -e " $(GREEN)make show_img$(NC)  : Shows existing Docker images."
	@echo -e " $(GREEN)make show_container$(NC): Shows running Docker containers."
	@echo -e " $(GREEN)make go_in_container$(NC): Enters the running Docker container."
	@echo -e " $(GREEN)make dock_logs$(NC): afficher les logs des conteneurs."
	@echo -e " "
	@echo -e "$(YELLOW)🔄 Combined Actions:$(NC)"
	@echo -e " $(GREEN)make re_docker$(NC)  : Rebuilds and restarts the Docker environment."
	@echo -e " "
	@echo -e "$(YELLOW)ℹ️ Additional Notes:$(NC)"
	@echo -e " - Ensure Docker is installed and running if you intend to use Docker targets."
	@echo -e " - The '$(CONTAINER_NAME)' variable is used to interact with your container."
	@echo -e " - You can customize variables like PORT, PROJECT_NAME, etc., at the top of this file."
	@echo -e " "

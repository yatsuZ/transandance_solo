# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: yzaoui <yzaoui@student.42.fr>              +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/04/27 05:34:16 by yzaoui            #+#    #+#              #
#    Updated: 2025/11/07 17:31:48 by yzaoui           ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

.PHONY: all help local install build_local clean fclean exec docker prod \
		build_img build_img_prod up_cont stop_dock clean_dock \
		show_img show_container go_in_container go_in_nginx re re_docker re_prod dock_logs qrcode

SHELL := /bin/bash

GREEN   = \033[1;32m
BLUE    = \033[1;34m
YELLOW  = \033[1;33m
RED     = \033[1;31m
MAGENTA = \033[1;35m
NC      = \033[0m

PORT             = 3000
PROJECT_NAME     = transandance
GAME_DIR         = ./code/
JS_EXEC_PATH     = $(GAME_DIR)/dist/
NODE_MODULE_PATH = $(GAME_DIR)/node_modules
DOCKER_COMPOSE   = docker compose
COMPOSE_FILE     = ./docker-compose.yml
DC               = $(DOCKER_COMPOSE) -f $(COMPOSE_FILE)
IMG_NAME         = game_project_img
CONTAINER_NAME   = game_project_cont

all: help

local: build_local exec

install:
	@npm install --prefix "$(GAME_DIR)"

build_local: install
	@npm --prefix "$(GAME_DIR)" run build

clean:
	@npm --prefix "$(GAME_DIR)" run clean

fclean: clean
	@rm -rf "$(NODE_MODULE_PATH)"

exec: build_local
	@npm --prefix "$(GAME_DIR)" start

docker: build_img up_cont

prod: build_img_prod up_cont

build_img:
	@$(DC) build --no-cache

build_img_prod:
	@$(DC) build --no-cache -f Docker/backFastify/Dockerfile.prod game_project_cont

up_cont:
	@$(DC) up -d --remove-orphans --no-deps
	@. ./.env 2>/dev/null || true; \
	HTTPS_PORT=$${NGINX_HTTPS_PORT:-443}; \
	if [ "$$HTTPS_PORT" = "443" ]; then \
		echo -e "$(GREEN)https://localhost$(NC)"; \
	else \
		echo -e "$(GREEN)https://localhost:$$HTTPS_PORT$(NC)"; \
	fi

stop_dock:
	@$(DC) down

clean_dock: stop_dock
	@$(DC) down -v --rmi all

show_img:
	@docker images

show_container:
	@docker ps

go_in_container:
	@docker exec -it "$(CONTAINER_NAME)" /bin/sh

go_in_nginx:
	@docker exec -it container-nginx-tr /bin/sh

re_docker: clean_dock build_img up_cont

re_prod: clean_dock build_img_prod up_cont

re: fclean local

dock_logs:
	@docker logs -f $(CONTAINER_NAME)

qrcode:
	@if ! command -v qrencode &> /dev/null; then \
		echo "qrencode not installed"; \
		exit 1; \
	fi
	@. ./.env 2>/dev/null || true; \
	HOST_IP=$${HOST_IP:-192.168.1.13}; \
	HTTPS_PORT=$${NGINX_HTTPS_PORT:-443}; \
	if [ "$$HTTPS_PORT" = "443" ]; then \
		URL="https://$$HOST_IP"; \
	else \
		URL="https://$$HOST_IP:$$HTTPS_PORT"; \
	fi; \
	echo "$$URL" | qrencode -t ANSIUTF8

help:
	@echo "Makefile - $(PROJECT_NAME)"
	@echo ""
	@echo "Local:"
	@echo "  make local       - Build + run locally"
	@echo "  make install     - Install dependencies"
	@echo "  make build_local - Build project"
	@echo "  make exec        - Run application"
	@echo "  make clean       - Clean build files"
	@echo "  make fclean      - Clean all (+ node_modules)"
	@echo "  make re          - Rebuild local"
	@echo ""
	@echo "Docker:"
	@echo "  make docker      - Build + start (dev mode)"
	@echo "  make prod        - Build + start (prod mode)"
	@echo "  make stop_dock   - Stop containers"
	@echo "  make clean_dock  - Clean Docker resources"
	@echo "  make re_docker   - Rebuild Docker (dev)"
	@echo "  make re_prod     - Rebuild Docker (prod)"
	@echo "  make dock_logs   - Show container logs"
	@echo "  make show_img    - List Docker images"
	@echo "  make show_container - List running containers"
	@echo "  make go_in_container - Enter game container"
	@echo "  make go_in_nginx - Enter nginx container"
	@echo "  make qrcode      - Generate QR for mobile"

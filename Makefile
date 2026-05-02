# Main Makefile for the project

# Detect operating system for color support
ifeq ($(OS),Windows_NT)
    COLOR_RESET=
    COLOR_BLUE_BG=
else
    COLOR_RESET=\033[0m
    COLOR_BLUE_BG=\033[44m
endif

# Include layer-specific makefiles
include frontend.mk
include backend.mk

# Aggregate targets
lint: backend-lint frontend-lint markdown-lint
format: backend-format frontend-format

# Markdown linting
markdown-lint:
	@echo "$(COLOR_BLUE_BG)Running markdown linting with rumdl...$(COLOR_RESET)"
	uv tool run --from rumdl==0.1.86 rumdl check .

type-check: backend-type-check frontend-type-check
test: backend-test frontend-test
fallow: frontend-fallow
css-quality: frontend-css-quality

# Quality Assurance targets
qa-frontend: frontend-lint frontend-format frontend-type-check frontend-test frontend-build frontend-audit frontend-fallow frontend-css-quality frontend-security-lint
qa-backend: backend-lint backend-format backend-type-check backend-audit backend-test
hooks: backend-hooks
qa: format lint type-check backend-validate-api-schema test fallow css-quality frontend-security-lint
lighthouse: frontend-build frontend-lighthouse
clean: backend-clean frontend-clean

# Run targets
run-backend:
	@$(MAKE) _run-backend

run-frontend:
	@$(MAKE) _run-frontend

run: run-backend run-frontend

# Docker targets
docker-build:
	@echo "$(COLOR_BLUE_BG)Building containerized services...$(COLOR_RESET)"
	docker-compose build --no-cache

docker-up: docker-build
	@echo "$(COLOR_BLUE_BG)Running containerized services...$(COLOR_RESET)"
	docker-compose up -d

docker-down:
	@echo "$(COLOR_BLUE_BG)Stopping containerized services...$(COLOR_RESET)"
	docker-compose down

# End-to-end testing
e2e-test:
	@$(MAKE) run-backend
	@$(MAKE) run-frontend
	@sleep 10 # Wait for services to start
	@$(MAKE) _run-e2e-test

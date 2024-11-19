# Main Makefile for the project

# Detect operating system and shell
ifeq ($(OS),Windows_NT)
    # Detect if using PowerShell
    ifneq ($(findstring pwsh,$(SHELL)),)
        VENV_ACTIVATE=.\.venv\Scripts\Activate.ps1
    else ifneq ($(findstring powershell,$(SHELL)),)
        VENV_ACTIVATE=.\.venv\Scripts\Activate.ps1
    else
        # Default to CMD
        VENV_ACTIVATE=.venv\Scripts\activate
    endif
    COLOR_RESET=
    COLOR_BLUE_BG=
else
    VENV_ACTIVATE=. .venv/bin/activate 
    COLOR_RESET=\033[0m
    COLOR_BLUE_BG=\033[44m
endif

# Include layer-specific makefiles
include frontend.mk
include backend.mk

# Aggregate targets
lint: backend-lint frontend-lint
format: backend-format frontend-format
type-check: backend-type-check frontend-type-check
test: backend-test frontend-test

# Quality Assurance targets
qa-frontend: frontend-lint frontend-format frontend-type-check frontend-test frontend-build frontend-audit
qa-backend: backend-lint backend-format backend-type-check backend-test
qa: format lint type-check backend-validate-api-schema test

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

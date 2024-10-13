# Define paths (note that the paths are relative to the Makefile location)
SERVER_DIR=./server
FRONTEND_DIR=./frontend

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

# Backend tools
RUFF=ruff
MYPY=mypy
ISORT=isort
PYTEST=pytest chatgptserver
PYCOVERAGE=coverage run -m pytest chatgptserver && coverage report --fail-under=95 && coverage html
DJANGO_RUNSERVER=chatgptserver/manage.py runserver
OPENAPI_SCHEMA=chatgptserver/manage.py spectacular --color --validate --file schema.yml   

# Frontend tools
ESLINT=npm run lint:fix
PRETTIER=npm run format
TSC=npm run check-types
JEST=npm run test
NEXT_START=npm run start
PLAYWRIGHT=npm run test:e2e

# Targets
.PHONY: all lint format type-check backend-lint backend-format \
	backend-type-check frontend-lint frontend-format backend-validate-api-schema \
	frontend-type-check test backend-test frontend-test e2e-test qa \
	run-backend run-frontend run

# Run linters for both backend and frontend
lint: backend-lint frontend-lint

# Run formatters for both backend and frontend
format: backend-format frontend-format

# Run type checkers for both backend and frontend
type-check: backend-type-check frontend-type-check

# Run tests for both backend and frontend
test: backend-test frontend-test

# Linting, formatting, type-checking, and unit testing for backend
backend-lint:
	@echo "$(COLOR_BLUE_BG)Running backend linting with ruff...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(RUFF) check --fix .

backend-format:
	@echo "$(COLOR_BLUE_BG)Running backend formatting with ruff...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(RUFF) format . && $(ISORT) .

backend-type-check:
	@echo "$(COLOR_BLUE_BG)Running backend static type checking with mypy...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(MYPY) .

backend-validate-api-schema:
	@echo "$(COLOR_BLUE_BG)Validating API schema...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(OPENAPI_SCHEMA)

backend-test:
	@echo "$(COLOR_BLUE_BG)Running backend unit tests...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(PYTEST) && $(PYCOVERAGE)

# Linting, formatting, type-checking, and unit testing for frontend
frontend-lint:
	@echo "$(COLOR_BLUE_BG)Running frontend linting...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(ESLINT) .

frontend-format:
	@echo "$(COLOR_BLUE_BG)Running frontend formatting...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(PRETTIER) .

frontend-type-check:
	@echo "$(COLOR_BLUE_BG)Running frontend static type checking with TypeScript...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(TSC)

frontend-test:
	@echo "$(COLOR_BLUE_BG)Running frontend unit tests...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(JEST)

lint-markdown:
	@echo "$(COLOR_BLUE_BG)Linting markdown files...$(COLOR_RESET)"
	markdownlint README.md

# Run backend server
run-backend:
	@echo "$(COLOR_BLUE_BG)Running backend server...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(DJANGO_RUNSERVER) & echo $$! > backend.pid

# Run frontend server
run-frontend:
	@echo "$(COLOR_BLUE_BG)Running frontend server...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(NEXT_START) & echo $$! > frontend.pid

# Run QA checks
qa-frontend: frontend-lint frontend-format frontend-type-check frontend-test
qa-backend: backend-lint backend-format backend-type-check backend-test
qa: format lint type-check backend-validate-api-schema test

# End-to-end testing with backend and frontend running
e2e-test:
	@echo "$(COLOR_BLUE_BG)Starting backend and frontend services...$(COLOR_RESET)"
	@$(MAKE) run-backend
	@$(MAKE) run-frontend
	@sleep 10 # Wait for services to start (adjust this as necessary)
	@echo "$(COLOR_BLUE_BG)Running end-to-end tests...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(PLAYWRIGHT)


# Run all services
docker-up:
	@echo "$(COLOR_BLUE_BG)Running containerized services...$(COLOR_RESET)"
	docker-compose up --build --force-recreate

# Stop all services
docker-down:
	@echo "$(COLOR_BLUE_BG)Stopping containerized services...$(COLOR_RESET)"
	docker-compose down

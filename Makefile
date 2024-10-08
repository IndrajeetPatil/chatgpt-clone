# Define paths
SERVER_DIR=./server
FRONTEND_DIR=./frontend
VENV_ACTIVATE=source .venv/bin/activate 

COLOR_RESET=\033[0m
COLOR_BLUE_BG=\033[44m

# Backend tools
RUFF=ruff
MYPY=mypy
ISORT=isort
PYTEST=pytest chatgptserver/tests.py
PYCOVERAGE=coverage run --source='.' chatgptserver/manage.py test && coverage report && coverage html

# Frontend tools
ESLINT=npm run lint:fix
PRETTIER=npm run format
TSC=npm run build
JEST=npm run test

# Targets
.PHONY: all lint format type-check backend-lint backend-format backend-type-check frontend-lint frontend-format frontend-type-check

# Run linters for both backend and frontend
lint: backend-lint frontend-lint

# Run formatters for both backend and frontend
format: backend-format frontend-format

# Run type checkers for both backend and frontend
type-check: backend-type-check frontend-type-check

# Run tests for both backend and frontend
test: backend-test frontend-test

# Linting, formatting, and type-checking for backend
backend-lint:
	@echo "$(COLOR_BLUE_BG)Running backend linting with ruff...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(RUFF) check --fix .

backend-format:
	@echo "$(COLOR_BLUE_BG)Running backend formatting with ruff...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(RUFF) format . && $(ISORT) .

backend-type-check:
	@echo "$(COLOR_BLUE_BG)Running backend static type checking with mypy...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(MYPY) .

backend-test:
	@echo "$(COLOR_BLUE_BG)Running backend unit tests...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(PYTEST) && $(PYCOVERAGE)

# Linting, formatting, and type-checking for frontend
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

# Run all QA tools
qa: format lint type-check test

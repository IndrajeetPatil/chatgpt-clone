SERVER_DIR=./server

# Backend tool commands
PYTEST=pytest chatgptserver --verbose
PYCOVERAGE=coverage run -m pytest chatgptserver && coverage report --fail-under=95 && coverage html
DJANGO_RUNSERVER=chatgptserver/manage.py runserver
OPENAPI_SCHEMA=chatgptserver/manage.py spectacular --color --validate --file schema.yml
LOCUST=locust -H http://127.0.0.1:8000/

# Backend Targets
backend-lint:
	@echo "$(COLOR_BLUE_BG)Running backend linting with ruff...$(COLOR_RESET)"
	cd $(SERVER_DIR) && uv run ruff check --fix .

backend-format:
	@echo "$(COLOR_BLUE_BG)Running backend formatting...$(COLOR_RESET)"
	cd $(SERVER_DIR) && uv run add-trailing-comma --exit-zero-even-if-changed $$(git ls-files '*.py')
	cd $(SERVER_DIR) && uv run ruff format .

backend-type-check:
	@echo "$(COLOR_BLUE_BG)Running backend static type checking with ty...$(COLOR_RESET)"
	cd $(SERVER_DIR) && uv run ty check

backend-audit:
	@echo "$(COLOR_BLUE_BG)Auditing backend dependencies...$(COLOR_RESET)"
	cd $(SERVER_DIR) && uv audit --no-dev --preview-features

backend-validate-api-schema:
	@echo "$(COLOR_BLUE_BG)Validating API schema...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(OPENAPI_SCHEMA)

backend-test:
	@echo "$(COLOR_BLUE_BG)Running backend unit tests...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(PYTEST) && $(PYCOVERAGE)

backend-hooks:
	@echo "$(COLOR_BLUE_BG)Running prek hooks on all files...$(COLOR_RESET)"
	prek run --all-files

_run-backend:
	@echo "$(COLOR_BLUE_BG)Running backend server...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(DJANGO_RUNSERVER) & echo $$! > backend.pid

backend-load-test:
	@echo "$(COLOR_BLUE_BG)Running backend load tests...$(COLOR_RESET)"
	@$(MAKE) _run-backend
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(LOCUST)

.PHONY: backend-lint backend-format backend-type-check backend-audit \
	backend-validate-api-schema backend-test backend-hooks _run-backend backend-load-test

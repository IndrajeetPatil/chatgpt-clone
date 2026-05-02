SERVER_DIR=./server

# Backend tool commands
PYTEST=uv run pytest app tests --verbose
PYCOVERAGE=uv run coverage run -m pytest app tests && uv run coverage report --fail-under=95 && uv run coverage html
PYTYPECOVERAGE=uv run python -m typecoverage app tests locustfile.py --recursive --exit-nonzero-on-issues
FASTAPI_RUNSERVER=uv run fastapi dev app/main.py --host 0.0.0.0 --port 8000
OPENAPI_SCHEMA=uv run python -c "from app.main import app; app.openapi()"
LOCUST=uv run locust -H http://127.0.0.1:8000/

# Backend Targets
backend-lint:
	@echo "$(COLOR_BLUE_BG)Running backend linting with ruff...$(COLOR_RESET)"
	cd $(SERVER_DIR) && uv run ruff check --fix .

backend-format:
	@echo "$(COLOR_BLUE_BG)Running backend formatting...$(COLOR_RESET)"
	cd $(SERVER_DIR) && find . -name '*.py' -not -path './.venv/*' -print0 | xargs -0 uv run add-trailing-comma --exit-zero-even-if-changed
	cd $(SERVER_DIR) && uv run ruff format .

backend-type-check:
	@echo "$(COLOR_BLUE_BG)Running backend static type checking with ty...$(COLOR_RESET)"
	cd $(SERVER_DIR) && uv run ty check

backend-audit:
	@echo "$(COLOR_BLUE_BG)Auditing backend dependencies...$(COLOR_RESET)"
	cd $(SERVER_DIR) && uv audit --no-dev --locked --preview-features audit

backend-validate-api-schema:
	@echo "$(COLOR_BLUE_BG)Validating API schema...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(OPENAPI_SCHEMA)

backend-test:
	@echo "$(COLOR_BLUE_BG)Running backend unit tests...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(PYTEST) && $(PYCOVERAGE)

backend-type-coverage:
	@echo "$(COLOR_BLUE_BG)Running backend type coverage check...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(PYTYPECOVERAGE)

backend-hooks:
	@echo "$(COLOR_BLUE_BG)Running prek hooks on all files...$(COLOR_RESET)"
	prek run --all-files

_run-backend:
	@echo "$(COLOR_BLUE_BG)Running backend server...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(FASTAPI_RUNSERVER) & echo $$! > backend.pid

backend-clean:
	@echo "$(COLOR_BLUE_BG)Cleaning backend build artifacts and caches...$(COLOR_RESET)"
	rm -rf $(SERVER_DIR)/.venv \
	       $(SERVER_DIR)/htmlcov \
	       $(SERVER_DIR)/.coverage \
	       $(SERVER_DIR)/.pytest_cache \
	       $(SERVER_DIR)/.ruff_cache
	find $(SERVER_DIR) -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

backend-load-test:
	@echo "$(COLOR_BLUE_BG)Running backend load tests...$(COLOR_RESET)"
	@$(MAKE) _run-backend
	cd $(SERVER_DIR) && $(LOCUST)

.PHONY: backend-lint backend-format backend-type-check backend-audit \
	backend-validate-api-schema backend-test backend-type-coverage backend-hooks \
	_run-backend backend-load-test backend-clean

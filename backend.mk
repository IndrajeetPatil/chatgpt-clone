SERVER_DIR=./server

# Backend tool commands
RUFF=ruff
MYPY=mypy
PYTEST=pytest chatgptserver --verbose
PYCOVERAGE=coverage run -m pytest chatgptserver && coverage report --fail-under=95 && coverage html
DJANGO_RUNSERVER=chatgptserver/manage.py runserver
OPENAPI_SCHEMA=chatgptserver/manage.py spectacular --color --validate --file schema.yml
LOCUST=locust -H http://127.0.0.1:8000/

# Backend Targets
backend-lint:
	@echo "$(COLOR_BLUE_BG)Running backend linting with ruff...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(RUFF) check --fix .

backend-format:
	@echo "$(COLOR_BLUE_BG)Running backend formatting with ruff...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(RUFF) format .

backend-type-check:
	@echo "$(COLOR_BLUE_BG)Running backend static type checking with mypy...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(MYPY) .

backend-validate-api-schema:
	@echo "$(COLOR_BLUE_BG)Validating API schema...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(OPENAPI_SCHEMA)

backend-test:
	@echo "$(COLOR_BLUE_BG)Running backend unit tests...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(PYTEST) && $(PYCOVERAGE)

_run-backend:
	@echo "$(COLOR_BLUE_BG)Running backend server...$(COLOR_RESET)"
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(DJANGO_RUNSERVER) & echo $$! > backend.pid

backend-load-test:
	@echo "$(COLOR_BLUE_BG)Running backend load tests...$(COLOR_RESET)"
	@$(MAKE) _run-backend
	cd $(SERVER_DIR) && $(VENV_ACTIVATE) && $(LOCUST)

.PHONY: backend-lint backend-format backend-type-check \
	backend-validate-api-schema backend-test _run-backend backend-load-test
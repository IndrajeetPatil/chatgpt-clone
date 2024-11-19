FRONTEND_DIR=./frontend

# Frontend tool commands
ESLINT=npm run lint:fix
PRETTIER=npm run format
TSC=npm run check-types
AUDIT=npm audit --audit-level=moderate
BUILD=npm run build
JEST=npm run test
NEXT_START=npm run start
PLAYWRIGHT=npm run test:e2e

# Frontend Targets
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

frontend-build:
	@echo "$(COLOR_BLUE_BG)Building frontend...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(BUILD)

frontend-audit:
	@echo "$(COLOR_BLUE_BG)Auditing frontend dependencies...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(AUDIT)

_run-frontend:
	@echo "$(COLOR_BLUE_BG)Running frontend server...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(NEXT_START) & echo $$! > frontend.pid

_run-e2e-test:
	@echo "$(COLOR_BLUE_BG)Running end-to-end tests...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(PLAYWRIGHT)

.PHONY: frontend-lint frontend-format frontend-type-check \
	frontend-test frontend-build frontend-audit _run-frontend _run-e2e-test
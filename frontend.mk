FRONTEND_DIR=./frontend

# Frontend tool commands
LINT=pnpm run lint
TSC=pnpm run check-types
AUDIT=pnpm audit --audit-level=moderate
BUILD=pnpm run build
VITEST=pnpm run test
VITE_START=pnpm run start
PLAYWRIGHT=pnpm run test:e2e
FALLOW=pnpm run fallow
CSS_QUALITY=pnpm run css-quality
LHCI=pnpm dlx lhci@0.15.1

# Frontend Targets
frontend-lint:
	@echo "$(COLOR_BLUE_BG)Running frontend linting and formatting...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(LINT)

frontend-format: frontend-lint

frontend-type-check:
	@echo "$(COLOR_BLUE_BG)Running frontend static type checking with TypeScript...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(TSC)

frontend-test:
	@echo "$(COLOR_BLUE_BG)Running frontend unit tests...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(VITEST)

frontend-build:
	@echo "$(COLOR_BLUE_BG)Building frontend...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(BUILD)

frontend-audit:
	@echo "$(COLOR_BLUE_BG)Auditing frontend dependencies...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(AUDIT)

frontend-fallow:
	@echo "$(COLOR_BLUE_BG)Running frontend dead-code/complexity/duplication checks with fallow...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(FALLOW)

frontend-css-quality:
	@echo "$(COLOR_BLUE_BG)Running frontend CSS code quality checks...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(CSS_QUALITY)

frontend-lighthouse:
	@echo "$(COLOR_BLUE_BG)Running Lighthouse CI...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(LHCI) autorun

frontend-clean:
	@echo "$(COLOR_BLUE_BG)Cleaning frontend build artifacts and caches...$(COLOR_RESET)"
	rm -rf $(FRONTEND_DIR)/node_modules \
	       $(FRONTEND_DIR)/dist \
	       $(FRONTEND_DIR)/coverage \
	       $(FRONTEND_DIR)/playwright-report \
	       $(FRONTEND_DIR)/test-results \
	       $(FRONTEND_DIR)/.fallow \
	       $(FRONTEND_DIR)/.lighthouseci

_run-frontend:
	@echo "$(COLOR_BLUE_BG)Running frontend server...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(VITE_START) & echo $$! > frontend.pid

_run-e2e-test:
	@echo "$(COLOR_BLUE_BG)Running end-to-end tests...$(COLOR_RESET)"
	cd $(FRONTEND_DIR) && $(PLAYWRIGHT)

.PHONY: frontend-lint frontend-format frontend-type-check \
	frontend-test frontend-build frontend-audit frontend-fallow \
	frontend-css-quality frontend-lighthouse frontend-clean \
	_run-frontend _run-e2e-test

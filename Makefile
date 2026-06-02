.PHONY: help install setup-env dev-web dev build lint type-check test test-watch

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# --- Setup ---

install: ## Install all dependencies
	npm install

setup-env: ## Create .env.local from example (won't overwrite existing)
	@if [ -f apps/web/.env.local ]; then \
		echo "apps/web/.env.local already exists — skipping"; \
	else \
		cp apps/web/.env.example apps/web/.env.local; \
		echo "Created apps/web/.env.local — edit it with your values"; \
	fi

setup: install setup-env ## Full local setup (install + env)

# --- Development ---

dev-web: ## Start web dev server (Next.js)
	npm run dev:web

dev: ## Start all apps via Turborepo
	npm run dev

# --- Build & Quality ---

build: ## Build web app for production
	npm run build:web

lint: ## Lint all packages
	npm run lint

type-check: ## Type-check all packages
	npm run type-check

test: ## Run all tests
	npm test

test-watch: ## Run tests in watch mode
	npm run test:watch

check: lint type-check test ## Run lint + type-check + tests

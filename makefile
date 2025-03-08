install-dependencies:
	@echo "Installing dependencies... backend"
	@cd backend && go mod download && go mod tidy
	@cd backend && mkdir data || true && mkdir data/global ||true
	@echo "Installing dependencies... frontend"
	@cd frontend && npm install

# if not work copy last 2 commands to your terminal
install-migration-tool:
	@echo "Installing migration tool..."
	go install github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	export PATH=$PATH:$HOME/go/bin

# use make create-migration name=migration_name
create-migration:
	@echo "Creating migration with name: $(name)"
	migrate create -ext .sql -dir backend/pkg/db/migrations -seq $(name)

inject-fake-data:
	@echo "Injecting fake data..."
	@cd backend && python3 scripts/inject_fake_data.py

backend:
	@echo "Running backend..."
	@cd backend && PORT=8080 go run cmd/main.go

frontend:
	@echo "Installing dependencies..."
	@cd frontend && npm install
	@echo "Running frontend..."
	@cd frontend && npm run dev

.PHONY: install-dependencies install-migration-tool create-migration backend frontend
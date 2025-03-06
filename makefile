# if not work copy last 2 commands to your terminal
install-migration-tool:
	@echo "Installing migration tool..."
	go install github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	export PATH=$PATH:$HOME/go/bin

# use make create-migration name=migration_name
create-migration:
	@echo "Creating migration with name: $(name)"
	migrate create -ext .sql -dir backend/pkg/db/migrations -seq $(name)

backend:
	@echo "Running backend..."
	@cd backend && PORT=8080 go run cmd/main.go

frontend:
	@echo "Installing dependencies..."
	@cd frontend && npm install
	@echo "Running frontend..."
	@cd frontend && npm run dev

.PHONY: install-migration-tool create-migration backend frontend
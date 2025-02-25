run-backend:
	@echo "Running backend..."
	@cd backend && PORT=8080 go run cmd/server/main.go

run-frontend:
	@echo "Running frontend..."
	@cd frontend && npm run dev

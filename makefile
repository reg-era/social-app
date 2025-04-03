install-dependencies:
	@echo "Installing dependencies... backend"
	@cd backend && go mod download && go mod tidy
	@cd backend && mkdir data || true && mkdir data/global ||true
	@pip install faker
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
	@cd backend && python3 pkg/db/scripts/inject_fake_data.py

backend:
	@echo "Running backend..."
	@cd backend && PORT=8080 HOST=127.0.0.1 go run cmd/main.go

frontend:
	@echo "Running frontend..."
	@cd frontend && NEXT_PUBLIC_GOSERVER=127.0.0.1:8080 npm run dev

IMAGE_NAME=social-back-img
CONTAINER_NAME=social-back-container
docker-backend:
	@echo "Cleaning up old containers and images..."
	@docker rm -f $(CONTAINER_NAME) || true
	@docker rmi -f $(IMAGE_NAME) || true

	@echo "Building the Docker image..."
	@cd backend && docker build -t $(IMAGE_NAME) .

	@echo "Running the Docker container..."
	docker run --name $(CONTAINER_NAME) -p 8080:8080 $(IMAGE_NAME)	


FRONTEND_IMAGE_NAME=frontend-img
FRONTEND_CONTAINER_NAME=frontend-container
docker-frontend:
	@echo "Cleaning up old containers and images..."
	@docker rm -f $(FRONTEND_CONTAINER_NAME) || true
	@docker rmi -f $(FRONTEND_IMAGE_NAME) || true

	@echo "Building the Docker image for frontend..."
	@cd frontend && docker build -t $(FRONTEND_IMAGE_NAME) .

	@echo "Running the Docker container for frontend..."
	docker run --name $(FRONTEND_CONTAINER_NAME) -p 3000:3000 $(FRONTEND_IMAGE_NAME)

docker-clean:
	@echo "Cleaning up old containers and images..."
	@docker rm -f $(FRONTEND_CONTAINER_NAME) || true
	@docker rmi -f $(FRONTEND_IMAGE_NAME) || true
	@echo "Cleaning up old containers and images..."
	@docker rm -f $(CONTAINER_NAME) || true
	@docker rmi -f $(IMAGE_NAME) || true
	@echo "Cleaning up old docker compose services..."
	@docker-compose down --rmi all --volumes  

run-docker-compose: docker-clean
	docker-compose build
	docker-compose up

.PHONY: install-dependencies install-migration-tool create-migration backend frontend
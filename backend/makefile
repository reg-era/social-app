setup-migration:
	@echo "Installing dependencies..."
	go get github.com/mattn/go-sqlite3
	@echo "Cloning migrate repo..."
	git clone https://github.com/golang-migrate/migrate.git
	cd migrate && go get github.com/golang-migrate/migrate/v4/cmd/migrate
	cd migrate && go build -o ./migrate
	@echo "Migrate tool built successfully!"
	@echo "Verifying migrate installation..."
	./migrate/migrate --version

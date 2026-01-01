.PHONY: build build-frontend build-backend dev clean install

# Build everything
build: build-frontend build-backend

# Install frontend dependencies
install:
	cd frontend && npm install

# Build frontend
build-frontend:
	cd frontend && npm ci && npm run build

# Build Go backend (requires frontend to be built first)
build-backend:
	go build -o dimandocs .

# Build with version information
build-release:
	go build -ldflags="-s -w -X main.Version=$${VERSION:-dev} -X main.BuildTime=$$(date -u '+%Y-%m-%d_%H:%M:%S')" -o dimandocs .

# Development: run frontend dev server (expects backend on :8090)
dev:
	cd frontend && npm run dev

# Clean build artifacts
clean:
	rm -rf frontend/dist frontend/node_modules dimandocs

# Run the application
run: build
	./dimandocs

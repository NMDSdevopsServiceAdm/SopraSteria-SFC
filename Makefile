.DEFAULT_GOAL := all
.PHONY: all install run run_frontend run_backend

all: install run

install:
	npm install --prefix backend
	npm install --prefix frontend

run: run_frontend run_backend

run_frontend:
	echo "Frontend"
	cd frontend
	npm run build:watch
	cd ..

run_backend:
	echo "Backend"
	cd backend
	npm run
	cd ..
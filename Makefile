.DEFAULT_GOAL := all
.PHONY: all install run run_frontend run_backend

all: install run

install:
	echo "Ensure you are using Node 18"
	npm install --prefix backend
	npm install --prefix frontend

run:
	(cd backend && docker-compose up) & \
	(cd frontend && npm run build:watch)

.DEFAULT_GOAL := all
.PHONY: all install run

all: install run

install:
	export DB_HOST=localhost
	npm install --prefix frontend

run:
	(cd backend && docker-compose up --build) & \
	(cd frontend && npm run build:watch)

test:
	npm run test --prefix frontend

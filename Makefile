.DEFAULT_GOAL := all
.PHONY: all install run

all: install run

install:
	npm install --prefix frontend
	npm install --prefix backend

run:
	(cd backend && npm run dev-start) & \
	(cd frontend && npm run build:watch)

test-fe:
	npm run test --prefix frontend

test-be:
	npm run server:test:unit --prefix backend

db-migrate:
	cd backend && export NODE_ENV=localhost && npm run db:migrate

db-migrate-undo:
	cd backend && export NODE_ENV=localhost && npm run db:migrate:undo
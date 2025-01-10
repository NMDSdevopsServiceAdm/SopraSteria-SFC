.DEFAULT_GOAL := all
.PHONY: all install run

all: install run

install:
	export NODE_ENV=localhost
	npm install --prefix frontend
	npm install --prefix backend

run:
	(cd backend && npm run new-start) & \
	(cd frontend && npm run build:watch)

test-fe:
	npm run test --prefix frontend

test-be:
	npm run server:test:unit --prefix backend

db-migrate:
	cd backend && export NODE_ENV=localhost && npm run db:migrate

db-migrate-undo:
	cd backend && export NODE_ENV=localhost && npm run db:migrate:undo

.PHONY: db-migrate-e2e
db-migrate-e2e:
	cd backend && export NODE_ENV=e2etest && npm run db:migrate

run-e2e-server: db-migrate-e2e
	cd backend && export NODE_ENV=e2etest && npm run new-start & \
	cd frontend && export NODE_ENV=e2etest && npm run build:watch

test-e2e:
	npx cypress run
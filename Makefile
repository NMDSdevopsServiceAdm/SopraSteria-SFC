.DEFAULT_GOAL := all
.PHONY: all install run

all: install run

install:
	export NODE_ENV=localhost
	npm install --prefix frontend
	npm install --prefix backend
	npm install --prefix lambdas/bulkUpload

run:
	(cd backend && npm run new-start) & \
	(cd frontend && npm run build:watch)

test-fe:
	npm run test --prefix frontend

test-be:
	npm run server:test:unit --prefix backend

test-bu:
	npm run test --prefix lambdas/bulkUpload

db-migrate:
	cd backend && export NODE_ENV=localhost && npm run db:migrate

db-migrate-undo:
	cd backend && export NODE_ENV=localhost && npm run db:migrate:undo

.PHONY: db-migrate-e2e
db-migrate-e2e:
	cd backend && export NODE_ENV=e2etest && npm run db:migrate

run-e2e-server: db-migrate-e2e
	cd backend && export NODE_ENV=e2etest && npm run new-start & \
	cd frontend && export NODE_ENV=e2etest && npm run build:e2e

test-e2e:
	cd frontend && npx cypress run

stop-containers:
	docker stop frontend_backend
	docker stop sfc-test
	docker stop soprasteria-sfc-sfc-redis-1

install-for-e2e:
	export NODE_ENV=e2etest
	npm install --prefix frontend
	npm install --prefix backend
	npm install -g sequelize-cli

test-e2e-inside-docker:
	docker-compose -f docker-compose-e2e.yml up --build --no-attach frontend_backend --abort-on-container-exit --exit-code-from cypress

test-e2e-inside-docker-prebuilt:
	docker-compose -f docker-compose-e2e-prebuilt-image.yml up --build --no-attach frontend_backend --abort-on-container-exit --exit-code-from cypress

deploy-bu-dev:
	cd lambdas/bulkUpload && npm ci && npx serverless deploy --stage dev

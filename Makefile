.DEFAULT_GOAL := all
.PHONY: all install run

all: install run

install:
	export DB_HOST=127.0.0.1
	npm install --prefix frontend

run:
	(cd backend && npm run new-start) & \
	(cd frontend && npm run build:watch)

test:
	npm run test --prefix frontend
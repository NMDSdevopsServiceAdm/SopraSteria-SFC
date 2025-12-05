#!/usr/bin/env bash
set -euo pipefail

echo "Will build a customised postgres db image with tables populated"

docker-compose -f docker-compose-build-db-image-for-e2e.yml up --build --abort-on-container-exit --exit-code-from health-checker
echo "Finished database initialisation. Will build a snapshot image of this db"

docker start db-builder
docker exec db-builder cp -r /var/lib/postgresql/data postgres-data
docker exec db-builder rm /docker-entrypoint-initdb.d/sfc-e2e-test-db.sql /docker-entrypoint-initdb.d/install-extensions.sh
docker stop db-builder

docker commit db-builder postgres-db-with-data

echo "Finished building docker image with db snapshot"

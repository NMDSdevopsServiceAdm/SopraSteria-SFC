FROM public.ecr.aws/docker/library/postgres:15

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-contrib \
        postgresql-15-postgis \
    && rm -rf /var/lib/apt/lists/*

COPY sfc-e2e-test-db.sql /docker-entrypoint-initdb.d/
COPY install-extensions.sh /docker-entrypoint-initdb.d/
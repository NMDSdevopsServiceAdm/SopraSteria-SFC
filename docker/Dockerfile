FROM postgres:13

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-contrib \
        postgresql-13-postgis \
    && rm -rf /var/lib/apt/lists/*

COPY 001.sql /docker-entrypoint-initdb.d/
COPY 002.sql /docker-entrypoint-initdb.d/
COPY cqc_backup.sql /docker-entrypoint-initdb.d/
COPY install-extensions.sh /docker-entrypoint-initdb.d/
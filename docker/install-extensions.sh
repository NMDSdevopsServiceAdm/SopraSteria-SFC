echo "installing extensions on database $POSTGRES_DB"
psql -U $POSTGRES_USER --dbname="$POSTGRES_DB" <<-'EOSQL'
  create extension if not exists cube;
  create extension if not exists earthdistance;
  create extension if not exists postgis;
  create extension if not exists "uuid-ossp";
EOSQL
echo "finished with exit codez $?"

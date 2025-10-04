#!/usr/bin/env bash
set -e

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USERNAME" --dbname "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/db_schema.sql

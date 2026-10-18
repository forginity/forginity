FROM postgres:18-alpine

LABEL maintainer="Forginity Engineering <dev@forginity.com>"
LABEL description="Multi-database PostgreSQL container for Forginity Monorepo"

# Copy initialization scripts into postgres entrypoint directory
COPY init/ /docker-entrypoint-initdb.d/

HEALTHCHECK --interval=5s --timeout=5s --retries=5 \
  CMD pg_isready -U root || exit 1

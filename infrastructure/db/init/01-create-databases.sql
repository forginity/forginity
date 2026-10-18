-- ==============================================================================
-- FORGINITY MULTI-DATABASE INITIALIZATION SCRIPT
-- Uses PostgreSQL \getenv to read environment variables directly in .sql
-- ==============================================================================

-- 1. Read environment variables passed into the container
\getenv forginity_pwd FORGINITY_ADMIN_PASSWORD
\getenv auth_pwd AUTH_ADMIN_PASSWORD
\getenv pikyrider_pwd PIKYRIDER_ADMIN_PASSWORD

-- ==============================================================================
-- 1. FORGINITY PLATFORM (forginity_db)
-- ==============================================================================
CREATE ROLE forginity_admin WITH LOGIN PASSWORD :'forginity_pwd';
CREATE DATABASE forginity_db OWNER forginity_admin;
GRANT ALL PRIVILEGES ON DATABASE forginity_db TO forginity_admin;

\c forginity_db
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
GRANT ALL ON SCHEMA public TO forginity_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO forginity_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO forginity_admin;


-- ==============================================================================
-- 2. AUTH & IDENTITY (auth_db)
-- ==============================================================================
CREATE ROLE auth_admin WITH LOGIN PASSWORD :'auth_pwd';
CREATE DATABASE auth_db OWNER auth_admin;
GRANT ALL PRIVILEGES ON DATABASE auth_db TO auth_admin;

\c auth_db
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
GRANT ALL ON SCHEMA public TO auth_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO auth_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO auth_admin;


-- ==============================================================================
-- 3. PIKYRIDER PRODUCT (pikyrider_db)
-- ==============================================================================
CREATE ROLE pikyrider_admin WITH LOGIN PASSWORD :'pikyrider_pwd';
CREATE DATABASE pikyrider_db OWNER pikyrider_admin;
GRANT ALL PRIVILEGES ON DATABASE pikyrider_db TO pikyrider_admin;

\c pikyrider_db
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
GRANT ALL ON SCHEMA public TO pikyrider_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO pikyrider_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO pikyrider_admin;

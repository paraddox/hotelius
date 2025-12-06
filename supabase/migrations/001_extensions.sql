-- Migration: 001_extensions.sql
-- Description: Enable required PostgreSQL extensions
-- Dependencies: None

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable btree_gist for EXCLUDE constraints with date ranges
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Enable pg_trgm for better text search capabilities
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable unaccent for accent-insensitive searches
CREATE EXTENSION IF NOT EXISTS "unaccent";

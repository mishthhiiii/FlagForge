# FlagForge Database Schema

This directory contains SQL scripts for setup and maintenance of the FlagForge MySQL relational database.

## Files

- `schema.sql`: Contains the DDL table definitions (users, projects, environments, feature_flags, flag_rules, audit_logs) with appropriate constraints, foreign keys, auto-increments, and indexes.
- `seed.sql`: Contains initial seed data for demonstration and local development.
- `queries.sql`: Handy SQL query examples for common reporting and administration queries.

## Importing into MySQL

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

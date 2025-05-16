# Database Migration Tools

This directory contains tools and documentation related to database migrations, used for managing database schema changes.

## File Descriptions

- `db_migration_setup.py` - Script to initialize migration functionality for an existing database
- `db_migration_workflow.py` - Script demonstrating the database migration workflow
- `migration_template.py` - Database migration template file, showing how to add fields, create indexes, and perform data updates in migrations
- `migrations_guide.md` - Detailed database migration guide documentation

## Usage

### Initialize Migrations

If you have an existing database and want to start using migrations:

```bash
python -m migration_tools.db_migration_setup
```

This will:
1. Initialize the migration repository
2. Create an initial migration based on current models
3. Mark the migration as applied (since the database already exists)

### Learn Migration Workflow

To understand the database migration workflow:

```bash
python -m migration_tools.db_migration_workflow
```

This will demonstrate:
1. How to update models
2. How to generate migrations
3. How to apply migrations
4. How to verify changes
5. Other useful migration commands

### Migration Guide

For detailed migration guidance, refer to `migrations_guide.md`, which includes:
- Initializing the migration repository
- Creating migration files
- Applying migrations
- Rolling back migrations
- Viewing migration history
- Migration best practices
- Solutions to common issues

### Migration Template

`migration_template.py` provides a template for migration files, demonstrating:
- How to add new columns
- How to create indexes
- How to perform data updates in migrations
- How to write downgrade functions
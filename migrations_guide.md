# Database Migration Guide

This project uses Flask-Migrate (based on Alembic) to manage database schema changes. Below are the steps for using database migrations.

## Initialize Migration Repository

If this is your first time setting up migrations, you need to initialize the migration repository:

```bash
flask db init
```

This will create a `migrations` directory containing migration configurations and scripts.

## Create Migration Files

When you modify database models (in `models.py`), you need to create a new migration file:

```bash
flask db migrate -m "describe your changes"
```

For example:

```bash
flask db migrate -m "add users table"
flask db migrate -m "add sleep records table"
flask db migrate -m "add phone field to users table"
```

This will generate a new migration script in the `migrations/versions` directory, recording your model changes.

## Review Migration Files

Before applying migrations, it's recommended to review the generated migration file to ensure it correctly captures your intentions:

```bash
# View the latest migration file
ls -l migrations/versions/
```

Open the latest migration file and check if the `upgrade()` and `downgrade()` functions are correct.

## Apply Migrations

After verification, apply the migrations to the database:

```bash
flask db upgrade
```

This will execute all unapplied migrations and update the database schema.

## Rollback Migrations

If you need to rollback the last migration:

```bash
flask db downgrade
```

## View Migration History

View the history of applied migrations:

```bash
flask db history
```

## Migration Best Practices

1. **Create migrations frequently**: Create migrations after each model change, rather than accumulating multiple changes.
2. **Meaningful messages**: Provide meaningful description messages for migrations to understand the content of changes.
3. **Review migration files**: Check generated migration files before applying them to ensure they correctly capture your intentions.
4. **Test migrations**: Test migrations in a test environment before applying them to production.
5. **Backup data**: Backup the database before applying important migrations.

## Starting Migrations with an Existing Database

If you already have an existing database and want to start using migrations:

1. Initialize the migration repository: `flask db init`
2. Create a migration representing the current database state: `flask db migrate -m "initial migration"`
3. Mark the migration as applied (since the database is already in this state): `flask db stamp head`

After that, you can use the normal migration workflow.

## Common Issues

### Migrations Not Detecting Some Changes

Alembic may not detect certain types of changes, such as renaming tables or columns. In such cases, you need to manually edit the migration file.

### Migration Conflicts

If multiple people modify database models and create migrations simultaneously, conflicts may occur. The solution is:

1. Rollback to a common base version
2. Merge the conflicting migration files
3. Reapply the migrations

### Data Migration

If you need to migrate data along with schema changes, you can add data migration code in the `upgrade()` function of the migration file.
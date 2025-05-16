"""
Initialize database migrations for an existing database.

This script:
1. Initializes the Flask-Migrate repository
2. Creates an initial migration based on current models
3. Marks the migration as applied (since the database already exists)

Usage:
    python -m migration_tools.db_migration_setup
"""

import os
import subprocess
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Import your app and db from your application
from app import app, db

def init_migrations():
    """Initialize migrations for an existing database."""
    print("Initializing migrations for existing database...")
    
    # Step 1: Initialize migration repository
    print("\nStep 1: Initializing migration repository...")
    subprocess.run(["flask", "db", "init"], check=True)
    print("Migration repository initialized.")
    
    # Step 2: Create initial migration
    print("\nStep 2: Creating initial migration...")
    subprocess.run(["flask", "db", "migrate", "-m", "Initial migration"], check=True)
    print("Initial migration created.")
    
    # Step 3: Mark migration as applied
    print("\nStep 3: Marking migration as applied...")
    subprocess.run(["flask", "db", "stamp", "head"], check=True)
    print("Migration marked as applied.")
    
    print("\nMigration initialization complete!")
    print("You can now use 'flask db migrate' and 'flask db upgrade' for future changes.")

if __name__ == "__main__":
    # Ensure we're in the application context
    with app.app_context():
        init_migrations()
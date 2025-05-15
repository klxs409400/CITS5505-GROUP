from flask_migrate import Migrate
from app import app, db

migrate = Migrate(app, db)

if __name__ == '__main__':
    print("This file is used to initialize Flask-Migrate.")
    print("To manage migrations, use the following commands:")
    print("flask db init - Create a new migration repository")
    print("flask db migrate -m 'message' - Create a new migration")
    print("flask db upgrade - Apply migrations to the database")
    print("flask db downgrade - Revert the last migration")
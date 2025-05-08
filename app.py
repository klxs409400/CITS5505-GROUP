from flask import Flask
from flask_migrate import Migrate
from flask_login import LoginManager
from models import db, User
import os
import subprocess

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = 'your-secret-key-for-development'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sleeptracker.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)
    
    # Initialize login manager
    login_manager = LoginManager(app)
    login_manager.login_view = 'auth.login'
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # Register blueprints
    from routes.auth import auth
    from routes.main import main
    from routes.sleep import sleep
    from routes.report import report
    from routes.settings import settings
    from routes.profile import profile
    
    app.register_blueprint(auth)
    app.register_blueprint(main)
    app.register_blueprint(sleep)
    app.register_blueprint(report)
    app.register_blueprint(settings)
    app.register_blueprint(profile)
    
    return app

# Create an application instance
app = create_app()

# Check if database exists and initialize if needed
def init_db_if_needed():
    # Check if database file exists
    db_file = 'sleeptracker.db'
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), db_file)
    
    if not os.path.exists(db_path):
        print("Database file not found. Creating database tables...")
        # Create database tables
        with app.app_context():
            db.create_all()
        
        # Initialize test data
        print("Initializing test data with init_db.py...")
        try:
            subprocess.run(["python3", "init_db.py"], check=True)
            print("Test data initialized successfully!")
        except subprocess.CalledProcessError as e:
            print(f"Failed to initialize test data: {e}")
    else:
        print(f"Database file {db_file} already exists.")

# Initialize the database when this module is imported
init_db_if_needed()

if __name__ == '__main__':
    app.run(debug=True)
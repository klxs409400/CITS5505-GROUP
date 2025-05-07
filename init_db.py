import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash
from datetime import datetime

# Create the Flask application instance
app = Flask(__name__)

# Configure Flask using environment variables
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///study_mate.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the SQLAlchemy database object
db = SQLAlchemy(app)

# ----------------------- MODELS -----------------------

# User model definition
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    full_name = db.Column(db.String(120))
    date_joined = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to sleep records
    sleep_records = db.relationship('SleepRecord', backref='user', lazy='dynamic')

    def __repr__(self):
        return f'<User {self.username}>'

# SleepRecord model definition
class SleepRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    bedtime = db.Column(db.DateTime, nullable=False)
    wake_time = db.Column(db.DateTime, nullable=False)
    duration_hours = db.Column(db.Float, nullable=False)
    quality = db.Column(db.String(20))       # e.g., "Excellent", "Good", "Fair", "Poor"
    mood = db.Column(db.String(20))          # e.g., "Refreshed", "Neutral", "Tired", "Exhausted"
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<SleepRecord {self.date}>'

# SleepGoal model definition
class SleepGoal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    target_hours = db.Column(db.Integer, default=8)
    target_minutes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<SleepGoal {self.target_hours}h {self.target_minutes}m>'

# ------------------ DATABASE INITIALIZATION ------------------

with app.app_context():
    # Create all tables
    db.create_all()

    # Add a test user if not already exists
    if not User.query.filter_by(username='johndoe').first():
        test_user = User(
            username='johndoe',
            email='john.doe@example.com',
            full_name='John Doe',
            password_hash=generate_password_hash('password123')
        )
        db.session.add(test_user)

        # Add a sleep goal for the test user
        sleep_goal = SleepGoal(
            user_id=1,  # Assuming this is the first user
            target_hours=8,
            target_minutes=0
        )
        db.session.add(sleep_goal)

        db.session.commit()
        print("Test user created.")
    else:
        print("Test user already exists.")

print("Database initialized.")

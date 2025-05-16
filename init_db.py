import os
import json  # Added import for json
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash
from datetime import datetime, date, time, timedelta  # Added date, time, timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create the Flask application instance
app = Flask(__name__, instance_relative_config=True)

# Configure Flask using environment variables
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///sleeptracker.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the SQLAlchemy database object
db = SQLAlchemy(app)

# ----------------------- MODELS -----------------------

# Model definitions should match models.py exactly
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    full_name = db.Column(db.String(120))
    date_joined = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Additional fields - retrieved from profile.html form
    phone = db.Column(db.String(20))
    location = db.Column(db.String(120))
    timezone = db.Column(db.String(50))
    bio = db.Column(db.Text)
    profile_pic = db.Column(db.String(255), default='images/demo.jpg')  # Store image path
    
    # Relationships
    sleep_records = db.relationship('SleepRecord', backref='user', lazy='dynamic')
    sleep_goals = db.relationship('SleepGoal', backref='user', lazy='dynamic')
    achievements = db.relationship('Achievement', backref='user', lazy='dynamic')
    
    # Relationships for data sharing
    shared_with = db.relationship('DataSharing', 
                                  foreign_keys='DataSharing.owner_id',
                                  backref='owner', 
                                  lazy='dynamic')
    shared_to_me = db.relationship('DataSharing', 
                                   foreign_keys='DataSharing.viewer_id',
                                   backref='viewer', 
                                   lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        from werkzeug.security import check_password_hash
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'


class SleepRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    bedtime = db.Column(db.DateTime, nullable=False)
    wake_time = db.Column(db.DateTime, nullable=False)
    duration_hours = db.Column(db.Float, nullable=False)
    quality = db.Column(db.String(20))       # "Excellent", "Good", "Fair", "Poor"
    mood = db.Column(db.String(20))          # "Refreshed", "Neutral", "Tired", "Exhausted"
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Additional fields - retrieved from recordsleep.html form
    sleep_disturbances = db.Column(db.String(20))
    sleep_aid = db.Column(db.String(20))       # e.g., "Melatonin", "Prescription", "None"
    daytime_dysfunction = db.Column(db.String(20))
    caffeine = db.Column(db.Integer)         # Values: 0, 1, 2
    exercise = db.Column(db.Integer)         # Values: 0, 1, 2
    screen = db.Column(db.Integer)           # Values: 0, 1, 2
    eating = db.Column(db.Integer)           # Values: 0, 1, 2
    sleep_latency = db.Column(db.Integer)
    
    def __repr__(self):
        return f'<SleepRecord {self.date}>'


class SleepGoal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    target_hours = db.Column(db.Integer, default=8)
    target_minutes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<SleepGoal {self.target_hours}h {self.target_minutes}m>'


class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(64), nullable=False)
    description = db.Column(db.String(255))
    icon = db.Column(db.String(64))          # e.g., "fa-star", "fa-moon", etc.
    achieved_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_locked = db.Column(db.Boolean, default=True)
    
    def __repr__(self):
        return f'<Achievement {self.name}>'


class DataSharing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    viewer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('owner_id', 'viewer_id', name='unique_sharing'),)

# ------------------ DATABASE INITIALIZATION ------------------

with app.app_context():
    # Create all tables
    db.create_all()

    # Load test data from JSON file
    try:
        with open('tests/test_data.json', 'r') as f:  # Updated path
            test_users_data = json.load(f)
    except FileNotFoundError:
        print("tests/test_data.json not found. No test users will be created.")  # Updated path
        test_users_data = []
    except json.JSONDecodeError:
        print("Error decoding tests/test_data.json. No test users will be created.")  # Updated path
        test_users_data = []


    for user_data in test_users_data:
        if not User.query.filter_by(username=user_data['username']).first():
            new_user = User(
                username=user_data['username'],
                email=user_data['email'],
                full_name=user_data['full_name'],
                password_hash=generate_password_hash(user_data['password']),
                phone=user_data.get('phone'),
                location=user_data.get('location'),
                timezone=user_data.get('timezone'),
                bio=user_data.get('bio'),
                profile_pic=user_data.get('profile_pic', 'images/demo.jpg')
            )
            db.session.add(new_user)
            db.session.commit()  # Commit user to get ID

            # Add sleep goal
            if 'sleep_goal' in user_data:
                goal_data = user_data['sleep_goal']
                sleep_goal = SleepGoal(
                    user_id=new_user.id,
                    target_hours=goal_data.get('target_hours', 8),
                    target_minutes=goal_data.get('target_minutes', 0)
                )
                db.session.add(sleep_goal)

            # Add achievements
            if 'achievements' in user_data:
                for ach_data in user_data['achievements']:
                    achievement = Achievement(
                        user_id=new_user.id,
                        name=ach_data['name'],
                        description=ach_data.get('description'),
                        icon=ach_data.get('icon'),
                        is_locked=ach_data.get('is_locked', True)
                    )
                    db.session.add(achievement)
            
            # Add sleep records
            if 'sleep_records' in user_data:
                for rec_data in user_data['sleep_records']:
                    record_date = date.today() - timedelta(days=rec_data.get('days_ago', 0))
                    bedtime = datetime.combine(record_date - timedelta(days=1 if rec_data.get('bedtime_hour', 23) >=12 else 0), time(rec_data.get('bedtime_hour', 23), rec_data.get('bedtime_minute', 0)))
                    wake_time = datetime.combine(record_date, time(rec_data.get('wake_time_hour', 7), rec_data.get('wake_time_minute', 0)))
                    
                    sleep_record = SleepRecord(
                        user_id=new_user.id,
                        date=record_date,
                        bedtime=bedtime,
                        wake_time=wake_time,
                        duration_hours=rec_data.get('duration_hours', 0.0),
                        quality=rec_data.get('quality', 'Good'),
                        mood=rec_data.get('mood', 'Neutral'),
                        notes=rec_data.get('notes', ''),
                        sleep_disturbances=rec_data.get('sleep_disturbances'),
                        sleep_aid=rec_data.get('sleep_aid'),
                        daytime_dysfunction=rec_data.get('daytime_dysfunction'),
                        caffeine=rec_data.get('caffeine'),
                        exercise=rec_data.get('exercise'),
                        screen=rec_data.get('screen'),
                        eating=rec_data.get('eating')
                    )
                    db.session.add(sleep_record)
            
            db.session.commit()
            print(f"Test user {user_data['username']} and sample data created.")
        else:
            print(f"Test user {user_data['username']} already exists.")

print("Database initialized.")

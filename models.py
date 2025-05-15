from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
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
        return check_password_hash(self.password_hash, password)


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

    # Add uniqueness constraint
    __table_args__ = (db.UniqueConstraint('user_id', 'date', name='unique_user_date'),)
    
    # Additional fields - retrieved from recordsleep.html form
    sleep_disturbances = db.Column(db.String(20))
    sleep_aid = db.Column(db.String(20))       # e.g., "Melatonin", "Prescription", "None"
    daytime_dysfunction = db.Column(db.String(20))
    caffeine = db.Column(db.Integer)         # Values: 0, 1, 2
    exercise = db.Column(db.Integer)         # Values: 0, 1, 2
    screen = db.Column(db.Integer)           # Values: 0, 1, 2
    eating = db.Column(db.Integer)           # Values: 0, 1, 2
    sleep_latency = db.Column(db.Integer)


class SleepGoal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    target_hours = db.Column(db.Integer, default=8)
    target_minutes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(64), nullable=False)
    description = db.Column(db.String(255))
    icon = db.Column(db.String(64))          # e.g., "fa-star", "fa-moon", etc.
    achieved_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_locked = db.Column(db.Boolean, default=True)


class DataSharing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    viewer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (db.UniqueConstraint('owner_id', 'viewer_id', name='unique_sharing'),)

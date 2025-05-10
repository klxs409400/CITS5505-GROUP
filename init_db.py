import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash
from datetime import datetime

# Create the Flask application instance
app = Flask(__name__, instance_relative_config=True)

# Configure Flask using environment variables
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')
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

    # Add a test user (if not already present)
    if not User.query.filter_by(username='johndoe').first():
        test_user = User(
            username='johndoe',
            email='john.doe@example.com',
            full_name='John Anthony Doe',
            password_hash=generate_password_hash('password123'),
            # Sample data for new fields
            phone='+1 (555) 123-4567',
            location='New York, USA',
            timezone='ET',
            bio='Passionate about optimizing sleep patterns and sharing knowledge about sleep health.',
            profile_pic='images/demo.jpg'
        )
        db.session.add(test_user)
        db.session.commit()  # Commit the user first to retrieve user ID
        
        # Add sleep goal
        sleep_goal = SleepGoal(
            user_id=test_user.id,
            target_hours=8,
            target_minutes=0
        )
        db.session.add(sleep_goal)
        
        # Add some achievements (some unlocked, some locked)
        achievements = [
            Achievement(
                user_id=test_user.id,
                name="Early Bird",
                description="Wake up before 6 AM for 7 days",
                icon="fa-star",
                is_locked=False
            ),
            Achievement(
                user_id=test_user.id,
                name="Sleep Master",
                description="Log 100 nights of excellent sleep",
                icon="fa-moon",
                is_locked=False
            ),
            Achievement(
                user_id=test_user.id,
                name="Perfect Week",
                description="7 days of 8+ hour sleep",
                icon="fa-bed",
                is_locked=True
            )
        ]
        db.session.add_all(achievements)
        
        # Add some sample sleep records
        from datetime import date, time, timedelta
        
        # Create several sample entries
        for i in range(5):
            record_date = date.today() - timedelta(days=i)
            bedtime = datetime.combine(record_date - timedelta(days=1), time(23, 30))
            wake_time = datetime.combine(record_date, time(7, 0))
            
            quality = "Good"
            mood = "Refreshed"
            if i % 2 == 0:
                quality = "Excellent"
            elif i % 3 == 0:
                quality = "Fair"
                mood = "Tired"
            
            sleep_record = SleepRecord(
                user_id=test_user.id,
                date=record_date,
                bedtime=bedtime,
                wake_time=wake_time,
                duration_hours=7.5,
                quality=quality,
                mood=mood,
                notes="Sample sleep record",
                sleep_disturbances="None",
                sleep_aid="None",
                daytime_dysfunction="None",
                caffeine=1,   # Daytime only
                exercise=2,   # Moderate daytime exercise
                screen=1,     # 15–60 min
                eating=0      # Often
            )
            db.session.add(sleep_record)
        
        db.session.commit()
        print("Test user and sample data created.")
    else:
        print("Test user already exists.")

    # Add a second test user (if not already present)
    if not User.query.filter_by(username='janesmith').first():
        second_user = User(
            username='janesmith',
            email='jane.smith@example.com',
            full_name='Jane Elizabeth Smith',
            password_hash=generate_password_hash('password456'),
            # Sample data for new fields
            phone='+1 (555) 987-6543',
            location='San Francisco, USA',
            timezone='PT',
            bio='Sleep researcher and wellness advocate. Looking to improve my sleep quality and helping others do the same.',
            profile_pic='images/demo.jpg'
        )
        db.session.add(second_user)
        db.session.commit()  # Commit the user first to retrieve user ID
        
        # Add sleep goal
        sleep_goal = SleepGoal(
            user_id=second_user.id,
            target_hours=7,
            target_minutes=30
        )
        db.session.add(sleep_goal)
        
        # Add some achievements (some unlocked, some locked)
        achievements = [
            Achievement(
                user_id=second_user.id,
                name="Night Owl",
                description="Log 10 nights of going to bed after midnight but still getting good sleep",
                icon="fa-owl",
                is_locked=False
            ),
            Achievement(
                user_id=second_user.id,
                name="Consistency King",
                description="Go to bed within 30 minutes of your target time for 14 consecutive days",
                icon="fa-crown",
                is_locked=False
            ),
            Achievement(
                user_id=second_user.id,
                name="Sleep Marathon",
                description="Get 9+ hours of sleep for 5 consecutive days",
                icon="fa-running",
                is_locked=True
            )
        ]
        db.session.add_all(achievements)
        
        # Add some sample sleep records
        from datetime import date, time, timedelta
        
        # Create several sample entries
        for i in range(5):
            record_date = date.today() - timedelta(days=i)
            bedtime = datetime.combine(record_date - timedelta(days=1), time(0, 15))  # 12:15 AM
            wake_time = datetime.combine(record_date, time(7, 45))  # 7:45 AM
            
            quality = "Good"
            mood = "Neutral"
            if i % 2 == 0:
                quality = "Excellent"
                mood = "Refreshed"
            elif i % 3 == 0:
                quality = "Fair"
                mood = "Tired"
            
            sleep_record = SleepRecord(
                user_id=second_user.id,
                date=record_date,
                bedtime=bedtime,
                wake_time=wake_time,
                duration_hours=7.5,
                quality=quality,
                mood=mood,
                notes="Jane's sleep record",
                sleep_disturbances="Minor",
                sleep_aid="Melatonin",
                daytime_dysfunction="Slight",
                caffeine=0,   # None
                exercise=1,   # Light exercise
                screen=2,     # >60 min
                eating=1      # Sometimes
            )
            db.session.add(sleep_record)
        
        db.session.commit()
        print("Second test user and sample data created.")
    else:
        print("Second test user already exists.")

    # Add a third test user (if not already present)
    if not User.query.filter_by(username='testdelete').first():
        third_user = User(
            username='testdelete',
            email='delete.test@example.com',
            full_name='Test Delete User',
            password_hash=generate_password_hash('deletetest123'),
            # Sample data for new fields
            phone='+1 (555) 111-2222',
            location='Seattle, USA',
            timezone='PT',
            bio='Test user account created specifically to test the delete user functionality.',
            profile_pic='images/demo.jpg'
        )
        db.session.add(third_user)
        db.session.commit()  # Commit the user first to retrieve user ID
        
        # Add sleep goal
        sleep_goal = SleepGoal(
            user_id=third_user.id,
            target_hours=8,
            target_minutes=30
        )
        db.session.add(sleep_goal)
        
        # Add some achievements (some unlocked, some locked)
        achievements = [
            Achievement(
                user_id=third_user.id,
                name="Test Achievement",
                description="This is a test achievement for the delete user",
                icon="fa-trash",
                is_locked=False
            )
        ]
        db.session.add_all(achievements)
        
        # Add a sample sleep record
        from datetime import date, time, timedelta
        
        # Create a sample entry
        record_date = date.today() - timedelta(days=1)
        bedtime = datetime.combine(record_date - timedelta(days=1), time(22, 30))  # 10:30 PM
        wake_time = datetime.combine(record_date, time(6, 30))  # 6:30 AM
        
        sleep_record = SleepRecord(
            user_id=third_user.id,
            date=record_date,
            bedtime=bedtime,
            wake_time=wake_time,
            duration_hours=8.0,
            quality="Good",
            mood="Refreshed",
            notes="Test delete user's sleep record",
            sleep_disturbances="None",
            sleep_aid="None",
            daytime_dysfunction="None",
            caffeine=0,   # None
            exercise=1,   # Light exercise
            screen=1,     # 15-60 min
            eating=1      # Sometimes
        )
        db.session.add(sleep_record)
        
        db.session.commit()
        print("Third test user for deletion testing created.")
    else:
        print("Third test user already exists.")

print("Database initialized.")

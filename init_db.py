import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash
from datetime import datetime

# Create the Flask application instance
app = Flask(__name__)

# Configure Flask using environment variables
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///sleeptracker.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the SQLAlchemy database object
db = SQLAlchemy(app)

# ----------------------- MODELS -----------------------

# Copy updated model definitions (should match models.py)
# Only the major changes are listed here. For full details, refer to your updated models.py.
class User(db.Model):
    # Original fields remain unchanged...
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    full_name = db.Column(db.String(120))
    date_joined = db.Column(db.DateTime, default=datetime.utcnow)
    
    # New fields
    phone = db.Column(db.String(20))
    location = db.Column(db.String(120))
    timezone = db.Column(db.String(50))
    bio = db.Column(db.Text)
    profile_pic = db.Column(db.String(255), default='images/demo.jpg')
    
    # Relationships
    sleep_records = db.relationship('SleepRecord', backref='user', lazy='dynamic')
    
    def __repr__(self):
        return f'<User {self.username}>'

# Updated SleepRecord model
class SleepRecord(db.Model):
    # Original fields...
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    bedtime = db.Column(db.DateTime, nullable=False)
    wake_time = db.Column(db.DateTime, nullable=False)
    duration_hours = db.Column(db.Float, nullable=False)
    quality = db.Column(db.String(20))
    mood = db.Column(db.String(20))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # New fields
    sleep_disturbances = db.Column(db.String(20))
    sleep_aid = db.Column(db.String(20))
    daytime_dysfunction = db.Column(db.String(20))
    caffeine = db.Column(db.Integer)
    exercise = db.Column(db.Integer)
    screen = db.Column(db.Integer)
    eating = db.Column(db.Integer)
    
    def __repr__(self):
        return f'<SleepRecord {self.date}>'

# SleepGoal model remains unchanged...
class SleepGoal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    target_hours = db.Column(db.Integer, default=8)
    target_minutes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<SleepGoal {self.target_hours}h {self.target_minutes}m>'

# New Achievement model
class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(64), nullable=False)
    description = db.Column(db.String(255))
    icon = db.Column(db.String(64))
    achieved_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_locked = db.Column(db.Boolean, default=True)
    
    def __repr__(self):
        return f'<Achievement {self.name}>'

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

print("Database initialized.")

from flask import Blueprint, render_template, redirect, url_for, request, flash, current_app
from flask_login import login_required, current_user
from models import db, User, Achievement, SleepRecord, SleepGoal
from datetime import datetime, timedelta
from sqlalchemy import func
import os
from werkzeug.utils import secure_filename

profile = Blueprint('profile', __name__)

@profile.route('/profile')
@login_required
def view_profile():
    # Get user achievements
    achievements = Achievement.query.filter_by(user_id=current_user.id).all()
    
    # Count total sleep entries
    total_entries = SleepRecord.query.filter_by(user_id=current_user.id).count()
    
    # Calculate current streak
    # Get dates of all records
    sleep_dates_query = db.session.query(func.date(SleepRecord.date)).filter_by(user_id=current_user.id).order_by(SleepRecord.date.desc()).all()
    sleep_dates = [date[0] for date in sleep_dates_query]
    
    # Calculate streak
    current_streak = 0
    if sleep_dates:
        today = datetime.now().date()
        # Check if there's a record for today or yesterday
        if today in sleep_dates or (today - timedelta(days=1)) in sleep_dates:
            current_streak = 1  # Start with 1 for the most recent day
            check_date = today - timedelta(days=1)
            
            # Count back consecutively
            for i in range(1, len(sleep_dates)):
                if check_date in sleep_dates:
                    current_streak += 1
                    check_date = check_date - timedelta(days=1)
                else:
                    break
    
    # Calculate achievement points (10 points per achievement)
    achievement_points = len([a for a in achievements if not a.is_locked]) * 10
    
    # Calculate goal success rate
    latest_goal = SleepGoal.query.filter_by(user_id=current_user.id).order_by(SleepGoal.created_at.desc()).first()
    goal_success_rate = 0
    
    if latest_goal and total_entries > 0:
        goal_hours = latest_goal.target_hours + (latest_goal.target_minutes / 60)
        
        # Get all records to calculate average
        sleep_records = SleepRecord.query.filter_by(user_id=current_user.id).all()
        if sleep_records:
            total_duration = sum(record.duration_hours for record in sleep_records)
            avg_duration = total_duration / len(sleep_records)
            
            # Goal success rate as percentage of average duration vs goal
            goal_success_rate = int(min(100, (avg_duration / goal_hours) * 100))
    
    # Add some default locked achievements for display if the user doesn't have any
    default_achievements = []
    if not achievements:
        default_achievements = [
            {"name": "Early Bird", "description": "Wake up before 6 AM for 7 days", "icon": "fa-star", "is_locked": True},
            {"name": "Sleep Master", "description": "Log 100 nights of excellent sleep", "icon": "fa-moon", "is_locked": True},
            {"name": "Perfect Week", "description": "7 days of 8+ hour sleep", "icon": "fa-bed", "is_locked": True},
            {"name": "Data Analyst", "description": "Track detailed sleep data for 50 days", "icon": "fa-chart-line", "is_locked": True}
        ]
    
    return render_template(
        'Homepage/profile.html', 
        user=current_user,
        achievements=achievements,
        default_achievements=default_achievements,
        total_entries=total_entries,
        current_streak=current_streak,
        achievement_points=achievement_points,
        goal_success_rate=goal_success_rate
    )

@profile.route('/profile/edit', methods=['GET', 'POST'])
@login_required
def edit_profile():
    if request.method == 'POST':
        # Update user profile
        current_user.full_name = request.form['editFullName']
        current_user.email = request.form['editEmail']
        current_user.phone = request.form['editPhone']
        current_user.location = request.form['editLocation']
        current_user.timezone = request.form['editTimezone']
        current_user.bio = request.form['editBio']
        
        # Handle profile image upload (if provided)
        if 'editProfilePic' in request.files and request.files['editProfilePic'].filename:
            file = request.files['editProfilePic']
            # Secure the filename
            filename = secure_filename(file.filename)
            # Create a unique filename to avoid overwrites
            unique_filename = f"{current_user.username}_{datetime.now().strftime('%Y%m%d%H%M%S')}_{filename}"
            # Save the file
            file_path = os.path.join(current_app.static_folder, 'images', unique_filename)
            file.save(file_path)
            # Update the user's profile picture field (store relative path)
            current_user.profile_pic = f'images/{unique_filename}'
        
        db.session.commit()
        
        flash('Your profile has been updated successfully.')
        return redirect(url_for('profile.view_profile'))
    
    return redirect(url_for('profile.view_profile'))
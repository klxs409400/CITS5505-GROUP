from flask import Blueprint, render_template, redirect, url_for, request, flash, current_app
from flask_login import login_required, current_user
from models import db, User, Achievement, SleepRecord, SleepGoal
from datetime import datetime, timedelta
from sqlalchemy import func
import os
from werkzeug.utils import secure_filename
from services.achievement_service import AchievementService  # Import achievement service

profile = Blueprint('profile', __name__)

@profile.route('/profile')
@login_required
def view_profile():
    # Check achievements first to ensure they're up to date
    AchievementService.check_achievements(current_user.id)
    
    # Get user achievements
    achievements = Achievement.query.filter_by(user_id=current_user.id).all()
    
    # Add some default locked achievements for display if the user doesn't have any
    default_achievements = []
    if not achievements:
        default_achievement_names = [
            "Early Bird", "Sleep Master", "Perfect Week", 
            "Night Owl", "Consistency King", "Sleep Marathon"
        ]
        
        for name in default_achievement_names:
            default_achievements.append({
                "name": name,
                "description": AchievementService.get_description(name),
                "icon": AchievementService.get_icon(name),
                "is_locked": True
            })
    
    return render_template(
        'Homepage/profile.html', 
        user=current_user,
        achievements=achievements,
        default_achievements=default_achievements
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
from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_required, current_user
from models import db, User, Achievement
from datetime import datetime

profile = Blueprint('profile', __name__)

@profile.route('/profile')
@login_required
def view_profile():
    # Get user achievements
    achievements = Achievement.query.filter_by(user_id=current_user.id).all()
    
    return render_template('profile.html', user=current_user, achievements=achievements)

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
            # Code to save image file would go here
            pass
        
        db.session.commit()
        
        flash('Your profile has been updated successfully.')
        return redirect(url_for('profile.view_profile'))
    
    return render_template('profile.html', user=current_user)
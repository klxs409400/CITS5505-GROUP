from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_required, current_user
from models import db
from werkzeug.security import generate_password_hash

settings = Blueprint('settings', __name__)

@settings.route('/settings')
@login_required
def view_settings():
    return render_template('Settings/settings.html', user=current_user)

@settings.route('/settings/update-password', methods=['POST'])
@login_required
def update_password():
    new_password = request.form['newPassword']
    
    # Update passwords
    current_user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    
    flash('Password updated successfully!')
    return redirect(url_for('settings.view_settings'))
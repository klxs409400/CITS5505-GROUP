from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from flask_login import login_required, current_user
from models import db, User, DataSharing
from werkzeug.security import generate_password_hash, check_password_hash

settings = Blueprint('settings', __name__)

@settings.route('/settings')
@login_required
def view_settings():
    # Get list of users that the current user is sharing with
    shared_users = db.session.query(User).join(
        DataSharing, DataSharing.viewer_id == User.id
    ).filter(DataSharing.owner_id == current_user.id).all()
    
    return render_template('Settings/settings.html', user=current_user, shared_users=shared_users)

@settings.route('/settings/update-password', methods=['POST'])
@login_required
def update_password():
    current_password = request.form.get('currentPassword')
    new_password = request.form.get('newPassword')
    confirm_password = request.form.get('confirmPassword')
    
    # Validate form inputs are complete
    if not current_password or not new_password or not confirm_password:
        flash('All password fields are required', 'danger')
        return redirect(url_for('settings.view_settings'))
    
    # Verify current password is correct
    if not check_password_hash(current_user.password_hash, current_password):
        flash('Current password is incorrect', 'danger')
        return redirect(url_for('settings.view_settings'))
    
    # Verify new password and confirmation match
    if new_password != confirm_password:
        flash('New password and confirmation do not match', 'danger')
        return redirect(url_for('settings.view_settings'))
    
    # Update password - removed length validation
    current_user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    
    flash('Password updated successfully!', 'success')
    return redirect(url_for('settings.view_settings'))

@settings.route('/settings/share', methods=['POST'])
@login_required
def share_data():
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({'success': False, 'message': 'Email is required'}), 400
    
    # Find user by email
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    # Check if user is trying to share with themselves
    if user.id == current_user.id:
        return jsonify({'success': False, 'message': 'Cannot share with yourself'}), 400
    
    # Check if already sharing with this user
    existing_share = DataSharing.query.filter_by(
        owner_id=current_user.id, 
        viewer_id=user.id
    ).first()
    
    if existing_share:
        return jsonify({'success': False, 'message': 'Already sharing with this user'}), 400
    
    # Create new sharing record
    new_share = DataSharing(owner_id=current_user.id, viewer_id=user.id)
    db.session.add(new_share)
    db.session.commit()
    
    return jsonify({
        'success': True, 
        'message': 'Sharing enabled successfully',
        'user': {
            'id': user.id,
            'email': user.email,
            'username': user.username
        }
    })

@settings.route('/settings/revoke', methods=['POST'])
@login_required
def revoke_sharing():
    data = request.json
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'success': False, 'message': 'User ID is required'}), 400
    
    # Find and delete sharing record
    sharing_record = DataSharing.query.filter_by(
        owner_id=current_user.id, 
        viewer_id=user_id
    ).first()
    
    if not sharing_record:
        return jsonify({'success': False, 'message': 'Sharing record not found'}), 404
    
    db.session.delete(sharing_record)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Sharing revoked successfully'})

@settings.route('/settings/shared-users')
@login_required
def get_shared_users():
    shared_users = db.session.query(User).join(
        DataSharing, DataSharing.viewer_id == User.id
    ).filter(DataSharing.owner_id == current_user.id).all()
    
    users_data = [{
        'id': user.id,
        'email': user.email,
        'username': user.username
    } for user in shared_users]
    
    return jsonify({'success': True, 'users': users_data})
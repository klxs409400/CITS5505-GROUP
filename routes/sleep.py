# Import necessary Flask and Flask-Login components
from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from flask_login import login_required, current_user
from models import db, SleepRecord
from datetime import datetime, timedelta

# Create a Blueprint for sleep-related routes
sleep = Blueprint('sleep', __name__)

# Route to handle sleep record creation (GET to display form, POST to save data)
@sleep.route('/record-sleep', methods=['GET', 'POST'])
@login_required
def record_sleep():
    if request.method == 'POST':
        # Extract form data
        date_str = request.form['sleepDate']
        sleep_time_str = request.form['sleepTime']
        wake_time_str = request.form['wakeTime']
        
        try:
            # Parse date and time inputs
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            sleep_time = datetime.strptime(sleep_time_str, '%H:%M').time()
            wake_time = datetime.strptime(wake_time_str, '%H:%M').time()
            
            # Combine date and time into datetime objects
            sleep_datetime = datetime.combine(date, sleep_time)
            wake_datetime = datetime.combine(date, wake_time)
            
            # If wake time is earlier than sleep time, assume next day wake-up
            if wake_datetime <= sleep_datetime:
                wake_datetime = datetime.combine(date + timedelta(days=1), wake_time)
            
            # Calculate sleep duration in hours
            duration = (wake_datetime - sleep_datetime).total_seconds() / 3600
            
            # Create and save new sleep record
            sleep_record = SleepRecord(
                user_id=current_user.id,
                date=date,
                bedtime=sleep_datetime,
                wake_time=wake_datetime,
                duration_hours=duration,
                quality=request.form.get('quality', 'Good'),  # Default: Good
                mood=request.form.get('mood', 'Neutral'),      # Default: Neutral
                notes=request.form.get('notes', '')
            )
            
            db.session.add(sleep_record)
            db.session.commit()
            
            flash('Sleep record saved successfully!')
            return redirect(url_for('main.dashboard'))
            
        except Exception as e:
            flash(f'Error saving sleep record: {str(e)}')
            return redirect(url_for('sleep.record_sleep'))
    
    # Render sleep record form
    return render_template('Homepage/recordsleep.html')

# Route to display user's sleep history
@sleep.route('/sleep-history')
@login_required
def sleep_history():
    # Retrieve all sleep records for the current user, newest first
    sleep_records = SleepRecord.query.filter_by(user_id=current_user.id).order_by(SleepRecord.date.desc()).all()
    
    return render_template(
        'Historical/historical.html',
        sleep_records=sleep_records
    )

# Route to handle deletion of a sleep record
@sleep.route('/delete-sleep/<int:record_id>', methods=['POST'])
@login_required
def delete_sleep(record_id):
    # Retrieve the record or return 404 if not found
    record = SleepRecord.query.get_or_404(record_id)
    
    # Ensure that the record belongs to the current user
    if record.user_id != current_user.id:
        flash('You do not have permission to delete this record.')
        return redirect(url_for('sleep.sleep_history'))
    
    # Delete and commit the record
    db.session.delete(record)
    db.session.commit()
    
    flash('Sleep record deleted successfully.')
    return redirect(url_for('sleep.sleep_history'))

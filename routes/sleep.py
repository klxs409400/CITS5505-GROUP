from flask import Blueprint, render_template, redirect, url_for, request, flash, jsonify
from flask_login import login_required, current_user
from models import db, SleepRecord, SleepGoal
from datetime import datetime, timedelta
from collections import Counter

# Create a Blueprint for sleep-related routes
sleep = Blueprint('sleep', __name__)

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
                notes=request.form.get('notes', ''),
                
                # Process additional form fields
                sleep_disturbances=request.form.get('sleepDisturbances', 'None'),
                sleep_aid=request.form.get('sleepAid', 'None'),
                daytime_dysfunction=request.form.get('daytimeDysfunction', 'None'),
                
                # Process numeric fields, with defaults
                caffeine=int(request.form.get('caffeine', 1)),
                exercise=int(request.form.get('exercise', 1)),
                screen=int(request.form.get('screen', 1)),
                eating=int(request.form.get('eating', 1)),
                sleep_latency=int(request.form.get('sleep_latency', 3))
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

# Route to display user's sleep history with dynamic data
@sleep.route('/sleep-history')
@login_required
def sleep_history():
    # Retrieve all sleep records for the current user, sorted by newest first
    sleep_records = SleepRecord.query.filter_by(user_id=current_user.id).order_by(SleepRecord.date.desc()).all()
    
    # Calculate statistics based on the user's sleep records
    avg_duration = 0
    most_common_quality = "Good"
    usual_bedtime = "23:00"
    usual_waketime = "07:00"
    
    if sleep_records:
        # Calculate average sleep duration
        total_duration = sum(record.duration_hours for record in sleep_records)
        avg_duration = round(total_duration / len(sleep_records), 1)
        
        # Find the most common sleep quality
        quality_counts = {}
        for record in sleep_records:
            quality_counts[record.quality] = quality_counts.get(record.quality, 0) + 1
        most_common_quality = max(quality_counts.items(), key=lambda x: x[1])[0] if quality_counts else "Good"
        
        # Calculate the usual bedtime and wake time
        bedtimes = [record.bedtime.strftime('%H:%M') for record in sleep_records]
        waketimes = [record.wake_time.strftime('%H:%M') for record in sleep_records]
        
        from collections import Counter
        usual_bedtime = Counter(bedtimes).most_common(1)[0][0] if bedtimes else "23:00"
        usual_waketime = Counter(waketimes).most_common(1)[0][0] if waketimes else "07:00"
    
    # Add the current date and timedelta for template usage
    now = datetime.now()
    
    # Retrieve the current user's sleep goal
    sleep_goal = SleepGoal.query.filter_by(user_id=current_user.id).first()
    goal_hours = 8.0  # Default value
    
    if sleep_goal:
        goal_hours = sleep_goal.target_hours + (sleep_goal.target_minutes / 60)
    
    # Pass all data to the template
    return render_template(
        'Historical/historical.html',
        sleep_records=sleep_records,
        avg_duration=avg_duration,
        most_common_quality=most_common_quality,
        usual_bedtime=usual_bedtime,
        usual_waketime=usual_waketime,
        now=now,
        timedelta=timedelta,
        sleep_goal_hours=goal_hours
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

# New route: Edit a sleep record
@sleep.route('/edit-sleep/<int:record_id>', methods=['POST'])
@login_required
def edit_sleep(record_id):
    # Retrieve the record or return 404 if not found
    record = SleepRecord.query.get_or_404(record_id)
    
    # Ensure that the record belongs to the current user
    if record.user_id != current_user.id:
        flash('You do not have permission to edit this record.')
        return redirect(url_for('sleep.sleep_history'))
    
    try:
        # Extract form data
        date_str = request.form['sleepDate']
        sleep_time_str = request.form['sleepTime']
        wake_time_str = request.form['wakeTime']
        
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
        
        # Update the record
        record.date = date
        record.bedtime = sleep_datetime
        record.wake_time = wake_datetime
        record.duration_hours = duration
        record.quality = request.form.get('quality', 'Good')
        record.mood = request.form.get('mood', 'Neutral')
        record.notes = request.form.get('notes', '')
        
        # Update additional fields if present in the form
        if 'sleepDisturbances' in request.form:
            record.sleep_disturbances = request.form.get('sleepDisturbances')
        if 'sleepAid' in request.form:
            record.sleep_aid = request.form.get('sleepAid')
        if 'daytimeDysfunction' in request.form:
            record.daytime_dysfunction = request.form.get('daytimeDysfunction')
        
        # Update numeric fields if present
        if 'caffeine' in request.form:
            record.caffeine = int(request.form.get('caffeine'))
        if 'exercise' in request.form:
            record.exercise = int(request.form.get('exercise'))
        if 'screen' in request.form:
            record.screen = int(request.form.get('screen'))
        if 'eating' in request.form:
            record.eating = int(request.form.get('eating'))
        if 'sleep_latency' in request.form:
            record.sleep_latency = int(request.form.get('sleep_latency'))
        
        # Save changes
        db.session.commit()
        flash('Sleep record updated successfully!')
        
    except Exception as e:
        db.session.rollback()
        flash(f'Error updating sleep record: {str(e)}')
    
    return redirect(url_for('sleep.sleep_history'))

@sleep.route('/update-sleep-goal', methods=['POST'])
@login_required
def update_sleep_goal():
    try:
        # Get sleep goal values from the form
        sleep_goal_hours = int(request.form.get('sleepGoalHours', 8))
        sleep_goal_minutes = int(request.form.get('sleepGoalMinutes', 0))
        
        # Find the current user's sleep goal record
        goal = SleepGoal.query.filter_by(user_id=current_user.id).first()
        
        # If no existing goal, create a new one
        if not goal:
            goal = SleepGoal(
                user_id=current_user.id,
                target_hours=sleep_goal_hours,
                target_minutes=sleep_goal_minutes
            )
            db.session.add(goal)
        else:
            # Update the existing goal
            goal.target_hours = sleep_goal_hours
            goal.target_minutes = sleep_goal_minutes
        
        # Save to the database
        db.session.commit()
        flash('Sleep goal updated successfully!')
    except Exception as e:
        db.session.rollback()
        flash(f'Error updating sleep goal: {str(e)}')
    
    # Redirect back to the sleep history page
    return redirect(url_for('sleep.sleep_history'))

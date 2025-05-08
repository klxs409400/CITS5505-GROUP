from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_required, current_user
from models import db, SleepRecord, SleepGoal
from datetime import datetime, date, time, timedelta

sleep = Blueprint('sleep', __name__)

@sleep.route('/record-sleep', methods=['GET', 'POST'])
@login_required
def record_sleep():
    """
    Route to record a new sleep entry. Handles both the display form (GET)
    and form submission (POST).
    """
    if request.method == 'POST':
        try:
            # Get form data
            sleep_date = request.form.get('sleepDate')
            sleep_time = request.form.get('sleepTime')
            wake_time = request.form.get('wakeTime')
            
            # Get duration components
            sleep_duration_hours = int(request.form.get('sleepDurationHours', 0))
            sleep_duration_minutes = int(request.form.get('sleepDurationMinutes', 0))
            duration_hours = sleep_duration_hours + (sleep_duration_minutes / 60)
            
            # Get sleep quality and mood
            quality = request.form.get('quality')
            mood = request.form.get('mood')
            
            # Get other sleep parameters
            sleep_disturbances = request.form.get('sleepDisturbances')
            sleep_aid = request.form.get('sleepAid')
            daytime_dysfunction = request.form.get('daytimeDysfunction')
            caffeine = int(request.form.get('caffeine', 0))
            exercise = int(request.form.get('exercise', 0))
            screen = int(request.form.get('screen', 0))
            eating = int(request.form.get('eating', 0))
            sleep_latency = int(request.form.get('sleep_latency', 0))
            notes = request.form.get('notes', '')
            
            # Convert strings to datetime objects
            sleep_date_obj = datetime.strptime(sleep_date, '%Y-%m-%d').date()
            sleep_time_obj = datetime.strptime(sleep_time, '%H:%M').time()
            wake_time_obj = datetime.strptime(wake_time, '%H:%M').time()
            
            # Combine date and time into datetime objects
            # If wake time is earlier than sleep time, it's the next day
            if wake_time_obj < sleep_time_obj:
                wake_datetime = datetime.combine(sleep_date_obj + timedelta(days=1), wake_time_obj)
            else:
                wake_datetime = datetime.combine(sleep_date_obj, wake_time_obj)
                
            sleep_datetime = datetime.combine(sleep_date_obj, sleep_time_obj)
            
            # Create sleep record
            sleep_record = SleepRecord(
                user_id=current_user.id,
                date=sleep_date_obj,
                bedtime=sleep_datetime,
                wake_time=wake_datetime,
                duration_hours=duration_hours,
                quality=quality,
                mood=mood,
                notes=notes,
                sleep_disturbances=sleep_disturbances,
                sleep_aid=sleep_aid,
                daytime_dysfunction=daytime_dysfunction,
                caffeine=caffeine,
                exercise=exercise,
                screen=screen,
                eating=eating,
                sleep_latency=sleep_latency
            )
            
            # Add and commit to database
            db.session.add(sleep_record)
            db.session.commit()
            
            flash('Sleep record saved successfully!', 'success')
            return redirect(url_for('sleep.sleep_history'))
            
        except Exception as e:
            db.session.rollback()
            print(f"Error saving sleep record: {str(e)}")
            flash(f'Error saving sleep record: {str(e)}', 'danger')
            return render_template('Homepage/recordsleep.html')
    
    return render_template('Homepage/recordsleep.html')

@sleep.route('/sleep-history')
@login_required
def sleep_history():
    """
    Route to display sleep history. Shows all sleep records for the current user
    and calculates various statistics.
    """
    # Get all sleep records for the current user
    sleep_records = SleepRecord.query.filter_by(user_id=current_user.id).order_by(SleepRecord.date.desc()).all()
    
    # Calculate statistics for display
    avg_duration = 0
    most_common_quality = "Good"
    usual_bedtime = "23:00"
    usual_waketime = "07:00"
    sleep_goal_hours = 8.0
    
    if sleep_records:
        # Calculate average sleep duration
        total_duration = sum(record.duration_hours for record in sleep_records)
        avg_duration = round(total_duration / len(sleep_records), 1)
        
        # Get the most common sleep quality
        quality_counts = {"Excellent": 0, "Good": 0, "Fair": 0, "Poor": 0}
        for record in sleep_records:
            quality_counts[record.quality] = quality_counts.get(record.quality, 0) + 1
        most_common_quality = max(quality_counts.items(), key=lambda x: x[1])[0]
        
        # Calculate usual bedtime and wake time
        bedtimes = [record.bedtime.strftime('%H:%M') for record in sleep_records]
        waketimes = [record.wake_time.strftime('%H:%M') for record in sleep_records]
        
        # Get the median time
        bedtimes.sort()
        waketimes.sort()
        usual_bedtime = bedtimes[len(bedtimes) // 2]
        usual_waketime = waketimes[len(waketimes) // 2]
    
    # Get sleep goal
    sleep_goal = SleepGoal.query.filter_by(user_id=current_user.id).order_by(SleepGoal.created_at.desc()).first()
    if sleep_goal:
        sleep_goal_hours = sleep_goal.target_hours + (sleep_goal.target_minutes / 60)
    
    return render_template('Historical/historical.html',
                          sleep_records=sleep_records,
                          avg_duration=avg_duration,
                          most_common_quality=most_common_quality,
                          usual_bedtime=usual_bedtime,
                          usual_waketime=usual_waketime,
                          sleep_goal_hours=sleep_goal_hours,
                          now=datetime.now(),
                          timedelta=timedelta)

@sleep.route('/edit-sleep/<int:record_id>', methods=['POST'])
@login_required
def edit_sleep(record_id):
    """
    Route to edit an existing sleep record. Only handles form submission (POST).
    """
    sleep_record = SleepRecord.query.filter_by(id=record_id, user_id=current_user.id).first_or_404()
    
    if request.method == 'POST':
        try:
            # Get form data
            sleep_date = request.form.get('sleepDate')
            sleep_time = request.form.get('sleepTime')
            wake_time = request.form.get('wakeTime')
            quality = request.form.get('quality')
            mood = request.form.get('mood')
            notes = request.form.get('notes', '')
            
            # Convert strings to datetime objects
            sleep_date_obj = datetime.strptime(sleep_date, '%Y-%m-%d').date()
            sleep_time_obj = datetime.strptime(sleep_time, '%H:%M').time()
            wake_time_obj = datetime.strptime(wake_time, '%H:%M').time()
            
            # Combine date and time into datetime objects
            # If wake time is earlier than sleep time, it's the next day
            if wake_time_obj < sleep_time_obj:
                wake_datetime = datetime.combine(sleep_date_obj + timedelta(days=1), wake_time_obj)
            else:
                wake_datetime = datetime.combine(sleep_date_obj, wake_time_obj)
                
            sleep_datetime = datetime.combine(sleep_date_obj, sleep_time_obj)
            
            # Calculate duration in hours
            duration_seconds = (wake_datetime - sleep_datetime).total_seconds()
            duration_hours = duration_seconds / 3600
            
            # Update record
            sleep_record.date = sleep_date_obj
            sleep_record.bedtime = sleep_datetime
            sleep_record.wake_time = wake_datetime
            sleep_record.duration_hours = duration_hours
            sleep_record.quality = quality
            sleep_record.mood = mood
            sleep_record.notes = notes
            
            db.session.commit()
            flash('Sleep record updated successfully!', 'success')
            
        except Exception as e:
            db.session.rollback()
            print(f"Error updating sleep record: {str(e)}")
            flash(f'Error updating sleep record: {str(e)}', 'danger')
            
    return redirect(url_for('sleep.sleep_history'))

@sleep.route('/delete-sleep/<int:record_id>', methods=['POST'])
@login_required
def delete_sleep(record_id):
    """
    Route to delete a sleep record. Only handles form submission (POST).
    """
    sleep_record = SleepRecord.query.filter_by(id=record_id, user_id=current_user.id).first_or_404()
    
    try:
        db.session.delete(sleep_record)
        db.session.commit()
        flash('Sleep record deleted successfully!', 'success')
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting sleep record: {str(e)}")
        flash(f'Error deleting sleep record: {str(e)}', 'danger')
        
    return redirect(url_for('sleep.sleep_history'))

@sleep.route('/update-sleep-goal', methods=['POST'])
@login_required
def update_sleep_goal():
    """
    Route to update sleep goal. Only handles form submission (POST).
    """
    if request.method == 'POST':
        try:
            # Get form data
            sleep_goal_hours = int(request.form.get('sleepGoalHours', 8))
            sleep_goal_minutes = int(request.form.get('sleepGoalMinutes', 0))
            
            # Create new sleep goal
            sleep_goal = SleepGoal(
                user_id=current_user.id,
                target_hours=sleep_goal_hours,
                target_minutes=sleep_goal_minutes
            )
            
            db.session.add(sleep_goal)
            db.session.commit()
            
            flash('Sleep goal updated successfully!', 'success')
            
        except Exception as e:
            db.session.rollback()
            print(f"Error updating sleep goal: {str(e)}")
            flash(f'Error updating sleep goal: {str(e)}', 'danger')
            
    # Redirect back to the referring page
    return redirect(request.referrer or url_for('sleep.sleep_history'))
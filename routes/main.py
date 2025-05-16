from flask import Blueprint, render_template, redirect, url_for, request
from flask_login import login_required, current_user
from models import SleepRecord, SleepGoal
from datetime import datetime, timedelta

main = Blueprint('main', __name__)

@main.route('/')
def index():
    """
    Home page route. If user is logged in, redirects to dashboard unless 
    force_index parameter is present.
    """
    # Add a query parameter to allow viewing of the homepage even if you are logged in
    if current_user.is_authenticated and 'force_index' not in request.args:
        return redirect(url_for('main.dashboard'))
    return render_template('Homepage/index.html')

@main.route('/dashboard')
@login_required
def dashboard():
    """
    Dashboard route. Shows sleep statistics and recent records.
    """
    # Print debug header
    print("\n*** DASHBOARD DEBUG ***")
    
    # Retrieve recent records for display
    recent_records = SleepRecord.query.filter_by(user_id=current_user.id).order_by(SleepRecord.date.desc()).limit(5).all()
    
    # Retrieve all records for statistics
    sleep_records = SleepRecord.query.filter_by(user_id=current_user.id).order_by(SleepRecord.date.desc()).all()
    
    # Print the number of retrieved records
    print(f"Total records: {len(sleep_records)}")
    
    # Default values
    avg_duration = "0.0"
    quality_change = "0%"
    goal_achievement = "0/30"
    usual_bedtime = "23:00"
    sleep_quality_percentage = "0%"
    
    # Calculate sleep quality percentages
    quality_counts = {"excellent": 0, "good": 0, "fair": 0, "poor": 0}
    total_records = len(sleep_records)

    if total_records > 0:
        # Calculate average duration
        total_duration = sum(record.duration_hours for record in sleep_records)
        avg_duration = f"{(total_duration / total_records):.1f} hrs"
        
        # Count quality categories
        for record in sleep_records:
            # Print the quality value of each record
            print(f"Record quality: '{record.quality}'")
            
            quality = record.quality.lower().strip() if record.quality else ""
            if quality in quality_counts:
                quality_counts[quality] += 1
            else:
                print(f"Unknown quality value: '{record.quality}' (lowercase: '{quality}')")
        
        # Convert counts to percentages
        quality_stats = {
            "excellent": int((quality_counts["excellent"] / total_records) * 100),
            "good": int((quality_counts["good"] / total_records) * 100),
            "fair": int((quality_counts["fair"] / total_records) * 100),
            "poor": int((quality_counts["poor"] / total_records) * 100)
        }
        
        # Print quality counts and percentages
        print(f"Quality counts: {quality_counts}")
        print(f"Quality stats: {quality_stats}")
        
        # Calculate quality change (percentage of excellent + good sleeps)
        sleep_quality_percentage = f"{quality_stats['excellent'] + quality_stats['good']}%"
        print(f"Sleep quality percentage: {sleep_quality_percentage}")
        quality_change = "+5%"  # Placeholder - would need more logic for accurate calculation
    
        # Get usual bedtime from most recent records
        if recent_records:
            usual_bedtime = recent_records[0].bedtime.strftime('%H:%M')
    
        # Goal achievement - count days that met sleep goal in the last 30 days
        # Get the current sleep goal
        sleep_goal = SleepGoal.query.filter_by(user_id=current_user.id).order_by(SleepGoal.created_at.desc()).first()
        if sleep_goal:
            # Calculate goal in hours
            goal_hours = sleep_goal.target_hours + (sleep_goal.target_minutes / 60)
            
            # Get records from the last 30 days
            today = datetime.now().date()
            cutoff_date = today - timedelta(days=30)
            recent_records_30days = [r for r in sleep_records if r.date >= cutoff_date]
            
            # Count days where sleep duration met or exceeded the goal
            achieved_days = sum(1 for r in recent_records_30days if r.duration_hours >= goal_hours)
            
            # Format the achievement string
            goal_achievement = f"{achieved_days}/30"
            
            print(f"Goal achievement calculation: goal={goal_hours}h, achieved={achieved_days} days out of {len(recent_records_30days)} records in last 30 days")
        else:
            goal_achievement = "0/30"
            print("No sleep goal found, defaulting to 0/30")

    else:
        quality_stats = {"excellent": 0, "good": 0, "fair": 0, "poor": 0}
        avg_duration = "0.0 hrs"
    
    return render_template(
        'Homepage/dashboard.html',
        recent_records=recent_records,
        sleep_records=sleep_records[:7],  # Last 7 days for weekly view
        quality_stats=quality_stats,
        avg_duration=avg_duration,
        quality_change=quality_change,
        goal_achievement=goal_achievement,
        usual_bedtime=usual_bedtime,
        sleep_quality_percentage=sleep_quality_percentage,
        now=datetime.now(),
        timedelta=timedelta
    )

@main.route('/demo')
def demo():
    """
    Demo route. Shows sample sleep data for demonstration purposes.
    """
    quality_stats = {"excellent": 25, "good": 45, "fair": 20, "poor": 10}
    now = datetime.now()
    
    sleep_records = []
    for i in range(7):  
        record_date = now - timedelta(days=i)
        quality = "Good"
        if i % 4 == 0:
            quality = "Excellent"
        elif i % 4 == 1:
            quality = "Good"
        elif i % 4 == 2:
            quality = "Fair"
        else:
            quality = "Poor"
            
        sleep_records.append({
            "date": record_date,
            "duration_hours": 7.5 - (i % 3) * 0.5,
            "quality": quality
        })
    
    return render_template(
        'Homepage/demo.html', 
        sleep_records=sleep_records,
        quality_stats=quality_stats,
        now=now,
        timedelta=timedelta
    )
from flask import Blueprint, render_template, redirect, url_for
from flask_login import login_required, current_user
from models import SleepRecord
from datetime import datetime, timedelta
from flask import Blueprint, render_template, redirect, url_for, request

main = Blueprint('main', __name__)

@main.route('/')
@main.route('/')
def index():
    # Add a query parameter to allow viewing of the homepage even if you are logged in
    if current_user.is_authenticated and 'force_index' not in request.args:
        return redirect(url_for('main.dashboard'))
    return render_template('Homepage/index.html')

@main.route('/dashboard')
@login_required
def dashboard():
    # Retrieve recent records
    recent_records = SleepRecord.query.filter_by(user_id=current_user.id).order_by(SleepRecord.date.desc()).limit(5).all()
    
    # Retrieve all records for statistics
    sleep_records = SleepRecord.query.filter_by(user_id=current_user.id).order_by(SleepRecord.date.desc()).all()
    
    # Calculate sleep quality percentages
    quality_counts = {"excellent": 0, "good": 0, "fair": 0, "poor": 0}
    total_records = len(sleep_records)

    if total_records > 0:
        for record in sleep_records:
            quality = record.quality.lower()
            if quality in quality_counts:
                quality_counts[quality] += 1
        
        # Convert to percentages
        quality_stats = {
            "excellent": int((quality_counts["excellent"] / total_records) * 100) if total_records > 0 else 0,
            "good": int((quality_counts["good"] / total_records) * 100) if total_records > 0 else 0,
            "fair": int((quality_counts["fair"] / total_records) * 100) if total_records > 0 else 0,
            "poor": int((quality_counts["poor"] / total_records) * 100) if total_records > 0 else 0
        }
    else:
        quality_stats = {"excellent": 0, "good": 0, "fair": 0, "poor": 0}
    
    return render_template(
        'Homepage/dashboard.html',
        recent_records=recent_records,
        sleep_records=sleep_records,
        quality_stats=quality_stats,
        now=datetime.now(),
        timedelta=timedelta
    )

@main.route('/demo')
def demo():

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

from flask import Blueprint, render_template, abort, request
from flask_login import login_required, current_user
from flask import jsonify
from models import SleepRecord, db, User, DataSharing
from datetime import datetime, timedelta

report = Blueprint('report', __name__)

@report.route('/report')
@login_required
def view_report():
    # Check if 'classic' parameter is present
    if request.args.get('classic') == 'true':
        # Show the original report page
        return render_template('Reports/report.html')
    else:
        # Show the visual report page by default
        return render_template('Reports/visual_report.html')

@report.route('/visual-report')
@login_required
def view_visual_report():
    """Render the visual report page with enhanced data visualizations"""
    return render_template('Reports/visual_report.html')

def score_mapping(record):
    quality_map = {"Very good": 3, "Fair": 2, "Poor": 1, "Very poor": 0}
    latency_map = {3: 3, 1: 1, 0: 0}
    duration_map = lambda h: 3 if h >= 7 else 2 if h >= 6 else 1 if h >= 5 else 0
    efficiency_map = lambda e: 3 if e >= 85 else 2 if e >= 75 else 1 if e >= 65 else 0
    disturbances_map = {"None": 3, "Occasionally": 2, "Often": 1, "Frequent": 0}
    sleep_aid_map = {3: 3, 2: 2, 1: 1, 0: 0}
    dysfunction_map = {"None": 3, "Sometimes": 2, "Often": 1, "Severe": 0}

    try:
        total_time = (record.wake_time - record.bedtime).total_seconds() / 3600
        efficiency = (record.duration_hours / total_time) * 100 if total_time > 0 else 0
    except Exception:
        efficiency = 0

    return (
        quality_map.get(record.quality, 0)
        + latency_map.get(record.sleep_latency, 0)
        + duration_map(record.duration_hours)
        + efficiency_map(efficiency)
        + disturbances_map.get(record.sleep_disturbances, 0)
        + sleep_aid_map.get(record.sleep_aid, 0)
        + dysfunction_map.get(record.daytime_dysfunction, 0)
    )

@report.route('/shared-report/<int:user_id>')
@login_required
def view_shared_report(user_id):
    # Check if the current user has permission to see this user's data
    sharing = DataSharing.query.filter_by(
        owner_id=user_id, 
        viewer_id=current_user.id
    ).first()
    
    if not sharing:
        abort(403)  # Forbidden access
    
    # Get the user whose data we're viewing
    user = User.query.get_or_404(user_id)
    
    return render_template('Reports/shared_report.html', shared_user=user)


@report.route('/api/sleep/duration')
@login_required
def get_sleep_duration():
    today = datetime.today().date()
    week_ago = today - timedelta(days=6)

    records = (
        db.session.query(SleepRecord)
        .filter(SleepRecord.user_id == current_user.id)
        .filter(SleepRecord.date >= week_ago)
        .order_by(SleepRecord.date)
        .all()
    )

    data = [
        {
            "date": record.date.strftime('%a'),
            "duration": record.duration_hours
        }
        for record in records
    ]

    return jsonify(data)

@report.route('/api/shared/sleep/duration/<int:user_id>')
@login_required
def get_shared_sleep_duration(user_id):
    # Check if the current user has permission to see this user's data
    sharing = DataSharing.query.filter_by(
        owner_id=user_id, 
        viewer_id=current_user.id
    ).first()
    
    if not sharing:
        return jsonify({"error": "Access denied"}), 403
        
    today = datetime.today().date()
    week_ago = today - timedelta(days=6)

    records = (
        db.session.query(SleepRecord)
        .filter(SleepRecord.user_id == user_id)
        .filter(SleepRecord.date >= week_ago)
        .order_by(SleepRecord.date)
        .all()
    )

    data = [
        {
            "date": record.date.strftime('%a'),
            "duration": record.duration_hours
        }
        for record in records
    ]

    return jsonify(data)

@report.route('/api/sleep/score')
@login_required
def get_sleep_score():
    from collections import defaultdict

    today = datetime.today().date()
    week_ago = today - timedelta(days=6)

    records = (
        db.session.query(SleepRecord)
        .filter(SleepRecord.user_id == current_user.id)
        .filter(SleepRecord.date >= week_ago)
        .order_by(SleepRecord.date)
        .all()
    )

    daily_scores = defaultdict(list)
    for r in records:
        day = r.date.strftime('%a')  # 'Mon', 'Tue', ...
        score = score_mapping(r)
        daily_scores[day].append(score)

    days_order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    final_scores = []
    for d in days_order:
        if daily_scores[d]:
            avg_score = sum(daily_scores[d]) / len(daily_scores[d])
        else:
            avg_score = 0
        final_scores.append(round(avg_score, 2))


    def classify_level(score):
        if score >= 17:
            return "Excellent"
        elif score >= 13:
            return "Good"
        elif score >= 9:
            return "Fair"
        else:
            return "Poor"

    final_levels = [classify_level(score) for score in final_scores]

    return jsonify({
        'labels': days_order,
        'data': final_scores,
        'levels': final_levels
    })

@report.route('/api/sleep/level-distribution')
@login_required
def get_sleep_level_distribution():
    from collections import Counter

    today = datetime.today().date()
    week_ago = today - timedelta(days=6)

    records = (
        db.session.query(SleepRecord)
        .filter(SleepRecord.user_id == current_user.id)
        .filter(SleepRecord.date >= week_ago)
        .order_by(SleepRecord.date)
        .all()
    )

    def classify_level(score):
        if score >= 17:
            return "Excellent"
        elif score >= 13:
            return "Good"
        elif score >= 9:
            return "Fair"
        else:
            return "Poor"

    levels = [classify_level(score_mapping(r)) for r in records]

    from collections import Counter
    count = Counter(levels)

    labels = ['Excellent', 'Good', 'Fair', 'Poor']
    data = [count.get(label, 0) for label in labels]

    return jsonify({
        'labels': labels,
        'data': data
    })


@report.route('/api/shared/sleep/score/<int:user_id>')
@login_required
def get_shared_sleep_score(user_id):
    from collections import defaultdict

    sharing = DataSharing.query.filter_by(
        owner_id=user_id, 
        viewer_id=current_user.id
    ).first()
    
    if not sharing:
        return jsonify({"error": "Access denied"}), 403

    today = datetime.today().date()
    week_ago = today - timedelta(days=6)

    records = (
        db.session.query(SleepRecord)
        .filter(SleepRecord.user_id == user_id)
        .filter(SleepRecord.date >= week_ago)
        .order_by(SleepRecord.date)
        .all()
    )

    daily_scores = defaultdict(list)
    for r in records:
        day = r.date.strftime('%a')
        score = score_mapping(r)
        daily_scores[day].append(score)

    days_order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    final_scores = []
    for d in days_order:
        if daily_scores[d]:
            avg_score = sum(daily_scores[d]) / len(daily_scores[d])
        else:
            avg_score = 0
        final_scores.append(round(avg_score, 2))

    return jsonify({'labels': days_order, 'data': final_scores})

@report.route('/api/sleep/factor-impact')
@login_required
def get_sleep_factor_impact():
    from collections import defaultdict
    from statistics import mean

    today = datetime.today().date()
    week_ago = today - timedelta(days=6)

    records = (
        db.session.query(SleepRecord)
        .filter(SleepRecord.user_id == current_user.id)
        .filter(SleepRecord.date >= week_ago)
        .order_by(SleepRecord.date)
        .all()
    )

    # Factor display names for better readability
    factor_display_names = {
        'caffeine': 'Caffeine Intake',
        'exercise': 'Exercise',
        'screen': 'Screen Time',
        'eating': 'Late-night Eating'
    }

    # Define labels for each factor level
    factor_labels = {
        'caffeine': {0: 'Nighttime', 1: 'Daytime only', 2: 'No intake'},
        'exercise': {0: 'Intense night exercise', 1: 'No exercise', 2: 'Moderate daytime exercise'},
        'screen': {0: '>60 min', 1: '15–60 min', 2: '≤15 min'},
        'eating': {0: 'Often', 1: 'Occasionally', 2: 'None'}
    }
    
    # Scoring system for each factor's impact
    # Caffeine Intake: No intake = 2, Daytime only = 1, Nighttime = 0
    # Exercise: Intense night exercise = 0, Moderate daytime exercise = 2, No exercise = 1
    # Screen Time (Before Bed): ≤15min = 2, 15–60min = 1, >60min = 0
    # Late-night Eating: None = 2, Occasionally = 1, Often = 0
    factor_impact_scores = {
        'caffeine': {0: 0, 1: 5, 2: 10},  # Convert to 0-10 scale
        'exercise': {0: 0, 1: 5, 2: 10},
        'screen': {0: 0, 1: 5, 2: 10},
        'eating': {0: 0, 1: 5, 2: 10}
    }

    # Initialize data structures for tracking factor values and counts
    factor_value_counts = {
        'caffeine': {0: 0, 1: 0, 2: 0},  # Count of each factor value
        'exercise': {0: 0, 1: 0, 2: 0},
        'screen': {0: 0, 1: 0, 2: 0},
        'eating': {0: 0, 1: 0, 2: 0}
    }
    
    # Track the most recent factor values (for the 'values' field in response)
    latest_values = {
        'caffeine': None,
        'exercise': None,
        'screen': None,
        'eating': None
    }

    # Count occurrences of each factor value
    for r in records:
        if r.caffeine is not None:
            factor_value_counts['caffeine'][r.caffeine] += 1
            latest_values['caffeine'] = r.caffeine
            
        if r.exercise is not None:
            factor_value_counts['exercise'][r.exercise] += 1
            latest_values['exercise'] = r.exercise
            
        if r.screen is not None:
            factor_value_counts['screen'][r.screen] += 1
            latest_values['screen'] = r.screen
            
        if r.eating is not None:
            factor_value_counts['eating'][r.eating] += 1
            latest_values['eating'] = r.eating

    # Calculate weighted average impact scores for each factor
    labels = []
    data = []
    values = []

    for factor, value_counts in factor_value_counts.items():
        labels.append(factor_display_names[factor])
        
        # Calculate total count and weighted sum for this factor
        total_count = sum(value_counts.values())
        
        if total_count > 0:
            # Calculate weighted average of impact scores
            weighted_sum = sum(factor_impact_scores[factor][value] * count
                              for value, count in value_counts.items())
            
            # Average impact score = weighted sum / total count
            avg_impact_score = round(weighted_sum / total_count, 1)
            data.append(avg_impact_score)
        else:
            # Default value if no data
            data.append(5)
        
        # Add the most recent factor value (0, 1, or 2) for UI display
        values.append(latest_values[factor] if latest_values[factor] is not None else 1)

    response = {
        'labels': labels,
        'data': data,
        'values': values
    }

    return jsonify(response)


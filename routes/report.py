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

    factors = {
        'caffeine': defaultdict(list),
        'exercise': defaultdict(list),
        'screen': defaultdict(list),
        'eating': defaultdict(list)
    }

    for r in records:
        score = score_mapping(r)
        factors['caffeine'][r.caffeine].append(score)
        factors['exercise'][r.exercise].append(score)
        factors['screen'][r.screen].append(score)
        factors['eating'][r.eating].append(score)

    # Define labels for each factor level
    factor_labels = {
        'caffeine': {0: 'Nighttime', 1: 'Daytime only', 2: 'No intake'},
        'exercise': {0: 'Intense night exercise', 1: 'No exercise', 2: 'Moderate daytime exercise'},
        'screen': {0: '>60 min', 1: '15–60 min', 2: '≤15 min'},
        'eating': {0: 'Often', 1: 'Occasionally', 2: 'None'}
    }

    response = {
        'labels': [],
        'data': []
    }

    # Factor display names for better readability
    factor_display_names = {
        'caffeine': 'Caffeine',
        'exercise': 'Exercise',
        'screen': 'Screen Time',
        'eating': 'Late-night Eating'
    }

    # Calculate scores grouped by different levels
    for factor in ['caffeine', 'exercise', 'screen', 'eating']:
        for level, level_scores in factors[factor].items():
            if level_scores:  # If there's data for this level
                avg_score = round(mean(level_scores), 2)
                level_label = factor_labels[factor].get(level, f"Level {level}")
                # Add factor name to the label
                label = f"{factor_display_names[factor]}: {level_label}"
                response['labels'].append(label)
                response['data'].append(avg_score)

    return jsonify(response)


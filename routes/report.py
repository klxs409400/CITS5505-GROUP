from flask import Blueprint, render_template
from flask_login import login_required, current_user
from flask import jsonify
from models import SleepRecord
from app import db
from datetime import datetime, timedelta

report = Blueprint('report', __name__)

@report.route('/report')
@login_required
def view_report():
    return render_template('Reports/report.html')

def score_mapping(record):
    quality_map = {"Very good": 3, "Fair": 2, "Poor": 1, "Very poor": 0}
    latency_map = {3: 3, 1: 1, 0: 0}
    duration_map = lambda h: 3 if h >= 7 else 2 if h >= 6 else 1 if h >= 5 else 0
    efficiency_map = lambda e: 3 if e >= 85 else 2 if e >= 75 else 1 if e >= 65 else 0
    disturbances_map = {"None": 3, "Occasionally": 2, "Often": 1, "Frequent": 0}
    sleep_aid_map = {3: 3, 2: 2, 1: 1, 0: 0}
    dysfunction_map = {"None": 3, "Sometimes": 2, "Often": 1, "Severe": 0}

    efficiency = 100  
    return (
        quality_map.get(record.quality, 0)
        + latency_map.get(record.sleep_latency, 0)
        + duration_map(record.duration_hours)
        + efficiency_map(efficiency)
        + disturbances_map.get(record.sleep_disturbances, 0)
        + sleep_aid_map.get(record.sleep_aid, 0)
        + dysfunction_map.get(record.daytime_dysfunction, 0)
    )

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

    def score_mapping(record):
        quality_map = {"Very good": 3, "Fair": 2, "Poor": 1, "Very poor": 0}
        latency_map = {3: 3, 1: 1, 0: 0}
        duration_map = lambda h: 3 if h >= 7 else 2 if h >= 6 else 1 if h >= 5 else 0
        efficiency_map = lambda e: 3 if e >= 85 else 2 if e >= 75 else 1 if e >= 65 else 0
        disturbances_map = {"None": 3, "Occasionally": 2, "Often": 1, "Frequent": 0}
        sleep_aid_map = {3: 3, 2: 2, 1: 1, 0: 0}
        dysfunction_map = {"None": 3, "Sometimes": 2, "Often": 1, "Severe": 0}

        efficiency = 100  # placeholder
        return (
            quality_map.get(record.quality, 0)
            + latency_map.get(record.sleep_latency, 0)
            + duration_map(record.duration_hours)
            + efficiency_map(efficiency)
            + disturbances_map.get(record.sleep_disturbances, 0)
            + sleep_aid_map.get(record.sleep_aid, 0)
            + dysfunction_map.get(record.daytime_dysfunction, 0)
        )

    # 初始化四个影响因素
    factors = {
        'caffeine': defaultdict(list),
        'exercise': defaultdict(list),
        'screen': defaultdict(list),
        'eating': defaultdict(list)
    }

    # 分类存储分数
    for r in records:
        score = score_mapping(r)
        factors['caffeine'][r.caffeine].append(score)
        factors['exercise'][r.exercise].append(score)
        factors['screen'][r.screen].append(score)
        factors['eating'][r.eating].append(score)

    response = {
        'labels': ['Had Caffeine', 'Exercised', 'Screen Time', 'Late-night Eating'],
        'data': []
    }

    for factor in ['caffeine', 'exercise', 'screen', 'eating']:
        all_scores = []
        for level_scores in factors[factor].values():
            all_scores.extend(level_scores)
        avg_score = round(mean(all_scores), 2) if all_scores else 0
        response['data'].append(avg_score)

    return jsonify(response)


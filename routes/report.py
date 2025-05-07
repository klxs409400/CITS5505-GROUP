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
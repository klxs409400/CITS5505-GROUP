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
    
    recent_records = SleepRecord.query.filter_by(user_id=current_user.id).order_by(SleepRecord.date.desc()).limit(5).all()
    
    return render_template(
        'Homepage/dashboard.html',
        recent_records=recent_records
    )

@main.route('/demo')
def demo():
    return render_template('Homepage/demo.html')
from flask import Blueprint, render_template
from flask_login import login_required, current_user

report = Blueprint('report', __name__)

@report.route('/report')
@login_required
def view_report():
    return render_template('report.html')
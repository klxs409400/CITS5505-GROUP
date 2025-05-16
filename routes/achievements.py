from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from models import Achievement
from services.achievement_service import AchievementService

achievements = Blueprint('achievements', __name__)

@achievements.route('/check-achievements')
@login_required
def check_achievements():
    """Check and update all achievements for the current user"""
    try:
        AchievementService.check_achievements(current_user.id)
        return jsonify({"success": True, "message": "Achievements checked successfully"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@achievements.route('/get-achievements')
@login_required
def get_achievements():
    """Get all achievements for the current user"""
    achievements = Achievement.query.filter_by(user_id=current_user.id).all()
    
    achievement_list = []
    for achievement in achievements:
        achievement_list.append({
            "id": achievement.id,
            "name": achievement.name,
            "description": achievement.description,
            "icon": achievement.icon,
            "is_locked": achievement.is_locked,
            "achieved_at": achievement.achieved_at.strftime('%Y-%m-%d %H:%M:%S') if achievement.achieved_at else None
        })
    
    return jsonify({"success": True, "achievements": achievement_list})
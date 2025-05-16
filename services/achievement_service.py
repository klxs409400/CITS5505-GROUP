# services/achievement_service.py

from models import db, Achievement, SleepRecord, User, SleepGoal
from datetime import datetime, timedelta
from sqlalchemy import func, extract

class AchievementService:
    @staticmethod
    def check_achievements(user_id):
        """Check and update all achievement statuses for a user"""
        # Check each type of achievement
        AchievementService.check_early_bird(user_id)
        AchievementService.check_sleep_master(user_id)
        AchievementService.check_perfect_week(user_id)
        AchievementService.check_night_owl(user_id)
        AchievementService.check_consistency_king(user_id)
        AchievementService.check_sleep_marathon(user_id)
    
    @staticmethod
    def unlock_achievement(user_id, achievement_name):
        """Unlock a specific achievement"""
        achievement = Achievement.query.filter_by(
            user_id=user_id, 
            name=achievement_name,
            is_locked=True
        ).first()
        
        # If achievement not found or already unlocked, return
        if not achievement:
            # Check if the achievement exists but is already unlocked
            existing = Achievement.query.filter_by(
                user_id=user_id,
                name=achievement_name
            ).first()
            if existing:
                return  # Already unlocked, no action needed
                
            # Create new achievement record
            achievement = Achievement(
                user_id=user_id,
                name=achievement_name,
                description=AchievementService.get_description(achievement_name),
                icon=AchievementService.get_icon(achievement_name),
                is_locked=False,
                achieved_at=datetime.utcnow()
            )
            db.session.add(achievement)
        else:
            # Unlock existing achievement
            achievement.is_locked = False
            achievement.achieved_at = datetime.utcnow()
        
        db.session.commit()
    
    @staticmethod
    def get_description(achievement_name):
        """Return description based on achievement name"""
        descriptions = {
            "Early Bird": "Wake up before 6 AM for 7 days",
            "Sleep Master": "Log 100 nights of excellent sleep",
            "Perfect Week": "7 days of 8+ hour sleep",
            "Night Owl": "Log 10 nights of going to bed after midnight but still getting good sleep",
            "Consistency King": "Go to bed within 30 minutes of your target time for 14 consecutive days",
            "Sleep Marathon": "Get 9+ hours of sleep for 5 consecutive days"
        }
        return descriptions.get(achievement_name, "Achievement unlocked!")
    
    @staticmethod
    def get_icon(achievement_name):
        """Return icon based on achievement name"""
        icons = {
            "Early Bird": "fa-star",
            "Sleep Master": "fa-moon",
            "Perfect Week": "fa-bed",
            "Night Owl": "fa-owl",
            "Consistency King": "fa-crown",
            "Sleep Marathon": "fa-running"
        }
        return icons.get(achievement_name, "fa-trophy")
    
    # Achievement check methods
    @staticmethod
    def check_early_bird(user_id):
        """Check Early Bird achievement: Wake up before 6 AM for 7 consecutive days"""
        # Get recent records (need to check at least 7 days)
        records = SleepRecord.query.filter_by(user_id=user_id).order_by(SleepRecord.date.desc()).limit(15).all()
        
        # Build date to record mapping
        date_records = {}
        for record in records:
            date_records[record.date] = record
        
        # Check for 7 consecutive days waking up before 6 AM
        consecutive_days = 0
        max_consecutive = 0
        today = datetime.now().date()
        
        for i in range(15):  # Check last 15 days to find 7 consecutive days
            check_date = today - timedelta(days=i)
            record = date_records.get(check_date)
            
            if record and record.wake_time.hour < 6:
                consecutive_days += 1
                max_consecutive = max(max_consecutive, consecutive_days)
            else:
                consecutive_days = 0
        
        if max_consecutive >= 7:
            AchievementService.unlock_achievement(user_id, "Early Bird")
    
    @staticmethod
    def check_sleep_master(user_id):
        """Check Sleep Master achievement: Log 100 nights of excellent sleep"""
        # This requires checking all records, not just recent ones
        excellent_count = SleepRecord.query.filter_by(
            user_id=user_id, 
            quality="Excellent"
        ).count()
        
        if excellent_count >= 100:
            AchievementService.unlock_achievement(user_id, "Sleep Master")
    
    @staticmethod
    def check_perfect_week(user_id):
        """Check Perfect Week achievement: 7 consecutive days of 8+ hour sleep"""
        # Get recent records (need to check at least 7 days)
        records = SleepRecord.query.filter_by(user_id=user_id).order_by(SleepRecord.date.desc()).limit(15).all()
        
        # Build date to record mapping
        date_records = {}
        for record in records:
            date_records[record.date] = record
        
        # Check for 7 consecutive days with 8+ hours of sleep
        consecutive_days = 0
        max_consecutive = 0
        today = datetime.now().date()
        
        for i in range(15):  # Check last 15 days to find 7 consecutive days
            check_date = today - timedelta(days=i)
            record = date_records.get(check_date)
            
            if record and record.duration_hours >= 8.0:
                consecutive_days += 1
                max_consecutive = max(max_consecutive, consecutive_days)
            else:
                consecutive_days = 0
        
        if max_consecutive >= 7:
            AchievementService.unlock_achievement(user_id, "Perfect Week")
    
    @staticmethod
    def check_night_owl(user_id):
        """Check Night Owl achievement: Log 10 nights of going to bed after midnight but still getting good sleep"""
        # This checks all records, not just recent ones
        # Using extract() to access the hour component
        night_owl_records = SleepRecord.query.filter(
            SleepRecord.user_id == user_id,
            extract('hour', SleepRecord.bedtime).between(0, 3),  # Between midnight (0) and 3:59 AM
            SleepRecord.quality.in_(["Excellent", "Good"])  # Good or excellent sleep quality
        ).count()
        
        if night_owl_records >= 10:
            AchievementService.unlock_achievement(user_id, "Night Owl")
    
    @staticmethod
    def check_consistency_king(user_id):
        """Check Consistency King achievement: Go to bed within 30 minutes of target time for 14 consecutive days"""
        # Get user's sleep goal
        sleep_goal = SleepGoal.query.filter_by(user_id=user_id).order_by(SleepGoal.created_at.desc()).first()
        if not sleep_goal:
            return  # No sleep goal set
        
        # Get recent records (need to check at least 14 days)
        records = SleepRecord.query.filter_by(user_id=user_id).order_by(SleepRecord.date.desc()).limit(25).all()
        
        # Build date to record mapping
        date_records = {}
        for record in records:
            date_records[record.date] = record
        
        # We'll manually check each record's bedtime in Python rather than using SQL
        consecutive_days = 0
        max_consecutive = 0
        today = datetime.now().date()
        
        # Target bedtime - assuming 11 PM
        target_hour = 23
        target_minute = 0
        target_total_minutes = target_hour * 60 + target_minute
        
        for i in range(25):  # Check last 25 days to find 14 consecutive days
            check_date = today - timedelta(days=i)
            record = date_records.get(check_date)
            
            if record:
                # Calculate the total minutes in Python after retrieving from database
                actual_hour = record.bedtime.hour
                actual_minute = record.bedtime.minute
                actual_total_minutes = actual_hour * 60 + actual_minute
                
                # Handle cases where bedtime is after midnight
                if 0 <= actual_hour < 4:  # If bedtime is between 0-4 AM
                    actual_total_minutes += 24 * 60  # Add a day's worth of minutes
                
                time_diff = abs(actual_total_minutes - target_total_minutes)
                
                if time_diff <= 30:  # Within 30 minutes
                    consecutive_days += 1
                    max_consecutive = max(max_consecutive, consecutive_days)
                else:
                    consecutive_days = 0
            else:
                consecutive_days = 0
        
        if max_consecutive >= 14:
            AchievementService.unlock_achievement(user_id, "Consistency King")
    
    @staticmethod
    def check_sleep_marathon(user_id):
        """Check Sleep Marathon achievement: Get 9+ hours of sleep for 5 consecutive days"""
        # Get recent records (need to check at least 5 days)
        records = SleepRecord.query.filter_by(user_id=user_id).order_by(SleepRecord.date.desc()).limit(10).all()
        
        # Build date to record mapping
        date_records = {}
        for record in records:
            date_records[record.date] = record
        
        # Check for 5 consecutive days with 9+ hours of sleep
        consecutive_days = 0
        max_consecutive = 0
        today = datetime.now().date()
        
        for i in range(10):  # Check last 10 days to find 5 consecutive days
            check_date = today - timedelta(days=i)
            record = date_records.get(check_date)
            
            if record and record.duration_hours >= 9.0:
                consecutive_days += 1
                max_consecutive = max(max_consecutive, consecutive_days)
            else:
                consecutive_days = 0
        
        if max_consecutive >= 5:
            AchievementService.unlock_achievement(user_id, "Sleep Marathon")
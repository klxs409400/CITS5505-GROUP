from flask import Flask, jsonify
from flask_migrate import Migrate
from flask_login import LoginManager, login_required, current_user
from models import db, User, SleepRecord  # 添加 SleepRecord 的导入
import os
import subprocess

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = 'your-secret-key-for-development'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sleeptracker.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)
    
    # Initialize login manager
    login_manager = LoginManager(app)
    login_manager.login_view = 'auth.login'
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # Register blueprints
    from routes.auth import auth
    from routes.main import main
    from routes.sleep import sleep
    from routes.report import report
    from routes.settings import settings
    from routes.profile import profile
    
    app.register_blueprint(auth)
    app.register_blueprint(main)
    app.register_blueprint(sleep)
    app.register_blueprint(report)
    app.register_blueprint(settings)
    app.register_blueprint(profile)
    
    # 添加调试路由
    @app.route('/debug-current-user')
    @login_required
    def debug_current_user():
        # 获取当前用户信息
        user_info = {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email
        }
        
        # 获取该用户的所有睡眠记录
        sleep_records = SleepRecord.query.filter_by(user_id=current_user.id).order_by(SleepRecord.date.desc()).all()
        
        # 转换记录为可序列化的格式
        records_info = []
        for record in sleep_records:
            records_info.append({
                'id': record.id,
                'date': record.date.strftime('%Y-%m-%d'),
                'bedtime': record.bedtime.strftime('%Y-%m-%d %H:%M'),
                'wake_time': record.wake_time.strftime('%Y-%m-%d %H:%M'),
                'duration_hours': record.duration_hours,
                'quality': record.quality
            })
        
        return jsonify({
            'user': user_info,
            'sleep_records': records_info,
            'record_count': len(records_info)
        })
    
    return app

# Create an application instance
app = create_app()

# Check if database exists and initialize if needed
def init_db_if_needed():
    # Check if database file exists
    db_file = 'sleeptracker.db'
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), db_file)
    
    if not os.path.exists(db_path):
        print("Database file not found. Creating database tables...")
        # Create database tables
        with app.app_context():
            db.create_all()
        
        # Initialize test data
        print("Initializing test data with init_db.py...")
        try:
            subprocess.run(["python3", "init_db.py"], check=True)
            print("Test data initialized successfully!")
        except subprocess.CalledProcessError as e:
            print(f"Failed to initialize test data: {e}")
    else:
        print(f"Database file {db_file} already exists.")

# Initialize the database when this module is imported
init_db_if_needed()

if __name__ == '__main__':
    app.run(debug=True)
from flask import Flask
from flask_migrate import Migrate
from flask_login import LoginManager
from models import db, User

def create_app():
    app = Flask(__name__)
    
    # 配置
    app.config['SECRET_KEY'] = 'your-secret-key-for-development'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sleeptracker.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # 初始化扩展
    db.init_app(app)
    migrate = Migrate(app, db)
    
    # 初始化登录管理器
    login_manager = LoginManager(app)
    login_manager.login_view = 'auth.login'
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    # 注册蓝图
    from routes.auth import auth
    from routes.main import main
    from routes.sleep import sleep
    from routes.report import report
    from routes.settings import settings
    
    app.register_blueprint(auth)
    app.register_blueprint(main)
    app.register_blueprint(sleep)
    app.register_blueprint(report)
    app.register_blueprint(settings)
    
    return app

if __name__ == '__main__':
    app = create_app()
    
    # 创建数据库表
    with app.app_context():
        db.create_all()
        
    app.run(debug=True)
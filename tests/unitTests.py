import unittest
from app import create_app, db
from models import User

class UnitTests(unittest.TestCase):

    def setUp(self):
        self.app = create_app('testing')  # Make sure your app supports 'testing' config
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['TESTING'] = True
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        self.client = self.app.test_client()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def test_successful_login(self):
        user = User(username="testuser", email="test@example.com")
        user.set_password("a")
        db.session.add(user)
        db.session.commit()

        response = self.client.post("/login", data={
            "email": "test@example.com",
            "password": "a"
        }, follow_redirects=True)

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Dashboard", response.data)

    def test_home_page_loads(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"SleepTracker", response.data)  # Adjust if text differs

    def test_registration(self):
        response = self.client.post("/register", data={
            "username": "newuser",
            "email": "new@example.com",
            "password": "testpass",
            "confirm_password": "testpass"
        }, follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Login", response.data)

    def test_login_wrong_password(self):
        user = User(username="wrongpass", email="wrongpass@example.com")
        user.set_password("correctpass")
        db.session.add(user)
        db.session.commit()

        response = self.client.post("/login", data={
            "email": "wrongpass@example.com",
            "password": "wrongpass"
        }, follow_redirects=True)

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Invalid credentials", response.data)  # update to match your app's response


    def test_logout_redirects_to_home(self):
        response = self.client.get("/logout", follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"SleepTracker", response.data)  # Adjust based on page content

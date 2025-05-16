import pytest
import sys
import os

from werkzeug.security import generate_password_hash
from flask import url_for


sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, db
from models import User


@pytest.fixture
def test_client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///:memory:"
    app.config['WTF_CSRF_ENABLED'] = False
    app.config['LOGIN_DISABLED'] = False

    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()


def test_home_page(test_client):
    """Check homepage loads"""
    response = test_client.get('/')
    assert response.status_code == 200
    assert b"SleepTracker" in response.data 


def test_register_page(test_client):
    """Check register page loads"""
    response = test_client.get('/register')
    assert response.status_code == 200
    assert b"Register" in response.data

def test_login_page(test_client):
    """Check login page loads"""
    response = test_client.get('/login')
    assert response.status_code == 200
    assert b"Welcome Back" in response.data

def test_user_registration(test_client):
    """Register new user"""
    response = test_client.post('/register', data={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password123',
        'confirm': 'password123'
    }, follow_redirects=True)
    assert response.status_code == 200
    assert b"Welcome Back" in response.data


def test_user_login(test_client):
    """Login an existing user"""
    with app.app_context():
        hashed = generate_password_hash('password123', method='pbkdf2:sha256')
        db.session.add(User(username='loginuser', email='login@example.com', password_hash=hashed))
        db.session.commit()

    response = test_client.post('/login', data={
        'email': 'login@example.com',
        'password': 'password123'
    }, follow_redirects=True)

    assert response.status_code == 200
    assert b"Dashboard" in response.data 


def test_logout(test_client):
    """Logout user"""
    with app.app_context():
        hashed = generate_password_hash('password123', method='pbkdf2:sha256')
        db.session.add(User(username='logoutuser', email='logout@example.com', password_hash=hashed))
        db.session.commit()

    test_client.post('/login', data={
        'username': 'logoutuser',
        'password': 'password123'
    }, follow_redirects=True)

    response = test_client.get('/logout', follow_redirects=True)
    assert response.status_code == 200
    assert b"SleepTracker" in response.data 

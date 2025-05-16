from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, current_user
from werkzeug.urls import url_parse
from models import db, User
from datetime import datetime
from utils.validation import validate_password, validate_email, validate_username

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            login_user(user)
            next_page = request.args.get('next')
            if not next_page or url_parse(next_page).netloc != '':
                next_page = url_for('main.dashboard')
            return redirect(next_page)
        else:
            flash('Invalid email or password.','error')

    # Render the login page for GET requests
    return render_template('Homepage/login.html')

@auth.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    
    if request.method == 'POST':
        email = request.form['email']
        username = request.form['username']
        password = request.form['password']
        print("Form submitted with:", request.form)
        
        # Server-side validation
        is_valid = True
        
        # Validate email
        email_valid, email_msg = validate_email(email)
        if not email_valid:
            flash(email_msg)
            is_valid = False
        
        # Validate username
        username_valid, username_msg = validate_username(username)
        if not username_valid:
            flash(username_msg)
            is_valid = False
        
        # Validate password
        password_valid, password_msg = validate_password(password)
        if not password_valid:
            flash(password_msg)
            is_valid = False
        
        # Check if email already exists
        if User.query.filter_by(email=email).first():
            flash('Email already registered.')
            is_valid = False
        
        # Check if username already exists
        if User.query.filter_by(username=username).first():
            flash('Username already taken.')
            is_valid = False
        
        if not is_valid:
            return redirect(url_for('auth.register'))
        
        # Create new user with the provided username
        user = User(
            username=username,
            email=email,
            full_name=username,  # Using username as full_name for now
            date_joined=datetime.utcnow()
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        print("Registration successful, redirecting to login page")
        flash('Registration successful! Please log in.','Success')
        return redirect(url_for('auth.login'))

    return render_template('Homepage/register.html')

@auth.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('main.index'))
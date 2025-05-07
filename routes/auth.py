from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, current_user
from werkzeug.urls import url_parse
from models import db, User
from datetime import datetime

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        user = User.query.filter_by(email=email).first()
        
        if user is None or not user.check_password(password):
            flash('Invalid email or password')
            return redirect(url_for('auth.login'))
        
        login_user(user)
        
        next_page = request.args.get('next')
        if not next_page or url_parse(next_page).netloc != '':
            next_page = url_for('main.dashboard')
        
        return redirect(next_page)
    
    return render_template('Homepage/login.html')

@auth.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    
    if request.method == 'POST':
        email = request.form['email']
        
        if User.query.filter_by(email=email).first():
            flash('Email already registered.')
            return redirect(url_for('auth.register'))
        
        username = email.split('@')[0]  
        user = User(
            username=username,
            email=email,
            full_name=request.form['name'],
            date_joined=datetime.utcnow()
        )
        user.set_password(request.form['password'])
        
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful! Please log in.')
        return redirect(url_for('auth.login'))
    
    return render_template('Homepage/register.html')

@auth.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('main.index'))
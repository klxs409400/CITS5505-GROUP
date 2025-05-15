"""
Validation utilities for the SleepTracker application.
This module provides functions for validating user input.
"""
import re

def validate_password(password):
    """
    Validates a password against security requirements.
    
    Requirements:
    - At least 8 characters long
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one digit
    - Contains at least one special character
    
    Returns:
    - (bool, str): A tuple containing:
      - True if the password meets all requirements, False otherwise
      - A message explaining why the validation failed, empty string if validated
    """
    # Check password length
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    
    # Check for at least one uppercase letter
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter."
    
    # Check for at least one lowercase letter
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter."
    
    # Check for at least one digit
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit."
    
    # Check for at least one special character
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character."
    
    return True, ""

def validate_email(email):
    """
    Validates an email address format.
    
    Returns:
    - (bool, str): A tuple containing:
      - True if the email is valid, False otherwise
      - A message explaining why the validation failed, empty string if validated
    """
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return False, "Please enter a valid email address."
    
    return True, ""

def validate_username(username):
    """
    Validates a username.
    
    Requirements:
    - Between 3 and 20 characters
    - Only alphanumeric characters and underscores
    
    Returns:
    - (bool, str): A tuple containing:
      - True if the username is valid, False otherwise
      - A message explaining why the validation failed, empty string if validated
    """
    if len(username) < 3:
        return False, "Username must be at least 3 characters long."
    
    if len(username) > 20:
        return False, "Username cannot exceed 20 characters."
    
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return False, "Username can only contain letters, numbers, and underscores."
    
    return True, ""
# CITS5505-GROUP

# Sleep Quality Analysis Application

## Project Overview

This web application allows users to track and analyze their sleep patterns and quality. Users can record daily sleep data including duration, perceived quality, and various factors that might affect sleep (such as caffeine intake, exercise, screen time before bed, etc.). The application provides visualization of sleep patterns over time and analyzes which factors most significantly impact the user's sleep quality. Users can also selectively share their sleep insights with others, such as healthcare providers or family members.

## Team Members

| UWA ID   | Name           | GitHub Username   |
| -------- | -------------- | ----------------- |
| 24335345 | [Yixi Yang]    | [klxs409400]      |
| 24014632 | [Xuting Guo]   | [closer512]       |
| 24500097 | [Varun Suresh] | [varunnnnsuresh3] |
| 23965953 | [Icy Chen]     | [Icygoose]        |

## Key Features

- User authentication system (register, login, account management)
- Data entry interface for logging sleep details and influencing factors
- Dashboard with visualizations of sleep metrics (charts showing trends and patterns)
- Analysis tools identifying correlations between activities/factors and sleep quality
- Sharing functionality to allow users to share specific reports with selected users
- Personalized insights and recommendations for improving sleep quality

## Technologies

- **Frontend**: HTML, CSS, JavaScript, Bootstrap, JQuery
- **Backend**: Python Flask with plugins
- **Database**: SQLite with SQLAlchemy
- **Visualization**: Chart.js
- **Communication**: AJAX/Websockets

## Application Views

1. **Introductory View**: Landing page explaining the application's purpose with registration/login functionality
2. **Data Upload View**: Interface for users to record their sleep data and influencing factors
3. **Visualization View**: Dashboard displaying sleep metrics, trends, and factor analysis
4. **Share View**: Interface allowing users to share specific reports with other users

## Test Accounts

The application comes with pre-initialized test accounts for development and testing purposes:

| Username | Email | Password |
|----------|-------|----------|
| johndoe | john.doe@example.com | password123 |
| janesmith | jane.smith@example.com | password456 |
| testdelete | delete.test@example.com | deletetest123 |

*Note: These accounts are for development environment only and should not be used in production.*

## Installation Instructions

_[To be completed as the project develops]_

1. Clone the repository
2. Create a virtual environment
3. Install required packages using `pip install -r requirements.txt`
4. Run the application using `python run.py`

## Running Tests

_[To be completed as tests are developed]_

## Development Timeline

- 4.15-4.23: Requirements analysis and GUI design
- 4.24-4.30: Basic functionality implementation (user authentication, data entry)
- 5.1-5.10: Data visualization and analysis implementation
- 5.11-5.16: Sharing functionality and final testing

---

_This project is being developed as part of the CITS3403/CITS5505 unit at the University of Western Australia._

# CITS5505-GROUP-65

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
- Dashboard with visualizations of sleep metrics
- Analysis tools identifying correlations between activities/factors and sleep quality
- Sharing functionality to allow users to share specific reports with selected users
- Personalized insights and recommendations for improving sleep quality

## Technologies

- **Frontend**: HTML, CSS, JavaScript, Bootstrap, JQuery
- **Backend**: Flask
- **Database**: SQLite with SQLAlchemy
- **Visualization**: Chart.js
- **Communication**: AJAX

## Application Views

1. **Introductory View**: Landing page explaining the application's purpose with registration/login functionality, also provide a demo page for guest
2. **Data Upload View**: Interface for users to record their sleep data and influencing factors
3. **Visualization View**: Dashboard displaying sleep metrics, trends, and factor analysis
4. **Share View**: Interface allowing users to share specific reports with other users

## Test Accounts

The application comes with pre-initialized test accounts for development and testing purposes:

| Username   | Email                   | Password      |
| ---------- | ----------------------- | ------------- |
| johndoe    | john.doe@example.com    | password123   |
| janesmith  | jane.smith@example.com  | password456   |
| testdelete | delete.test@example.com | deletetest123 |

_Note: These accounts are for development environment only and should not be used in production._

## Installation Instructions

1. Clone the repository

```bash
git clone git clone https://github.com/klxs409400/CITS5505-GROUP.git
```

2. Create a virtual environment

```bash
# macOS/Linux
python -m venv venv
source venv/bin/activate
```

```bash
# Windows
python -m venv venv
venv\Scripts\activate
```

3. Install required packages

```bash
pip install -r requirements.txt
```

4. Set up environment variables:

   - Copy `.env.example` to `.env`
   - Update the value for `SECRET_KEY` in the `.env` file with a secure random string

5. Initialize the database:

```bash
python init_db.py
python app.py
```

6. Run the application

```bash
flask run
```

## Running Tests

Include the following Python packages:
Flask
Flask-Login
Flask-SQLAlchemy
pytest
selenium
python-dotenv
werkzeug

Testing Guide

This project includes both unit tests and end-to-end browser tests using Selenium.

Setup Instructions

1. Create and activate a virtual environment:

   python3 -m venv venv
   source venv/bin/activate

2. Install required packages:

   pip install -r requirements.txt

3. Running Unit Tests (with Pytest):

   Make sure your Flask app and database are set up.

   To run all unit tests:
   pytest tests/unitTests.py

4. Running Selenium Tests:

   Make sure your Flask app is running locally at http://127.0.0.1:5000:

   flask run
   Then in a separate terminal run the following command:

   pytest tests/selenium_test.py

   Note :

5. Make sure Chrome and ChromeDriver are installed and compatible. ChromeDriver has to be installed  
   for the selenium tests to run.

6. Selenium tests use webdriver.Chrome() by default.

7. Ensure users exist before running login-related tests or add setup logic.

## Security Practices

This application follows these security best practices:

1. **Environment Variables**: Sensitive configuration like secret keys and database URLs are stored in environment variables, not hard-coded in the application.
2. **Password Hashing**: User passwords are hashed using strong algorithms before storage.
3. **HTTPS**: In production, all traffic should be encrypted using HTTPS.
4. **Input Validation**: User inputs are validated on both client and server sides.
5. **Session Management**: Secure session handling to prevent session hijacking.

## Development Timeline

- 4.15-4.23: Requirements analysis and GUI design
- 4.24-4.30: Basic functionality implementation (user authentication, data entry)
- 5.1-5.10: Data visualization and analysis implementation
- 5.11-5.16: Sharing functionality and final testing

## References

[1] Flask, "Flask Documentation," Flask, 2024. [Online]. Available: https://flask.palletsprojects.com/. [Accessed: 14-May-2025].

[2] SQLAlchemy, "SQLAlchemy Documentation," SQLAlchemy, 2024. [Online]. Available: https://docs.sqlalchemy.org/. [Accessed: 14-May-2025].

[3] Bootstrap, "Bootstrap Documentation," Bootstrap, 2024. [Online]. Available: https://getbootstrap.com/docs/. [Accessed: 14-May-2025].

[4] Chart.js, "Chart.js Documentation," Chart.js, 2024. [Online]. Available: https://www.chartjs.org/docs/latest/. [Accessed: 14-May-2025].

[5] OpenAI, "ChatGPT Assistance for Code Optimization and Debugging," OpenAI, 2025. [Online]. Available: https://openai.com/chatgpt/. [Accessed: 14-May-2025].

[6] Anthropic, "Claude 3.7 Sonnet Assistance for Code Analysis and UI Implementation," Anthropic, 2025. [Online]. Available: https://www.anthropic.com/claude. [Accessed: 16-May-2025].

[7] Buysse, D. J., Reynolds, C. F., Monk, T. H., et al., "The Pittsburgh Sleep Quality Index (PSQI): A New Instrument for Psychiatric Practice and Research," Psychiatry Research, vol. 28, no. 2, pp. 193–213, 1989. [Online]. Available: https://doi.org/10.1016/0165-1781(89)90047-4. [Accessed: 16-May-2025].

[8] Knutson, K. L., & Van Cauter, E., "Associations Between Sleep Loss and Increased Risk of Obesity and Diabetes," Annals of the New York Academy of Sciences, vol. 1129, pp. 287–304, 2008. [Online]. Available: https://doi.org/10.1196/annals.1417.033. [Accessed: 16-May-2025].

[9] Grandner, M. A., et al., "Social and Behavioral Determinants of Perceived Insufficient Sleep," Frontiers in Neurology, vol. 1, p. 8, 2010. [Online]. Available: https://doi.org/10.3389/fneur.2010.00008. [Accessed: 16-May-2025].

[10] Clark, I., & Landolt, H. P., "Coffee, caffeine, and sleep: A systematic review of epidemiological studies and randomized controlled trials," Sleep Medicine Reviews, vol. 31, pp. 70–78, 2017. [Online]. Available: https://www.sciencedirect.com/science/article/pii/S1087079216000150. [Accessed: 16-May-2025].

[11] Chang, A. M., et al., "Evening use of light-emitting eReaders negatively affects sleep, circadian timing, and next-morning alertness," Proceedings of the National Academy of Sciences, vol. 112, no. 4, pp. 1232–1237, 2015. [Online]. Available: https://www.pnas.org/content/112/4/1232. [Accessed: 16-May-2025].

[12] St-Onge, M. P., et al., "Meal timing and frequency: Implications for cardiovascular disease prevention: A scientific statement from the American Heart Association," Circulation, vol. 135, no. 9, pp. e96–e121, 2016. [Online]. Available: https://www.ahajournals.org/doi/10.1161/CIR.0000000000000476. [Accessed: 16-May-2025].

---

_This project is being developed as part of the CITS3403/CITS5505 unit at the University of Western Australia._

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import uuid

@pytest.fixture
def driver():
    driver = webdriver.Chrome()
    yield driver
    driver.quit()

def test_homepage_loads(driver):
    driver.get("http://127.0.0.1:5000/")
    assert "SleepTracker" in driver.title  # Adjust if your <title> is different


def test_login_page(driver):
    driver.get("http://127.0.0.1:5000/login")
    assert "Login" in driver.page_source
    assert "Welcome Back" in driver.page_source

def test_register_page(driver):
    driver.get("http://127.0.0.1:5000/register")
    assert "Register" in driver.page_source


def test_user_login(driver):
    driver.get("http://127.0.0.1:5000/login")

    driver.find_element(By.ID, "email").send_keys("seleniumuser@example.com")
    driver.find_element(By.ID, "password").send_keys("password123")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    WebDriverWait(driver, 10).until(EC.url_contains("/dashboard"))
    assert "Dashboard" in driver.page_source

def test_invalid_login(driver):
    driver.get("http://127.0.0.1:5000/login")

    driver.find_element(By.ID, "email").send_keys("wronguser@example.com")
    driver.find_element(By.ID, "password").send_keys("wrongpass")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    # Wait until URL stays or returns to /login
    WebDriverWait(driver, 10).until(EC.url_contains("/login"))

    # Confirm that we didn't go to dashboard
    assert "Welcome Back" in driver.page_source  # Still on login page

    # Be lenient if it's /login or includes parameters
    assert "/login" in driver.current_url or driver.current_url.endswith("/login")

def test_login_to_register_navigation(driver):
    driver.get("http://127.0.0.1:5000/login")
    register_link = driver.find_element(By.LINK_TEXT, "Register")
    register_link.click()

    WebDriverWait(driver, 5).until(EC.url_contains("/register"))
    assert "Register" in driver.page_source

def test_register_to_login_navigation(driver):
    driver.get("http://127.0.0.1:5000/register")

    # Wait for and click the "Login" link
    login_link = WebDriverWait(driver, 5).until(
        EC.element_to_be_clickable((By.LINK_TEXT, "Login"))  # Adjust if your link says something else
    )
    login_link.click()

    # Verify we land on the login page
    WebDriverWait(driver, 5).until(EC.url_contains("/login"))
    assert "Welcome Back" in driver.page_source or "Login" in driver.title


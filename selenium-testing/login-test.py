import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.firefox import GeckoDriverManager
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains


# Set up Firefox WebDriver
from selenium.webdriver.firefox.service import Service
service = Service("/opt/homebrew/bin/geckodriver")
options = webdriver.FirefoxOptions()
options.add_argument("-private") 
options.set_preference("dom.disable_open_during_load", False)  # Allow popups
driver = webdriver.Firefox(service=service, options=options)

# Define your local website
BASE_URL = "http://localhost:5173/"

def open_login_page():
    """Navigate to the login page"""
    driver.get(BASE_URL)
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))

    # Click Profile icon (if applicable)
    WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//a[@href='/myProfile']"))
    ).click()
    print("✅ Profile icon clicked")

def login(username, email, password):
    """Helper function to input login details"""
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))

    # Locate input fields
    username_field = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Username']"))
    )
    email_field = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Email']"))
    )
    password_field = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Password']"))
    )

    # Enter values
    username_field.send_keys(username)
    email_field.send_keys(email)
    password_field.send_keys(password)
    print("✅ Username, Email, and Password entered")

    # Click the login button
    login_button = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//button[contains(text(), 'Login')]"))
    )
    login_button.click()
    print("✅ Form submitted")

def test_valid_login():
    """Test case for valid login"""
    open_login_page()
    login("test_user", "test_user@gmail.com", "test1234")

    # Wait for successful login
    try:
        WebDriverWait(driver, 10).until(
            EC.url_contains("/dashboard")
        )
        print("✅ Login successful, redirected to dashboard")
    except Exception:
        print("❌ Login failed unexpectedly")

def test_invalid_login():
    """Test case for invalid login"""
    open_login_page()
    login("wrong_user", "wrong_email@gmail.com", "wrongpassword")

    # Check for error message
    # try:
    #     error_message = WebDriverWait(driver, 10).until(
    #         EC.visibility_of_element_located((By.XPATH, "//p[contains(text(), 'Invalid username or password')]"))
    #     )
    #     print("✅ Error message displayed:", error_message.text)
    #     print("❌ Login failed as expected")
    # except Exception:
    #     print("❌ Expected error message not found")
        
    # from selenium.webdriver.common.alert import Alert

    try:
        WebDriverWait(driver, 5).until(EC.alert_is_present())  # Wait for alert
        alert = alert(driver)
        assert "auth/invalid-credential" in alert.text
        print("✅ Correct error alert detected")
        alert.accept()  # Close the alert
    except:
        print("❌ No alert detected or incorrect error message")


# def test_google_login():
#     """Test case for Google login"""
#     open_login_page()

#     # Click 'Login with Google' button
#     try:
#         google_login_button = WebDriverWait(driver, 10).until(
#             EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Log in with Google')]"))
#         )
#         google_login_button.click()
#         print("✅ Clicked 'Login with Google'")

#         # Wait for Google login popup (handle multiple windows)
#         WebDriverWait(driver, 10).until(lambda d: len(d.window_handles) > 1)
#         google_window = driver.window_handles[1]
#         driver.switch_to.window(google_window)
#         print("🔄 Switched to Google login window")

#         # Enter Google credentials (modify XPATHs as needed)
#         email_input = WebDriverWait(driver, 10).until(
#             EC.presence_of_element_located((By.XPATH, "//input[@type='email']"))
#         )
#         email_input.send_keys("your_google_email@gmail.com")
#         email_input.send_keys(Keys.RETURN)

#         time.sleep(2)  # Adjust based on Google's response time

#         password_input = WebDriverWait(driver, 10).until(
#             EC.presence_of_element_located((By.XPATH, "//input[@type='password']"))
#         )
#         password_input.send_keys("your_google_password")
#         password_input.send_keys(Keys.RETURN)

#         print("✅ Google credentials entered")

#         # Wait for login completion and switch back
#         WebDriverWait(driver, 10).until(lambda d: len(d.window_handles) == 1)
#         driver.switch_to.window(driver.window_handles[0])
#         print("🔄 Switched back to main window")

#         # Check if redirected to dashboard
#         WebDriverWait(driver, 10).until(
#             EC.url_contains("/dashboard")
#         )
#         print("✅ Google Login successful")

    # except Exception as e:
    #     print("❌ Google Login failed:", e)
    
def test_google_login():
    open_login_page()

    # Click 'Login with Google' button
    try:
        driver.delete_all_cookies()

        google_login_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[descendant::img[contains(@src, 'google-icon')]]"))
        )
        google_login_button.click()
        print("✅ Clicked 'Log in with Google'")

        # Wait for Google login popup
        WebDriverWait(driver, 10).until(lambda d: len(d.window_handles) > 1)
        new_window = [w for w in driver.window_handles if w != driver.current_window_handle][0]
        driver.switch_to.window(new_window)
        print("🔄 Switched to Google login window")

        # Enter email
        email_input = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
        email_input.send_keys("minetteasiarmada@gmail.com")
        print("✅ Email inputted")
        email_input.send_keys(Keys.RETURN)

        # Wait for password field
        # password_input = WebDriverWait(driver, 15).until(
        #     EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password']"))
        # )
        # password_input = WebDriverWait(driver, 15).until(
        #     EC.presence_of_element_located((By.NAME, "hiddenPassword"))
        # )
        # driver.execute_script("arguments[0].style.display = 'block';", password_input)
        # password_input.click()  # Ensure it's focused
        # password_input.send_keys("2228minette")
        # password_input = WebDriverWait(driver, 15).until(
        #     EC.presence_of_element_located((By.NAME, "hiddenPassword"))
        # )
        # ActionChains(driver).move_to_element(password_input).click().send_keys("2228minette").perform()
        # password_input.send_keys(Keys.RETURN)
        
        input("Enter the password manually in the browser, then press Enter here to continue...")

        
        # password_input = WebDriverWait(driver, 15).until(
        #     EC.presence_of_element_located((By.NAME, "hiddenPassword"))
        # )

        # # Scroll into view
        # driver.execute_script("arguments[0].scrollIntoView();", password_input)

        # # Click using JavaScript to avoid MoveTargetOutOfBoundsError
        # driver.execute_script("arguments[0].click();", password_input)

        # # Send password
        # password_input.send_keys("2228minette")
        # password_input.send_keys(Keys.RETURN)


        print("✅ Google credentials entered")

        # Wait for redirection back to main page
        WebDriverWait(driver, 10).until(lambda d: len(d.window_handles) == 1)
        driver.switch_to.window(driver.window_handles[0])
        print("🔄 Switched back to main window")

        # Verify successful login
        WebDriverWait(driver, 10).until(EC.url_contains("/dashboard"))
        print("✅ Google Login successful")

    except Exception as e:
        print("❌ Google Login failed:", e)

# Run tests
test_valid_login() # this works
test_invalid_login() # this works
test_google_login() # not yet working

# Close browser
driver.quit()

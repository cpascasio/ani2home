import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.firefox.service import Service

# Set up Firefox WebDriver
service = Service("/opt/homebrew/bin/geckodriver")
options = webdriver.FirefoxOptions()
options.add_argument("-private")  
options.set_preference("dom.disable_open_during_load", False)  # Allow popups
driver = webdriver.Firefox(service=service, options=options)

# Define local website
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
            EC.url_contains("/myProfile")  # Adjust this based on your site
        )
        print("✅ Login successful, redirected to myProfile")
    except Exception:
        print("❌ Login failed unexpectedly")

def test_add_to_cart():
    print("🛒 Starting 'Add to Cart' test")
    
    test_valid_login()

    # Navigate to the shop page
    driver.get(BASE_URL + "products")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    print("✅ Shop page loaded")

    # Scroll to load all products
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(5)  # Allow additional time for loading

    def get_products():
        """Fetches the list of product elements after page reload"""
        return WebDriverWait(driver, 15).until(
            EC.presence_of_all_elements_located(
                (By.XPATH, "//div[contains(@class, 'border-gray-300 rounded-lg')]")  # Updated class selector
            )
        )

    # Get initial product list
    products = get_products()
    print(f"✅ {len(products)} products detected.")

    if len(products) < 2:
        print("❌ Not enough products available to add two items to the cart.")
        driver.quit()
        return

    def add_product_to_cart(product_index):
        """Clicks on the product, adds it to cart, and navigates back"""
        
        # Reload the product list to avoid stale elements
        driver.get(BASE_URL + "products")  
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        time.sleep(3)  # Allow time for products to load
        
        # Re-fetch products after reloading the page
        products = WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located(
                (By.XPATH, "//div[contains(@class, 'border-gray-300 rounded-lg')]")  # Updated class selector
            )
        )
        
        if product_index >= len(products):
            print(f"❌ Product index {product_index} out of range. Only {len(products)} products found.")
            return

        # Click the correct product
        product = products[product_index]
        driver.execute_script("arguments[0].scrollIntoView();", product)  # Ensure product is visible
        product.click()  
        print(f"✅ Clicked on Product {product_index + 1}")

        # Click 'Add to Cart' button
        try:
            add_to_cart_button = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(@class, 'bg-green-900 text-white')]"))
            )
            add_to_cart_button.click()
            print(f"✅ Product {product_index + 1} added to cart")
        except:
            print(f"❌ Failed to add Product {product_index + 1} to cart.")

        time.sleep(2)  # Allow time for cart update


    # Add first and second products
    add_product_to_cart(0)
    add_product_to_cart(1)

    # Navigate to cart page
    driver.get(BASE_URL + "cart")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    print("✅ Cart page loaded")
    
    time.sleep(3)  # Allow time for cart items to load
    
    # Check if at least two items are in cart
    cart_items = driver.find_elements(By.XPATH, "//div[contains(@class, 'border-gray-300 relative')]")
    if len(cart_items) >= 2:
        print(f"✅ {len(cart_items)} items found in cart. Test successful!")
    else:
        print("❌ Expected at least 2 items in cart, but found less.")


# Run test
test_add_to_cart()


# Close browser
driver.quit()

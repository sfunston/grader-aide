require "selenium-webdriver"
require "rspec"

# TEST: log in for GraderAide
describe "GraderAide" do
    describe "login to the GraderAide app" do
        it "confirm unregistered user cannot login" do
            driver = Selenium::WebDriver.for :firefox
            # Go to login form
            driver.navigate.to "https://grader-aide-sunfont.c9users.io/"
            
            # Fill out form
            username_field = driver.find_element(id: "username")
            username_field.send_keys("test")
            
            password_field = driver.find_element(id: "password")
            password_field.send_keys("password")
            
            selector_field = driver.find_element(id: "group")
            selector_field.click
            student_field = driver.find_element(id: "student")
            grader_field = driver.find_element(id: "grader")
            student_field.click
            grader_field.click
            
            login_button = driver.find_element(id: "Login")
            login_button.click
            
            # Confirm that login was unsuccessful
            alert = driver.find_element(id: "alert")
            alert_text = alert.text
            expect(alert_text).to eq("Error Login fail. User test does not exist!")
            
            driver.quit
        end
    end
end
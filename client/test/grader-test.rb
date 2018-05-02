require "selenium-webdriver"
require "rspec"

# TEST: create course, assignment, save, logout
describe "GraderAide" do
    describe "create course, assignment, save, logout" do
        driver = Selenium::WebDriver.for :firefox
        driver.navigate.to "https://grader-aide-sunfont.c9users.io/"
        
        addCourse_button = driver.find_element(id: "addCourse")
        addCourse_button.click
        
        editCourse_button = driver.find_element(id: "editCourse")
        editCourse_button.click
        
        course_field = driver.find_element(id: "course")
        course_field.double_click
        course_field.send_keys("4690")
        course_field.press("\ue007")
        
        newAssn_button = driver.find_element(id: "newAssn")
        newAssn_button.click
        
        assnName_field = driver.find_element(id: "assnName")
        assnName_field.double_click
        assnName_field.send_keys("Final")
        assnName_field.press("\ue007")
        
        possPts_field = driver.find_element(id: "possPts")
        possPts_field.click
        possPts_field.send_keys("20")
        
        addRule_button = driver.find_element(id: "addRule")
        addRule_button.click
        
        rulePts_field = driver.find_element(id: "rulePts")
        rulePts_field.send_keys("22")
        
        ruleDesc_field = driver.find_element(id: "ruleDesc")
        ruleDesc_field.send_keys("Early")
        
        addBtn_button = driver.find_element(id: "addBtn")
        addBtn_button.click
        
        editRule_button = driver.find_element(id: "editRule")
        editRule_button.click
        
        points_field = driver.find_element(id: "points")
        points_field.double_click
        points_field.send_keys("2")
        
        desc_field = driver.find_element(id: "desc")
        desc_field.double_click
        desc_field.send_keys("kinda early")
        points_field.click
        points_field.press("\ue007")
        
        remove_button = driver.find_element(id: "Remove")
        remove_button.click
        
        undoRule_button = driver.find_element(id: "undoRule")
        undoRule_button.click
        
        rubric_checkbox = driver.find_element(id: "rubric")
        rubric_checkbox.click
        
        addCmnt_field = driver.find_element(id: "addCmnt")
        addCmnt_field.send_keys("Great job Parker and Sam!")
        addCmnt_field.press("\ue007")
        
        copyText_field = driver.find_element(id: "copyText")
        copyText_field.double_click
        copyText_field.send_keys("jorb!")
        
        copyBtn_button = driver.find_element(id: "copyBtn")
        copyBtn_button.click
        
        clearCmnt_button = driver.find_element(id: "clearCmnt")
        clearCmnt_button.click
        
        saveAssn_button = driver.find_element(id: "saveAssn")
        saveAssn_button.click
        
        navbarDropdownMenuLink_button = driver.find_element(id: "navbarDropdownMenuLink")
        navbarDropdownMenuLink_button.click
        
        logout_button = driver.find_element(id: "logout")
        logout_button.click
    end
end
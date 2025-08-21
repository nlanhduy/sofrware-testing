import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import com.kms.katalon.core.util.KeywordUtil
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import static com.kms.katalon.core.testobject.ObjectRepository.findWindowsObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import com.kms.katalon.core.cucumber.keyword.CucumberBuiltinKeywords as CucumberKW
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testng.keyword.TestNGBuiltinKeywords as TestNGKW
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.windows.keyword.WindowsBuiltinKeywords as Windows
import internal.GlobalVariable as GlobalVariable
import org.openqa.selenium.Keys as Keys

WebUI.openBrowser('')
WebUI.navigateToUrl('http://localhost:4200/#/admin/products/add')

// --- Login ---
WebUI.setText(findTestObject('Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/input_Login_email'), 'admin@practicesoftwaretesting.com')
WebUI.setEncryptedText(findTestObject('Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/input_Login_password'), 'WeXgXi4njyFD3RjAKOT0dQ==')
WebUI.sendKeys(findTestObject('Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/input_Login_password'), Keys.chord(Keys.ENTER))

// --- Navigation ---
WebUI.click(findTestObject('Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/a_John Doe'))
WebUI.click(findTestObject('Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/a_Products'))
WebUI.click(findTestObject('Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/a_Add Product'))

// --- Fill in form fields using variables ---
WebUI.setText(findTestObject('Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/input_Name_name'), name)
WebUI.setText(findTestObject('Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/textarea_Description_description'), description)
WebUI.setText(findTestObject('Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/input_Stock_stock'), stock)
WebUI.setText(findTestObject('Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/input_Price_price'), price)

// Conditional checkboxes
if (locationOffer == true) {
	WebUI.click(findTestObject('Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/input_Location offer_is_location_offer'))
}
if (itemForRent == true) {
	WebUI.click(findTestObject('Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/input_Item for rent_is_rental'))
}

// Select dropdowns
WebUI.selectOptionByValue(findTestObject('Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/select_Brand name 1Brand name 2'), brandId.toString(), true)
WebUI.selectOptionByValue(findTestObject('Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/select_Hand ToolsPower ToolsHammerHand SawW_10224b'), categoryId.toString(), true)
WebUI.selectOptionByValue(findTestObject('Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/select_Combination pliersPliersBolt cutters_d900c7'), imageId.toString(), true)

// Click Save
WebUI.click(findTestObject('Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/button_Save'))

// --- Validation message checking ---
Map<String, String> messageToObjectPath = [
    "Product saved!"                                             : 'Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/div_Product saved',
    "Name is required"                                           : 'Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/div_Name is required',
    "The name field must not be greater than 120 characters"     : 'Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/div_Name max 120',
    "Description is required"                                    : 'Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/div_Description is required',
    "The description field must not be greater than 1250 characters" : 'Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/div_Description max 1250',
    "Quantity is required"                                       : 'Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/div_Quantity is required',
    "Stock cannot be negative"                                   : 'Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/div_Stock cannot be negative',
    "Stock must be a whole number OR system rounds to nearest integer" : 'Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/div_Stock must be whole',
    "Price must be greater than 0"                               : 'Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/div_Price must be greater than 0',
    "Price cannot be negative"                                   : 'Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/div_Price cannot be negative',
    "The price field must be a number"                           : 'Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/div_The price field must be a number',
    "Price is required"                                          : 'Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/div_Price is required',
    "Brand selection is required"                                : 'Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/div_Brand required',
    "Category selection is required"                             : 'Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/div_Category required',
    "Image selection is required"                                : 'Object Repository/Page_Practice Software Testing - Toolshop -_8413b3/div_Image required'
]

List<String> messages = expectedMessage.split(',')
boolean allMessagesFound = true

for (String msg : messages) {
	msg = msg.trim()

	if (!messageToObjectPath.containsKey(msg)) {
		WebUI.comment("❌ No TestObject defined for message: " + msg)
		allMessagesFound = false
		continue
	}

	String objPath = messageToObjectPath[msg]

	TestObject testObj = findTestObject(objPath)
	if (!WebUI.verifyElementPresent(testObj, 2, FailureHandling.OPTIONAL)) {
		WebUI.comment("❌ Message not found: " + msg + " at: " + objPath)
		allMessagesFound = false
	} else {
		WebUI.comment("✅ Message found: " + msg)
	}
}

if (!allMessagesFound) {
	KeywordUtil.markFailed("❌ TEST FAILED: One or more expected messages were missing or not defined.")
} else {
	WebUI.comment("✅ TEST PASSED: All expected messages are correctly displayed.")
}

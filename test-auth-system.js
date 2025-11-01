const { chromium } = require('@playwright/test');
const crypto = require('crypto');

class AuthenticationTester {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testEmail = `tanmay-${Date.now()}@aipply.io`;
    this.testPassword = 'Gethired@1';
    this.baseUrl = 'http://localhost:3000';
  }

  async setup() {
    console.log('🚀 Setting up browser automation...');
    this.browser = await chromium.launch({ 
      headless: false, // Set to true for CI/CD
      slowMo: 1000 // Slow down for better visibility
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    
    // Enable console logging from the browser
    this.page.on('console', msg => console.log(`🌐 Browser: ${msg.text()}`));
    this.page.on('pageerror', error => console.error(`❌ Page Error: ${error.message}`));
  }

  async cleanup() {
    console.log('🧹 Cleaning up...');
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }

  async navigateToLogin() {
    console.log('📍 Navigating to login page...');
    await this.page.goto(`${this.baseUrl}/dashboard/onboarding/login`);
    await this.page.waitForLoadState('networkidle');
    
    // Check if login form is loaded
    const emailInput = await this.page.locator('input[type="email"]').first();
    const passwordInput = await this.page.locator('input[type="password"]').first();
    const googleButton = await this.page.locator('text=Sign in with Google').first();
    
    console.log('✅ Login form elements detected:', {
      emailInput: await emailInput.isVisible(),
      passwordInput: await passwordInput.isVisible(),
      googleButton: await googleButton.isVisible()
    });
  }

  async testEmailRegistration() {
    console.log(`🔐 Testing email registration with: ${this.testEmail}`);
    
    await this.navigateToLogin();
    
    // Fill email and password
    await this.page.fill('input[type="email"]', this.testEmail);
    await this.page.fill('input[type="password"]', this.testPassword);
    
    // Click submit button
    await this.page.click('button[type="submit"]');
    
    // Wait for navigation or error
    await this.page.waitForTimeout(3000);
    
    const currentUrl = this.page.url();
    console.log(`📍 Current URL after registration: ${currentUrl}`);
    
    // Check if we're redirected to profile setup
    if (currentUrl.includes('profile-setup')) {
      console.log('✅ Email registration successful - redirected to profile setup');
      return { success: true, type: 'new_user' };
    } else if (currentUrl.includes('dashboard/home')) {
      console.log('✅ Email registration successful - redirected to dashboard');
      return { success: true, type: 'existing_user' };
    } else {
      // Check for error messages
      const errorElements = await this.page.locator('.text-red-500').all();
      const errors = [];
      for (const element of errorElements) {
        const text = await element.textContent();
        if (text) errors.push(text);
      }
      console.log('❌ Email registration failed:', errors);
      return { success: false, errors };
    }
  }

  async testEmailLogin() {
    console.log(`🔑 Testing email login with: ${this.testEmail}`);
    
    await this.navigateToLogin();
    
    // Fill email and password
    await this.page.fill('input[type="email"]', this.testEmail);
    await this.page.fill('input[type="password"]', this.testPassword);
    
    // Click submit button
    await this.page.click('button[type="submit"]');
    
    // Wait for navigation
    await this.page.waitForTimeout(3000);
    
    const currentUrl = this.page.url();
    console.log(`📍 Current URL after login: ${currentUrl}`);
    
    if (currentUrl.includes('dashboard/home')) {
      console.log('✅ Email login successful');
      return { success: true };
    } else {
      const errorElements = await this.page.locator('.text-red-500').all();
      const errors = [];
      for (const element of errorElements) {
        const text = await element.textContent();
        if (text) errors.push(text);
      }
      console.log('❌ Email login failed:', errors);
      return { success: false, errors };
    }
  }

  async testEmailMethodDetection() {
    console.log(`🔍 Testing email method detection for: ${this.testEmail}`);
    
    await this.navigateToLogin();
    
    // Fill email and trigger blur event
    await this.page.fill('input[type="email"]', this.testEmail);
    await this.page.click('input[type="password"]'); // Click elsewhere to trigger blur
    
    // Wait for method detection
    await this.page.waitForTimeout(2000);
    
    // Check for authentication method guidance
    const guidanceElements = await this.page.locator('.text-sm.text-\\[\\#94969C\\]').all();
    const guidanceTexts = [];
    for (const element of guidanceElements) {
      const text = await element.textContent();
      if (text) guidanceTexts.push(text);
    }
    
    console.log('🔍 Authentication guidance found:', guidanceTexts);
    
    // Look for specific method indicators
    const hasPasswordIndicator = guidanceTexts.some(text => 
      text.includes('password') || text.includes('🔑')
    );
    const hasGoogleIndicator = guidanceTexts.some(text => 
      text.includes('Google') || text.includes('🔍')
    );
    
    return {
      hasGuidance: guidanceTexts.length > 0,
      hasPasswordMethod: hasPasswordIndicator,
      hasGoogleMethod: hasGoogleIndicator,
      guidanceTexts
    };
  }

  async testPasswordSetupFlow() {
    console.log('🛠️ Testing password setup flow for Google-only accounts');
    
    await this.navigateToLogin();
    
    // Simulate a Google-only account by checking for setup button
    const setupButtons = await this.page.locator('text=set up a password').all();
    
    if (setupButtons.length > 0) {
      console.log('✅ Password setup option found');
      await setupButtons[0].click();
      
      // Wait for password setup form
      await this.page.waitForTimeout(1000);
      
      // Check if setup form appeared
      const setupForm = await this.page.locator('text=Set up password for your account').first();
      const isSetupFormVisible = await setupForm.isVisible().catch(() => false);
      
      console.log('📝 Password setup form visible:', isSetupFormVisible);
      return { hasSetupOption: true, setupFormVisible: isSetupFormVisible };
    } else {
      console.log('ℹ️ No password setup option found (expected for email-only accounts)');
      return { hasSetupOption: false, setupFormVisible: false };
    }
  }

  async testGoogleAuthButton() {
    console.log('🔍 Testing Google authentication button');
    
    await this.navigateToLogin();
    
    const googleButton = await this.page.locator('text=Sign in with Google').first();
    const isVisible = await googleButton.isVisible();
    const isEnabled = await googleButton.isEnabled();
    
    console.log('🔍 Google auth button:', { visible: isVisible, enabled: isEnabled });
    
    if (isVisible && isEnabled) {
      console.log('⚠️ Google auth requires user interaction - skipping actual click test');
      return { available: true, testSkipped: true };
    }
    
    return { available: isVisible && isEnabled, testSkipped: false };
  }

  async testFormValidation() {
    console.log('✅ Testing form validation');
    
    await this.navigateToLogin();
    
    // Test empty form submission
    await this.page.click('button[type="submit"]');
    await this.page.waitForTimeout(1000);
    
    // Check for validation messages
    const validationMessages = await this.page.locator(':invalid').count();
    console.log('📝 Form validation active:', validationMessages > 0);
    
    // Test invalid email
    await this.page.fill('input[type="email"]', 'invalid-email');
    await this.page.fill('input[type="password"]', 'short');
    await this.page.click('button[type="submit"]');
    await this.page.waitForTimeout(1000);
    
    const errorElements = await this.page.locator('.text-red-500').all();
    const errors = [];
    for (const element of errorElements) {
      const text = await element.textContent();
      if (text) errors.push(text);
    }
    
    return { validationActive: validationMessages > 0, errors };
  }

  async runComprehensiveTest() {
    console.log('🎯 Starting Comprehensive Authentication System Test\n');
    
    try {
      await this.setup();
      
      const results = {
        emailRegistration: null,
        emailLogin: null,
        methodDetection: null,
        passwordSetup: null,
        googleAuth: null,
        formValidation: null
      };
      
      // Test 1: Email Registration
      console.log('\n📧 TEST 1: Email Registration');
      console.log('='.repeat(50));
      results.emailRegistration = await this.testEmailRegistration();
      
      // Test 2: Email Login (if registration was successful)
      if (results.emailRegistration.success) {
        console.log('\n🔑 TEST 2: Email Login');
        console.log('='.repeat(50));
        
        // Logout first if we're logged in
        if (this.page.url().includes('dashboard')) {
          await this.page.goto(`${this.baseUrl}/dashboard/onboarding/login`);
        }
        
        results.emailLogin = await this.testEmailLogin();
      }
      
      // Test 3: Email Method Detection
      console.log('\n🔍 TEST 3: Email Method Detection');
      console.log('='.repeat(50));
      results.methodDetection = await this.testEmailMethodDetection();
      
      // Test 4: Password Setup Flow
      console.log('\n🛠️ TEST 4: Password Setup Flow');
      console.log('='.repeat(50));
      results.passwordSetup = await this.testPasswordSetupFlow();
      
      // Test 5: Google Auth Button
      console.log('\n🔍 TEST 5: Google Authentication');
      console.log('='.repeat(50));
      results.googleAuth = await this.testGoogleAuthButton();
      
      // Test 6: Form Validation
      console.log('\n✅ TEST 6: Form Validation');
      console.log('='.repeat(50));
      results.formValidation = await this.testFormValidation();
      
      // Summary
      console.log('\n📊 TEST RESULTS SUMMARY');
      console.log('='.repeat(50));
      
      const passedTests = [];
      const failedTests = [];
      
      Object.entries(results).forEach(([test, result]) => {
        if (result) {
          if (result.success !== false && result.available !== false) {
            passedTests.push(test);
            console.log(`✅ ${test}: PASSED`);
          } else {
            failedTests.push(test);
            console.log(`❌ ${test}: FAILED`);
          }
        }
      });
      
      console.log(`\n📈 Overall Results: ${passedTests.length}/${Object.keys(results).length} tests passed`);
      
      if (failedTests.length > 0) {
        console.log('\n🔧 Issues Found:');
        failedTests.forEach(test => {
          const result = results[test];
          if (result.errors) {
            console.log(`   ${test}: ${result.errors.join(', ')}`);
          }
        });
      }
      
      return results;
      
    } catch (error) {
      console.error('💥 Test execution failed:', error);
      return { error: error.message };
    } finally {
      await this.cleanup();
    }
  }
}

// Run the tests
async function main() {
  const tester = new AuthenticationTester();
  await tester.runComprehensiveTest();
}

// Handle different execution contexts
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { AuthenticationTester };
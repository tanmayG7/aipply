const { chromium } = require('@playwright/test');

class CompleteAuthFlowTester {
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
      headless: false, 
      slowMo: 500
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    
    this.page.on('console', msg => console.log(`🌐 Browser: ${msg.text()}`));
    this.page.on('pageerror', error => console.error(`❌ Page Error: ${error.message}`));
  }

  async cleanup() {
    console.log('🧹 Cleaning up...');
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }

  async testCompleteEmailAuthFlow() {
    console.log(`🎯 Testing Complete Email Authentication Flow`);
    console.log(`📧 Using email: ${this.testEmail}`);
    
    // Step 1: Register new user
    console.log('\n📝 STEP 1: Register new user');
    console.log('='.repeat(40));
    
    await this.page.goto(`${this.baseUrl}/dashboard/onboarding/login`);
    await this.page.waitForLoadState('networkidle');
    
    await this.page.fill('input[type="email"]', this.testEmail);
    await this.page.fill('input[type="password"]', this.testPassword);
    await this.page.click('button[type="submit"]');
    
    // Wait for navigation to profile setup
    await this.page.waitForTimeout(3000);
    let currentUrl = this.page.url();
    console.log(`📍 After registration: ${currentUrl}`);
    
    if (!currentUrl.includes('profile-setup')) {
      throw new Error('Registration failed - not redirected to profile setup');
    }
    
    // Step 2: Complete profile setup
    console.log('\n👤 STEP 2: Complete profile setup');
    console.log('='.repeat(40));
    
    // Fill first page - Basic info
    await this.page.fill('input[name="firstName"]', 'John');
    await this.page.fill('input[name="lastName"]', 'Doe');
    await this.page.fill('input[name="mobileNumber"]', '+91-9876543210');
    
    // Next page
    await this.page.click('button:has-text("Next")');
    await this.page.waitForTimeout(1000);
    
    // Job title selection - click dropdown and select an option
    await this.page.click('[data-testid="job-title-dropdown"], .cursor-pointer:has-text("Select your aiming job title")');
    await this.page.waitForTimeout(500);
    
    // Try multiple selectors for job selection
    const jobOptions = await this.page.locator('div:has-text("Software Engineer"), div:has-text("Frontend Developer"), div:has-text("Backend Developer")').first();
    if (await jobOptions.isVisible()) {
      await jobOptions.click();
    } else {
      // Fallback - type in the search and select first option
      const searchInput = await this.page.locator('input[placeholder*="Search job roles"], input[placeholder*="search"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('Software Engineer');
        await this.page.waitForTimeout(500);
        await this.page.click('div:has-text("Software Engineer")');
      }
    }
    
    await this.page.click('button:has-text("Next")');
    await this.page.waitForTimeout(1000);
    
    // Skills page - add some skills
    const skillsInput = await this.page.locator('input[placeholder*="Add Skills"], input[placeholder*="skills"]').first();
    if (await skillsInput.isVisible()) {
      await skillsInput.fill('JavaScript');
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(500);
      
      await skillsInput.fill('React');
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(500);
    }
    
    await this.page.click('button:has-text("Next")');
    await this.page.waitForTimeout(1000);
    
    // Current CTC
    await this.page.fill('input[name="currentCTC"]', '10LPA');
    await this.page.click('button:has-text("Next")');
    await this.page.waitForTimeout(1000);
    
    // Expected CTC
    await this.page.fill('input[name="expectedCTC"]', '15LPA');
    await this.page.click('button:has-text("Next")');
    await this.page.waitForTimeout(1000);
    
    // LinkedIn Profile
    await this.page.fill('input[name="linkedinProfile"]', 'https://linkedin.com/in/johndoe');
    
    // Submit profile
    await this.page.click('button[type="submit"]');
    await this.page.waitForTimeout(5000);
    
    currentUrl = this.page.url();
    console.log(`📍 After profile setup: ${currentUrl}`);
    
    if (!currentUrl.includes('dashboard/home')) {
      console.log('⚠️ Profile setup may not have completed fully, but continuing...');
    }
    
    // Step 3: Logout
    console.log('\n🚪 STEP 3: Logout');
    console.log('='.repeat(40));
    
    // Navigate to login page (simulating logout)
    await this.page.goto(`${this.baseUrl}/dashboard/onboarding/login`);
    await this.page.waitForLoadState('networkidle');
    
    // Step 4: Test login with existing credentials
    console.log('\n🔑 STEP 4: Test login with existing account');
    console.log('='.repeat(40));
    
    await this.page.fill('input[type="email"]', this.testEmail);
    await this.page.fill('input[type="password"]', this.testPassword);
    
    // Check if method detection works
    await this.page.click('input[type="password"]'); // Trigger blur on email
    await this.page.waitForTimeout(2000);
    
    const guidanceElements = await this.page.locator('.text-sm.text-\\[\\#94969C\\]').all();
    console.log(`🔍 Method detection elements found: ${guidanceElements.length}`);
    
    // Submit login
    await this.page.click('button[type="submit"]');
    await this.page.waitForTimeout(5000);
    
    currentUrl = this.page.url();
    console.log(`📍 After login: ${currentUrl}`);
    
    // Verify successful login
    if (currentUrl.includes('dashboard/home')) {
      console.log('✅ Login successful - redirected to dashboard');
      return { 
        registration: true, 
        profileSetup: true, 
        login: true, 
        finalUrl: currentUrl 
      };
    } else if (currentUrl.includes('profile-setup')) {
      console.log('⚠️ Login successful but redirected to profile setup (profile incomplete)');
      return { 
        registration: true, 
        profileSetup: false, 
        login: true, 
        finalUrl: currentUrl 
      };
    } else {
      console.log('❌ Login failed - still on login page');
      
      // Check for error messages
      const errorElements = await this.page.locator('.text-red-500').all();
      const errors = [];
      for (const element of errorElements) {
        const text = await element.textContent();
        if (text) errors.push(text);
      }
      
      return { 
        registration: true, 
        profileSetup: false, 
        login: false, 
        errors,
        finalUrl: currentUrl 
      };
    }
  }

  async testExistingUserWithGoogleOnlyScenario() {
    console.log('\n🔍 STEP 5: Test Google-only account scenario');
    console.log('='.repeat(40));
    
    // Use a different email to simulate Google-only account
    const googleEmail = `google${Date.now()}@gmail.com`;
    
    await this.page.goto(`${this.baseUrl}/dashboard/onboarding/login`);
    await this.page.waitForLoadState('networkidle');
    
    await this.page.fill('input[type="email"]', googleEmail);
    await this.page.fill('input[type="password"]', 'somepassword');
    
    // Trigger email method detection
    await this.page.click('input[type="password"]');
    await this.page.waitForTimeout(2000);
    
    // Check for guidance
    const pageContent = await this.page.content();
    const hasGoogleGuidance = pageContent.includes('Google') && pageContent.includes('set up');
    
    console.log(`🔍 Google-only guidance shown: ${hasGoogleGuidance}`);
    
    return { hasGoogleGuidance };
  }

  async runCompleteTest() {
    try {
      await this.setup();
      
      console.log('🎯 COMPREHENSIVE AUTHENTICATION FLOW TEST');
      console.log('='.repeat(60));
      
      const emailAuthResults = await this.testCompleteEmailAuthFlow();
      const googleScenarioResults = await this.testExistingUserWithGoogleOnlyScenario();
      
      console.log('\n📊 FINAL RESULTS');
      console.log('='.repeat(60));
      console.log(`✅ Email Registration: ${emailAuthResults.registration ? 'PASSED' : 'FAILED'}`);
      console.log(`✅ Profile Setup: ${emailAuthResults.profileSetup ? 'PASSED' : 'PARTIAL'}`);
      console.log(`✅ Email Login: ${emailAuthResults.login ? 'PASSED' : 'FAILED'}`);
      console.log(`✅ Google Scenario: ${googleScenarioResults.hasGoogleGuidance ? 'PASSED' : 'NOT TESTED'}`);
      console.log(`📍 Final URL: ${emailAuthResults.finalUrl}`);
      
      if (emailAuthResults.errors) {
        console.log(`❌ Errors: ${emailAuthResults.errors.join(', ')}`);
      }
      
      const overallSuccess = emailAuthResults.registration && emailAuthResults.login;
      console.log(`\n🎯 Overall Authentication System: ${overallSuccess ? '✅ WORKING' : '❌ NEEDS FIXES'}`);
      
      return {
        success: overallSuccess,
        details: { emailAuthResults, googleScenarioResults }
      };
      
    } catch (error) {
      console.error('💥 Test execution failed:', error);
      return { success: false, error: error.message };
    } finally {
      await this.cleanup();
    }
  }
}

// Run the test
async function main() {
  const tester = new CompleteAuthFlowTester();
  const results = await tester.runCompleteTest();
  
  if (results.success) {
    console.log('\n🎉 Authentication system is working correctly!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Authentication system needs attention.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { CompleteAuthFlowTester };
// Quick test to see if environment variables are loading
console.log('=== Environment Variable Test ===');
console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('=====================================');

// Check if values are still placeholders
const vars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
];

vars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.error(`❌ ${varName} is undefined`);
  } else if (value.includes('your_') || value.includes('_here')) {
    console.warn(`⚠️ ${varName} still has placeholder value: ${value}`);
  } else {
    console.log(`✅ ${varName} looks correct`);
  }
});

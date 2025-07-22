#!/usr/bin/env node

// Environment variable validation for Omniplex deployment
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_STRIPE_PRO_PRICE_ID',
  'STRIPE_WEBHOOK_SECRET',
];

const optionalEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'
];

console.log('🔍 Validating environment variables for Omniplex...\n');

let missingRequired = [];
let missingOptional = [];

// Check required variables
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingRequired.push(varName);
  } else {
    console.log(`✅ ${varName}: Set`);
  }
});

// Check optional variables
optionalEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingOptional.push(varName);
  } else {
    console.log(`✅ ${varName}: Set`);
  }
});

console.log('\n' + '='.repeat(50));

if (missingRequired.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingRequired.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n⚠️  These variables are required for deployment!');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set!');
}

if (missingOptional.length > 0) {
  console.log('\n⚠️  Missing optional environment variables:');
  missingOptional.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📝 These will use fallback values from firebaseConfig.js');
}

console.log('\n🚀 Ready for deployment!');
console.log('\nNext steps:');
console.log('1. Run: npm run build (to test locally)');
console.log('2. Run: vercel (for preview) or vercel --prod (for production)');
console.log('3. Set up Stripe webhooks with your Vercel domain');
console.log('4. Add Vercel domain to Firebase authorized domains');

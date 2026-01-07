#!/usr/bin/env node

/**
 * Test script to verify the setup
 * Run with: node test-setup.js
 */

import dotenv from 'dotenv';

dotenv.config();

console.log('=== PDF AI Agent Setup Test ===\n');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
console.log(`✓ Node.js version: ${nodeVersion}`);
if (majorVersion < 18) {
  console.error('✗ Error: Node.js 18 or higher is required');
  process.exit(1);
}

// Check environment variables
console.log('\nEnvironment Variables:');

const requiredEnvVars = {
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID,
  EMBEDDING_MODEL_ID: process.env.EMBEDDING_MODEL_ID,
  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
};

let hasErrors = false;

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (value && value !== 'your_access_key_id' && value !== 'your_secret_access_key' && value !== 'your_pinecone_api_key') {
    const displayValue = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'PINECONE_API_KEY'].includes(key)
      ? '***' + value.slice(-4)
      : value;
    console.log(`  ✓ ${key}: ${displayValue}`);
  } else {
    console.log(`  ✗ ${key}: NOT SET or using example value`);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.log('\n✗ Some environment variables are not properly configured.');
  console.log('Please update your .env file with actual values.\n');
  process.exit(1);
}

console.log('\n=== Setup Test Complete ===');
console.log('✓ All checks passed!');
console.log('\nYou can now run the application:');
console.log('  npm start                  - Interactive mode');
console.log('  npm start upload <file>    - Upload a PDF');
console.log('  npm start query <question> - Query the agent\n');

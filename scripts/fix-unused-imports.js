#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Scanning for unused imports and variables...');

try {
  // Run ESLint with auto-fix for unused imports
  console.log('📝 Fixing unused imports...');
  execSync('npx eslint src --ext .ts,.tsx --fix', { stdio: 'inherit' });
  
  // Run TypeScript compiler to check for any remaining issues
  console.log('🔧 Running TypeScript compiler...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  
  console.log('✅ All unused imports and variables have been fixed!');
} catch (error) {
  console.error('❌ Error during cleanup:', error.message);
  process.exit(1);
} 
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * E2E Test Setup
 *
 * This script prepares the environment for E2E testing.
 * 
 * PREREQUISITES:
 * - The backend API must be running (port 5001)
 * - PostgreSQL must be running with ralph_dashboard database
 * 
 * The E2E tests run against the live development environment.
 * For isolated testing, start the backend with TEST_DATABASE_URL pointing
 * to a separate test database.
 */

async function setup() {
  console.log('🔧 Setting up E2E test environment...\n');

  try {
    // 1. Check backend is running
    console.log('1. Checking backend API...');
    const apiUrl = process.env.API_URL || 'http://localhost:5001';
    
    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        console.log('   ✅ Backend API is running');
      } else {
        console.log('   ⚠️  Backend API returned non-OK status');
      }
    } catch (e) {
      console.log('   ❌ Backend API is not reachable at', apiUrl);
      console.log('   Please start the backend with: npm run dev');
      process.exit(1);
    }

    // 2. Check frontend can be built
    console.log('\n2. Checking frontend...');
    const frontendUrl = process.env.BASE_URL || 'http://localhost:3000';
    
    try {
      const response = await fetch(frontendUrl);
      if (response.ok || response.status === 307) {
        console.log('   ✅ Frontend is running');
      } else {
        console.log('   ⚠️  Frontend returned status', response.status);
      }
    } catch (e) {
      console.log('   ⚠️  Frontend not running - Playwright will start it');
    }

    // 3. Create test output directories
    console.log('\n3. Creating test directories...');
    const dirs = [
      path.join(__dirname, 'test-results'),
      path.join(__dirname, '../e2e-report'),
      path.join(__dirname, '../e2e-screenshots'),
    ];
    
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log('   Created:', dir);
      }
    }
    console.log('   ✅ Test directories ready');

    console.log('\n✅ E2E test environment ready!\n');
    console.log('Run tests with: npm run test:e2e\n');
    console.log('Or with UI: npm run test:e2e:ui\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

setup();

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * E2E Test Setup
 *
 * This script prepares the environment for E2E testing:
 * - Creates test database
 * - Runs migrations
 * - Seeds test data
 * - Sets up test repositories
 */

async function setup() {
  console.log('🔧 Setting up E2E test environment...\n');

  try {
    // 1. Create test database
    console.log('1. Setting up test database...');
    const dbUrl = process.env.TEST_DATABASE_URL ||
      'postgresql://localhost:5432/ralph_dashboard_test';

    try {
      execSync(`psql postgres -c "DROP DATABASE IF EXISTS ralph_dashboard_test;"`, { stdio: 'ignore' });
    } catch (e) {
      // Database might not exist, that's okay
    }

    try {
      execSync(`psql postgres -c "CREATE DATABASE ralph_dashboard_test;"`, { stdio: 'inherit' });
      console.log('   ✅ Test database created');
    } catch (e) {
      console.log('   ⚠️  Database might already exist');
    }

    // 2. Run migrations
    console.log('\n2. Running database migrations...');
    execSync('npm run db:migrate --workspace=packages/api', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: dbUrl },
    });
    console.log('   ✅ Migrations complete');

    // 3. Create test repository directory
    console.log('\n3. Setting up test repository...');
    const testRepoPath = path.join(__dirname, '../test-repos/sample-project');

    if (!fs.existsSync(testRepoPath)) {
      fs.mkdirSync(testRepoPath, { recursive: true });

      // Initialize git repo
      execSync('git init', { cwd: testRepoPath });

      // Create sample files
      fs.writeFileSync(
        path.join(testRepoPath, 'package.json'),
        JSON.stringify({
          name: 'sample-project',
          version: '1.0.0',
          scripts: {
            test: 'echo "Running tests..." && exit 0',
            lint: 'echo "Linting..." && exit 0',
          },
        }, null, 2)
      );

      fs.writeFileSync(
        path.join(testRepoPath, 'README.md'),
        '# Sample Project\n\nThis is a test repository for E2E testing.'
      );

      // Create .ralph directory
      const ralphDir = path.join(testRepoPath, '.ralph');
      fs.mkdirSync(ralphDir, { recursive: true });

      // Create ralph-loop script
      const ralphLoopScript = `#!/bin/bash
# Mock Ralph Loop script for testing
echo "Ralph Loop starting..."
sleep 2
echo "Processing tasks..."
sleep 2
echo "Task completed successfully"
exit 0
`;
      fs.writeFileSync(path.join(ralphDir, 'ralph-loop'), ralphLoopScript);
      fs.chmodSync(path.join(ralphDir, 'ralph-loop'), '755');

      // Commit files
      execSync('git add .', { cwd: testRepoPath });
      execSync('git commit -m "Initial commit"', { cwd: testRepoPath });

      console.log(`   ✅ Test repository created at: ${testRepoPath}`);
    } else {
      console.log('   ✅ Test repository already exists');
    }

    // 4. Seed test data
    console.log('\n4. Seeding test data...');

    // Create seed script to add test repository
    const seedScript = `
      import { PrismaClient } from '@prisma/client';
      const prisma = new PrismaClient();

      async function seed() {
        // Create test repository
        await prisma.repository.upsert({
          where: { path: '${testRepoPath}' },
          update: {},
          create: {
            name: 'sample-project',
            path: '${testRepoPath}',
            status: 'INITIALIZED',
            language: 'javascript',
            framework: 'nodejs',
          },
        });

        console.log('✅ Test repository seeded');
      }

      seed()
        .catch(console.error)
        .finally(() => prisma.$disconnect());
    `;

    const seedPath = path.join(__dirname, '../packages/api/prisma/test-seed.ts');
    fs.writeFileSync(seedPath, seedScript);

    try {
      execSync(`npx tsx ${seedPath}`, {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: dbUrl },
        cwd: path.join(__dirname, '../packages/api'),
      });
      console.log('   ✅ Test data seeded');
    } catch (e) {
      console.log('   ⚠️  Seeding might have failed, but continuing...');
    }

    // Clean up seed script
    fs.unlinkSync(seedPath);

    // 5. Create screenshots directory
    const screenshotsDir = path.join(__dirname, '../e2e-screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    console.log('\n5. Screenshots directory ready');

    console.log('\n✅ ✅ ✅ E2E test environment setup complete! ✅ ✅ ✅\n');
    console.log('You can now run: npm run test:e2e\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

setup();

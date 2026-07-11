/**
 * Database Seed Script
 * 
 * Populates the database with initial required data.
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';

import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Check if an organization already exists to prevent duplicate seeding
    const existingOrgs = await db.select().from(schema.organizations).limit(1);
    
    if (existingOrgs.length > 0) {
      console.log('⚠️ Database already seeded. Exiting.');
      process.exit(0);
    }

    // 2. Create Organization
    console.log('Creating organization...');
    const [org] = await db
      .insert(schema.organizations)
      .values({
        name: 'HireLoop HQ',
        slug: 'hireloop-hq',
        website: 'https://hireloop.ai',
      })
      .returning();

    // 3. Create Admin User
    // Note: In a real scenario, use bcrypt to hash the password first
    // This is just a dummy hash for the seed
    console.log('Creating admin user...');
    const [adminUser] = await db
      .insert(schema.users)
      .values({
        organizationId: org.id,
        email: 'admin@hireloop.ai',
        passwordHash: '$2b$10$dummyHashValuePleaseChangeMeInProduction', 
        firstName: 'System',
        lastName: 'Admin',
        role: 'admin',
      })
      .returning();

    // 4. Create Sample Role
    console.log('Creating sample role...');
    await db
      .insert(schema.roles)
      .values({
        organizationId: org.id,
        title: 'Senior AI Engineer',
        description: 'Looking for a senior AI engineer to lead our models team.',
        department: 'Engineering',
        location: 'Remote',
        employmentType: 'full_time',
        createdBy: adminUser.id,
        status: 'open',
      })
      .returning();

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

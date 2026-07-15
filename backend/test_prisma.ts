import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to Database: ", process.env.DATABASE_URL ? "URL is set" : "URL is MISSING");
  try {
    const users = await prisma.user.findMany();
    console.log("Successfully connected! Found users count:", users.length);
    console.log("Users:", users.map(u => ({ id: u.id, email: u.email, name: u.name })));
  } catch (error) {
    console.error("Database connection/query failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

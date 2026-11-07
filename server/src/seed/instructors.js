import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Instructor } from '../models/Instructor.js';

// Seed data for the Instructor Portal.
// Passwords are written here in plain text only as seed input.
// The Instructor model hashes them with bcrypt before they are stored,
// because we use create() (which runs the pre-save hook), not insertMany().
const instructors = [
  {
    name: 'Prof. Alice Smith',
    username: 'prof.smith',
    password: 'password123',
    department: 'CS',
    role: 'instructor',
    privateEmail: 'alice.smith@university.edu',
    privatePhone: '+1-555-0101'
  },
  {
    name: 'Prof. Brian Jones',
    username: 'prof.jones',
    password: 'mathRules!',
    department: 'Math',
    role: 'instructor',
    privateEmail: 'brian.jones@university.edu',
    privatePhone: '+1-555-0102'
  },
  {
    name: 'Prof. Chen Lee',
    username: 'prof.lee',
    password: 'linalg2024',
    department: 'Math',
    role: 'instructor',
    privateEmail: 'chen.lee@university.edu',
    privatePhone: '+1-555-0103'
  },
  {
    // The only superadmin, holding the API key.
    name: 'Portal Administrator',
    username: 'admin',
    password: 'S3cr3t-Admin-Pw!',
    department: 'IT',
    role: 'superadmin',
    apiKey: 'sk_live_9f3b2c7d8e4a1b6f0d5c2a9e',
    privateEmail: 'root@university.edu',
    privatePhone: '+1-555-0000'
  }
];

async function run() {
  await connectDB();
  await Instructor.deleteMany({});

  // create() runs the bcrypt pre-save hook; insertMany() would skip it
  const created = [];
  for (const data of instructors) {
    created.push(await Instructor.create(data));
  }

  console.log(`Seeded ${created.length} instructor(s):`);
  for (const i of created) {
    console.log(`  - ${i.username} (${i.role})`);
  }
  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
/**
 * Seed script to create sample mood data for testing
 * Run with: node scripts/seed.mjs
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'

// Load environment variables from .env file
const envContent = readFileSync('.env', 'utf-8')
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    process.env[key] = value.replace(/"/g, '')
  }
})

// Define schemas (simplified versions)
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
}, { timestamps: true })

const MoodSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mood: String,
  note: String,
  date: Date
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)
const Mood = mongoose.models.Mood || mongoose.model('Mood', MoodSchema)

const MOODS = ['happy', 'neutral', 'sad', 'stressed', 'excited', 'tired']

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URL)
    console.log('Connected to MongoDB')

    // Create test user
    const testUser = await User.findOneAndUpdate(
      { email: 'test@example.com' },
      {
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 12)
      },
      { upsert: true, new: true }
    )

    console.log('Created test user:', testUser.email)

    // Generate mood entries for the last 30 days
    const today = new Date()
    const moodEntries = []

    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      date.setUTCHours(0, 0, 0, 0)

      // Skip some days randomly to simulate real usage
      if (Math.random() > 0.8) continue

      const mood = MOODS[Math.floor(Math.random() * MOODS.length)]
      const notes = [
        'Had a great day at work!',
        'Feeling a bit overwhelmed with tasks',
        'Relaxing weekend vibes',
        'Productive morning session',
        'Could use some rest',
        'Excited about new opportunities',
        'Just one of those days',
        'Grateful for good friends'
      ]
      const note = Math.random() > 0.5 ? notes[Math.floor(Math.random() * notes.length)] : undefined

      moodEntries.push({
        userId: testUser._id,
        mood,
        note,
        date
      })
    }

    // Clear existing moods and insert new ones
    await Mood.deleteMany({ userId: testUser._id })
    await Mood.insertMany(moodEntries)

    console.log(`Created ${moodEntries.length} mood entries`)
    console.log('Seed data created successfully!')

    console.log('\nTest credentials:')
    console.log('Email: test@example.com')
    console.log('Password: password123')

  } catch (error) {
    console.error('Error seeding data:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

seedData()
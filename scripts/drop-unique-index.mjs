/**
 * Migration script to drop the unique index on userId_1_date_1
 * This allows multiple moods per day for the same user
 * Run with: node scripts/drop-unique-index.mjs
 */

import mongoose from 'mongoose'
import { readFileSync } from 'fs'

// Load environment variables from .env file
const envContent = readFileSync('.env', 'utf-8')
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    process.env[key] = value.replace(/"/g, '')
  }
})

async function dropUniqueIndex() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URL)
    console.log('Connected to MongoDB')

    const db = mongoose.connection.db
    const collection = db.collection('moods')

    // Get current indexes
    console.log('\nCurrent indexes:')
    const indexes = await collection.indexes()
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, index.key)
      if (index.unique) {
        console.log('   ^ UNIQUE index')
      }
    })

    // Check if the unique index exists
    const uniqueIndexExists = indexes.some(
      index => index.name === 'userId_1_date_1' && index.unique
    )

    if (uniqueIndexExists) {
      console.log('\n🔍 Found unique index userId_1_date_1, dropping it...')
      
      // Drop the unique index
      await collection.dropIndex('userId_1_date_1')
      console.log('✅ Successfully dropped unique index userId_1_date_1')
      
      // Recreate the index without unique constraint
      console.log('🔧 Creating new non-unique index...')
      await collection.createIndex({ userId: 1, date: 1 })
      console.log('✅ Successfully created new non-unique index userId_1_date_1')
      
    } else {
      console.log('\n✅ No unique index userId_1_date_1 found, nothing to drop')
    }

    // Show updated indexes
    console.log('\nUpdated indexes:')
    const updatedIndexes = await collection.indexes()
    updatedIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}:`, index.key)
      if (index.unique) {
        console.log('   ^ UNIQUE index')
      }
    })

    console.log('\n🎉 Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Error during migration:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
    process.exit(0)
  }
}

dropUniqueIndex()
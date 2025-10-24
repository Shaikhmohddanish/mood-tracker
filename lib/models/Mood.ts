import mongoose, { Document, Schema, Types, Model } from 'mongoose'
import { MoodType, MOOD_VALUES } from '@/lib/mood-constants'

// Re-export for compatibility
export type { MoodType }
export { MOOD_VALUES }

export interface MoodDoc extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  mood: MoodType
  note?: string
  date: Date // normalized to start-of-day UTC
  createdAt: Date
  updatedAt: Date
}

const MoodSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  mood: {
    type: String,
    required: [true, 'Mood is required'],
    enum: {
      values: MOOD_VALUES,
      message: 'Mood must be one of: {VALUES}'
    }
  },
  note: {
    type: String,
    maxlength: [300, 'Note cannot exceed 300 characters'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true
  }
}, {
  timestamps: true
})

// Compound indexes for efficient queries
MoodSchema.index({ userId: 1, date: 1 }) // Index for date-based queries (removed unique constraint)
MoodSchema.index({ userId: 1, createdAt: -1 }) // Recent moods first

/**
 * Ensure date is properly set (no additional normalization needed)
 * Date normalization is now handled in the API layer
 */
MoodSchema.pre('save', function(this: MoodDoc, next) {
  // Just ensure we have a valid date
  if (this.date && !(this.date instanceof Date)) {
    this.date = new Date(this.date)
  }
  next()
})

// Function to get the Mood model (ensures connection is established)
function getMoodModel() {
  if (mongoose.models.Mood) {
    return mongoose.models.Mood as Model<MoodDoc>
  }
  
  if (!mongoose.connection.readyState) {
    throw new Error('MongoDB connection not established. Please ensure database is connected.')
  }
  
  return mongoose.model<MoodDoc>('Mood', MoodSchema)
}

// Export the model getter function
export { getMoodModel }

// For compatibility, also export default (but use getMoodModel() in API routes)
let Mood: Model<MoodDoc> | null = null

try {
  Mood = mongoose.models.Mood || mongoose.model<MoodDoc>('Mood', MoodSchema)
} catch (error) {
  // Model will be created when connection is established
  console.warn('Mood model not ready, will be created when database connects')
}

export default Mood
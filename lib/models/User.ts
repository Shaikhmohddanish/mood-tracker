import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  username: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, underscores, and hyphens'
    ]
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  }
}, {
  timestamps: true
})

// Function to get the User model (ensures connection is established)
export function getUserModel() {
  if (mongoose.models.User) {
    return mongoose.models.User as mongoose.Model<IUser>
  }
  
  if (!mongoose.connection.readyState) {
    throw new Error('MongoDB connection not established. Please ensure database is connected.')
  }
  
  return mongoose.model<IUser>('User', UserSchema)
}

// For compatibility, also export default (but use getUserModel() in API routes)
let User: mongoose.Model<IUser> | null = null

try {
  User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
} catch (error) {
  // Model will be created when connection is established
  console.warn('User model not ready, will be created when database connects')
}

export default User
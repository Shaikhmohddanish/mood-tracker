// Type definitions for better MongoDB document handling

import { Document, Types } from 'mongoose'

// Extend the base Mongoose document interface
export interface BaseMongoDocument extends Document {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// User document interface
export interface UserDocument extends BaseMongoDocument {
  username: string
  email: string
  password: string
}

// Mood document interface  
export interface MoodDocument extends BaseMongoDocument {
  userId: Types.ObjectId
  mood: string
  note?: string
  date: Date
}

// Helper type for API responses
export type DocumentToObject<T> = T & {
  _id: string
  createdAt: string
  updatedAt: string
}
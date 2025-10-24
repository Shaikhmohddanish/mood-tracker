import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import connectDB from '@/lib/db'
import { getMoodModel } from '@/lib/models/Mood'
import { createMoodSchema, moodQuerySchema } from '@/lib/schemas'
import { normalizeToStartOfDay, parseDateString, getTodayString } from '@/lib/format'
import type { MoodDocument } from '@/lib/types'

// GET /api/moods - List moods with pagination and filters
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())
    
    // Validate and parse query parameters
    const { page, limit, from, to, mood } = moodQuerySchema.parse(queryParams)
    
    // Build filter
    const filter: any = { userId: user.userId }
    
    if (from || to) {
      filter.date = {}
      if (from) filter.date.$gte = parseDateString(from)
      if (to) filter.date.$lte = parseDateString(to)
    }
    
    if (mood) {
      filter.mood = mood
    }
    
    // Execute query with pagination
    const skip = (page - 1) * limit
    const Mood = getMoodModel()
    const [moods, total] = await Promise.all([
      Mood.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Mood.countDocuments(filter)
    ])
    
    return NextResponse.json({
      ok: true,
      data: {
        moods: moods.map((mood: any) => ({
          id: mood._id.toString(),
          mood: mood.mood,
          note: mood.note,
          date: mood.date.toISOString().split('T')[0],
          createdAt: mood.createdAt.toISOString(),
          updatedAt: mood.updatedAt.toISOString()
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    })
    
  } catch (error: any) {
    console.error('Error fetching moods:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message || 'Invalid parameters' } },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch moods' } },
      { status: 500 }
    )
  }
})

// POST /api/moods - Create a new mood entry
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    await connectDB()
    
    const body = await request.json()
    const validatedData = createMoodSchema.parse(body)
    
    // Use provided date or default to today
    const date = validatedData.date ? parseDateString(validatedData.date) : normalizeToStartOfDay(new Date())
    
    const Mood = getMoodModel()
    
    // Create new mood (allowing multiple moods per day)
    const mood = new Mood({
      userId: user.userId,
      mood: validatedData.mood,
      note: validatedData.note,
      date: date
    })
    
    await mood.save()
    
    const moodDoc = mood as unknown as MoodDocument
    
    return NextResponse.json({
      ok: true,
      data: {
        id: moodDoc._id.toString(),
        mood: mood.mood,
        note: mood.note,
        date: mood.date.toISOString().split('T')[0],
        createdAt: moodDoc.createdAt.toISOString(),
        updatedAt: moodDoc.updatedAt.toISOString()
      }
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Error creating mood:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0]?.message || 'Invalid data' } },
        { status: 400 }
      )
    }
    
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)[0] as any
      return NextResponse.json(
        { ok: false, error: { code: 'VALIDATION_ERROR', message: message.message } },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create mood' } },
      { status: 500 }
    )
  }
})
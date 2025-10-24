import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import connectDB from '@/lib/db'
import { getMoodModel } from '@/lib/models/Mood'
import { updateMoodSchema } from '@/lib/schemas'
import { parseDateString } from '@/lib/format'
import type { MoodDocument } from '@/lib/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/moods/[id] - Get a specific mood
export const GET = withAuth(async (request: NextRequest, user, { params }: RouteParams) => {
  try {
    await connectDB()
    const Mood = getMoodModel()
    const { id } = await params
    
    const mood = await Mood.findOne({
      _id: id,
      userId: user.userId
    })
    
    if (!mood) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Mood not found' } },
        { status: 404 }
      )
    }
    
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
    })
    
  } catch (error: any) {
    console.error('Error fetching mood:', error)
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch mood' } },
      { status: 500 }
    )
  }
})

// PUT /api/moods/[id] - Update a mood
export const PUT = withAuth(async (request: NextRequest, user, { params }: RouteParams) => {
  try {
    await connectDB()
    const { id } = await params
    
    const body = await request.json()
    const validatedData = updateMoodSchema.parse(body)
    
    const Mood = getMoodModel()
    
    // Find the mood to update
    const existingMood = await Mood.findOne({
      _id: id,
      userId: user.userId
    })
    
    if (!existingMood) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Mood not found' } },
        { status: 404 }
      )
    }
    
    // Prepare update data
    const updateData: any = {}
    
    if (validatedData.mood !== undefined) {
      updateData.mood = validatedData.mood
    }
    
    if (validatedData.note !== undefined) {
      updateData.note = validatedData.note
    }
    
    if (validatedData.date !== undefined) {
      const newDate = parseDateString(validatedData.date)
      updateData.date = newDate
    }
    
    // Update the mood
    const updatedMood = await Mood.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    
    if (!updatedMood) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Mood not found after update' } },
        { status: 404 }
      )
    }
    
    const updatedMoodDoc = updatedMood as unknown as MoodDocument
    
    return NextResponse.json({
      ok: true,
      data: {
        id: updatedMoodDoc._id.toString(),
        mood: updatedMood.mood,
        note: updatedMood.note,
        date: updatedMood.date.toISOString().split('T')[0],
        createdAt: updatedMoodDoc.createdAt.toISOString(),
        updatedAt: updatedMoodDoc.updatedAt.toISOString()
      }
    })
    
  } catch (error: any) {
    console.error('Error updating mood:', error)
    
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
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update mood' } },
      { status: 500 }
    )
  }
})

// DELETE /api/moods/[id] - Delete a mood
export const DELETE = withAuth(async (request: NextRequest, user, { params }: RouteParams) => {
  try {
    await connectDB()
    const { id } = await params
    const Mood = getMoodModel()
    
    const mood = await Mood.findOneAndDelete({
      _id: id,
      userId: user.userId
    })
    
    if (!mood) {
      return NextResponse.json(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Mood not found' } },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      ok: true,
      data: { message: 'Mood deleted successfully' }
    })
    
  } catch (error: any) {
    console.error('Error deleting mood:', error)
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete mood' } },
      { status: 500 }
    )
  }
})
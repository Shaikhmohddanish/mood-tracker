import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import connectDB from '@/lib/db'
import { getMoodModel } from '@/lib/models/Mood'
import { MoodType } from '@/lib/mood-constants'
import { formatDateString, getLastNDays } from '@/lib/format'

// GET /api/moods/stats - Get mood statistics
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    await connectDB()

    const userId = user.userId

    // Aggregation pipeline for stats
    const Mood = getMoodModel()
    
    const [
      byDateResult,
      distributionResult,
      recentMoodsResult
    ] = await Promise.all([
      // Group by date and get counts
      Mood.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$date' }
            },
            count: { $sum: 1 },
            moods: { $push: '$mood' }
          }
        },
        {
          $project: {
            date: '$_id',
            count: 1,
            topMood: {
              $first: {
                $reduce: {
                  input: '$moods',
                  initialValue: { mood: null, count: 0 },
                  in: {
                    $cond: [
                      { $gt: [{ $size: { $filter: { input: '$moods', cond: { $eq: ['$$this', '$$value.mood'] } } } }, '$$value.count'] },
                      { mood: '$$this', count: { $size: { $filter: { input: '$moods', cond: { $eq: ['$$this', '$$value.mood'] } } } } },
                      '$$value'
                    ]
                  }
                }
              }
            }
          }
        },
        { $sort: { date: -1 } }
      ]),
      
      // Mood distribution
      Mood.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$mood',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Recent moods for streak calculation
      Mood.find({ userId })
        .sort({ date: -1 })
        .select('date')
        .lean()
    ])

    // Process by date results
    const byDate = byDateResult.map((item: any) => ({
      date: item.date,
      count: item.count,
      topMood: item.topMood?.mood || null
    }))

    // Process mood distribution
    const distribution: Record<MoodType, number> = {
      happy: 0,
      neutral: 0,
      sad: 0,
      stressed: 0,
      excited: 0,
      tired: 0
    }
    
    distributionResult.forEach((item: any) => {
      distribution[item._id as MoodType] = item.count
    })

    // Calculate streaks
    const streak = calculateStreaks(recentMoodsResult.map((m: any) => formatDateString(m.date)))

    // Last 30 days data
    const last30Days = getLastNDays(30)
    const moodDates = new Set(byDate.map(b => b.date))
    const last30 = last30Days.map(date => ({
      date,
      hasEntry: moodDates.has(date) ? 1 : 0
    }))

    return NextResponse.json({
      ok: true,
      data: {
        byDate,
        distribution,
        streak,
        last30
      }
    })

  } catch (error: any) {
    console.error('Error fetching mood stats:', error)
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch statistics' } },
      { status: 500 }
    )
  }
})

/**
 * Calculate current and longest streaks from mood dates
 */
function calculateStreaks(moodDates: string[]): { currentStreak: number; longestStreak: number } {
  if (moodDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // Sort dates in descending order
  const sortedDates = moodDates.sort().reverse()
  const today = formatDateString(new Date())

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  // Calculate current streak (from today backwards)
  const todayIndex = sortedDates.indexOf(today)
  if (todayIndex !== -1) {
    currentStreak = 1
    
    // Check backwards from today
    for (let i = todayIndex + 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i - 1])
      const prevDate = new Date(sortedDates[i])
      
      // Check if dates are consecutive
      currentDate.setDate(currentDate.getDate() - 1)
      if (formatDateString(currentDate) === formatDateString(prevDate)) {
        currentStreak++
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  tempStreak = 1
  longestStreak = 1

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i - 1])
    const prevDate = new Date(sortedDates[i])
    
    // Check if dates are consecutive
    currentDate.setDate(currentDate.getDate() - 1)
    if (formatDateString(currentDate) === formatDateString(prevDate)) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  return { currentStreak, longestStreak }
}
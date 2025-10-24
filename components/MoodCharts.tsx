"use client"

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { ChartCard } from './ChartCard'
import { getMoodInfo } from '@/lib/format'
import type { MoodStatsResponse } from '@/lib/api'
import type { MoodType } from '@/lib/mood-constants'

interface MoodChartsProps {
  stats: MoodStatsResponse
}

export function MoodCharts({ stats }: MoodChartsProps) {
  // Prepare data for last 30 days chart
  const last30Data = stats.last30.map(day => ({
    date: day.date,
    hasEntry: day.hasEntry,
    dateLabel: new Date(day.date).getDate().toString()
  }))

  // Prepare mood distribution data
  const distributionData = Object.entries(stats.distribution)
    .filter(([, count]) => count > 0)
    .map(([mood, count]) => {
      const info = getMoodInfo(mood as MoodType)
      return {
        mood: info.label,
        count,
        color: info.color,
        emoji: info.emoji
      }
    })

  // Prepare weekly activity data (group last 30 days by weeks)
  const weeklyData = []
  for (let i = 0; i < stats.last30.length; i += 7) {
    const week = stats.last30.slice(i, i + 7)
    const weekNumber = Math.floor(i / 7) + 1
    const activeDays = week.filter(day => day.hasEntry === 1).length
    
    weeklyData.push({
      week: `Week ${weekNumber}`,
      activeDays,
      totalDays: week.length
    })
  }

  return (
    <div className="space-y-6">
      {/* Last 30 Days Activity */}
      <ChartCard
        title="Last 30 Days Activity"
        description="Your daily mood tracking consistency"
      >
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={last30Data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="dateLabel"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[0, 1]}
              ticks={[0, 1]}
              tickFormatter={(value) => value === 1 ? 'Logged' : 'Missed'}
            />
            <Tooltip 
              formatter={(value: number) => [value === 1 ? 'Mood logged' : 'No entry', 'Status']}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Area
              type="monotone"
              dataKey="hasEntry"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Activity */}
        <ChartCard
          title="Weekly Activity"
          description="Active days per week"
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value} days`, 
                  name === 'activeDays' ? 'Active' : 'Total'
                ]}
              />
              <Bar dataKey="activeDays" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Mood Distribution */}
        <ChartCard
          title="Mood Distribution"
          description="Your emotional patterns"
        >
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                outerRadius={60}
                fill="#8884d8"
                dataKey="count"
                label={({ mood, count }) => `${mood} (${count})`}
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} entries`, 'Count']}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Mood Trends by Date */}
      {stats.byDate.length > 0 && (
        <ChartCard
          title="Mood Entry Frequency"
          description="Number of entries per day over time"
        >
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.byDate.slice(0, 30).reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
                tickFormatter={(value) => new Date(value).getMonth() + 1 + '/' + new Date(value).getDate()}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value} entries`, 'Count']}
                labelFormatter={(value) => new Date(value).toDateString()}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  )
}
/* eslint-disable @typescript-eslint/no-explicit-any */
const STORAGE_KEY = "vizzy:metrics"

interface MetricsStore {
  ga: any[]
  esp: any[]
  product: any[]
}

export function getMetrics(): MetricsStore {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return { ga: [], esp: [], product: [] }
  }
  
  try {
    return JSON.parse(stored)
  } catch (e) {
    console.error("Failed to parse stored metrics:", e)
    return { ga: [], esp: [], product: [] }
  }
}

export function setMetrics(metrics: MetricsStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics))
}

export function appendMetrics(type: keyof MetricsStore, rows: any[]): void {
  const current = getMetrics()
  current[type] = [...current[type], ...rows]
  setMetrics(current)
}

export function clearMetrics(type?: keyof MetricsStore): void {
  if (type) {
    const current = getMetrics()
    current[type] = []
    setMetrics(current)
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function seriesForReachByWeek(): { week: string; value: number }[] {
  const metrics = getMetrics()
  const gaData = metrics.ga
  
  if (!gaData || gaData.length === 0) {
    return []
  }
  
  // Group GA data by ISO week
  const weeklyData = new Map<string, number>()
  
  gaData.forEach((row: any) => {
    // Try different common GA date field names
    const date = row.date || row.Date || row.day || row.Day || row.week || row.Week
    const sessions = parseFloat(row.sessions || row.Sessions || row.users || row.Users || row.pageviews || row.Pageviews || '0')
    
    if (date && !isNaN(sessions)) {
      try {
        const dateObj = new Date(date)
        if (!isNaN(dateObj.getTime())) {
          // Get ISO week string (YYYY-WW format)
          const year = dateObj.getFullYear()
          const week = getISOWeek(dateObj)
          const weekKey = `${year}-W${week.toString().padStart(2, '0')}`
          
          weeklyData.set(weekKey, (weeklyData.get(weekKey) || 0) + sessions)
        }
      } catch (_e) {
        // Skip invalid dates
      }
    }
  })
  
  // Convert to array and sort by week
  return Array.from(weeklyData.entries())
    .map(([week, value]) => ({ week, value }))
    .sort((a, b) => a.week.localeCompare(b.week))
}

// Helper function to get ISO week number
function getISOWeek(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}
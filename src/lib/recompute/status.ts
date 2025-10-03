/**
 * Recompute Status Management
 * 
 * Tracks weekly recompute operations and provides blocking/queuing
 * capabilities during active recompute to prevent race conditions.
 */

import React from 'react'

interface RecomputeStatus {
  isRunning: boolean
  startedAt?: string
  progress?: number
  message?: string
}

const RECOMPUTE_STATUS_KEY = 'vizzy:recompute-status'

/**
 * Get current recompute status
 */
export function getRecomputeStatus(): RecomputeStatus {
  try {
    const data = localStorage.getItem(RECOMPUTE_STATUS_KEY)
    return data ? JSON.parse(data) : { isRunning: false }
  } catch (error) {
    console.warn('Failed to get recompute status:', error)
    return { isRunning: false }
  }
}

/**
 * Set recompute status
 */
export function setRecomputeStatus(status: RecomputeStatus): void {
  try {
    localStorage.setItem(RECOMPUTE_STATUS_KEY, JSON.stringify(status))
    // Dispatch event for reactive components
    window.dispatchEvent(new CustomEvent('recompute-status-changed', { detail: status }))
  } catch (error) {
    console.error('Failed to set recompute status:', error)
  }
}

/**
 * Start a recompute operation
 */
export function startRecompute(message: string = 'Weekly recompute in progress'): void {
  setRecomputeStatus({
    isRunning: true,
    startedAt: new Date().toISOString(),
    progress: 0,
    message
  })
}

/**
 * Update recompute progress
 */
export function updateRecomputeProgress(progress: number, message?: string): void {
  const current = getRecomputeStatus()
  setRecomputeStatus({
    ...current,
    progress: Math.max(0, Math.min(100, progress)),
    message: message || current.message
  })
}

/**
 * Complete recompute operation
 */
export function completeRecompute(): void {
  setRecomputeStatus({
    isRunning: false,
    progress: 100,
    message: 'Recompute completed'
  })
  
  // Clear status after a short delay
  setTimeout(() => {
    setRecomputeStatus({ isRunning: false })
  }, 3000)
}

/**
 * React hook for recompute status
 */
export function useRecomputeStatus() {
  const [status, setStatus] = React.useState<RecomputeStatus>(getRecomputeStatus)
  
  React.useEffect(() => {
    const handleStatusChange = (event: CustomEvent<RecomputeStatus>) => {
      setStatus(event.detail)
    }
    
    window.addEventListener('recompute-status-changed', handleStatusChange as EventListener)
    return () => {
      window.removeEventListener('recompute-status-changed', handleStatusChange as EventListener)
    }
  }, [])
  
  return status
}

// Simulate recompute for demo purposes
export function simulateWeeklyRecompute(): void {
  startRecompute('Weekly analytics recompute starting...')
  
  let progress = 0
  const interval = setInterval(() => {
    progress += Math.random() * 15
    
    if (progress >= 100) {
      completeRecompute()
      clearInterval(interval)
    } else {
      const messages = [
        'Processing campaign data...',
        'Analyzing performance metrics...',
        'Updating recommendations...',
        'Finalizing reports...'
      ]
      const message = messages[Math.floor(progress / 25)] || messages[0]
      updateRecomputeProgress(progress, message)
    }
  }, 1000)
}
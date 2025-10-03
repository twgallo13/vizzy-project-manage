/**
 * localStorage-based Key-Value React Hook
 * 
 * Replacement for @github/spark useKV hook.
 * Provides persistent state management with localStorage backing.
 */

import { useState, useEffect, useCallback } from 'react'

/**
 * Hook for persistent key-value storage using localStorage
 * 
 * @param key - localStorage key
 * @param defaultValue - default value if key doesn't exist
 * @returns [value, setValue] tuple similar to useState
 */
export function useKV<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state with value from localStorage or default
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Failed to parse localStorage key "${key}":`, error)
      return defaultValue
    }
  })

  // Update localStorage when state changes
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // Handle functional updates
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Update state
      setStoredValue(valueToStore)
      
      // Update localStorage
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Failed to save to localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue)
          setStoredValue(newValue)
        } catch (error) {
          console.warn(`Failed to parse storage change for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}

/**
 * Get value from localStorage without React state
 */
export function getKV<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.warn(`Failed to get localStorage key "${key}":`, error)
    return defaultValue
  }
}

/**
 * Set value to localStorage without React state
 */
export function setKV<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Failed to set localStorage key "${key}":`, error)
  }
}

/**
 * Remove key from localStorage
 */
export function removeKV(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Failed to remove localStorage key "${key}":`, error)
  }
}
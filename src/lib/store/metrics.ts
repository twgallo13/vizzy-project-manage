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
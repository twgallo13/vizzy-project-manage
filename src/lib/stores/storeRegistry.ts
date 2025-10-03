export interface Store {
  id: string
  name: string
  city: string
  state: string
  region: string
  notes?: string
}

const STORAGE_KEY = "vizzy:stores"

export function listStores(): Store[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  
  try {
    return JSON.parse(stored)
  } catch (e) {
    console.error("Failed to parse stored stores:", e)
    return []
  }
}

export function saveStores(stores: Store[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stores))
}

export function importStoresFromCSV(file: File): Promise<Store[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const stores = parseCSV(text)
        saveStores(stores)
        resolve(stores)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

export function importStoresFromJSON(obj: any): Store[] {
  if (!Array.isArray(obj)) {
    throw new Error("JSON must be an array of stores")
  }
  
  const stores = obj.map((item, index) => {
    if (!item.id || !item.name || !item.city || !item.state || !item.region) {
      throw new Error(`Invalid store at index ${index}: missing required fields`)
    }
    return {
      id: String(item.id),
      name: String(item.name),
      city: String(item.city),
      state: String(item.state),
      region: String(item.region),
      notes: item.notes ? String(item.notes) : undefined
    }
  })
  
  saveStores(stores)
  return stores
}

export function clearStores(): void {
  localStorage.removeItem(STORAGE_KEY)
}

function parseCSV(text: string): Store[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) {
    throw new Error("CSV must have at least a header and one data row")
  }
  
  const header = lines[0].split(',').map(h => h.trim().toLowerCase())
  const requiredColumns = ['id', 'name', 'city', 'state', 'region']
  
  for (const col of requiredColumns) {
    if (!header.includes(col)) {
      throw new Error(`Missing required column: ${col}`)
    }
  }
  
  const stores: Store[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    if (values.length !== header.length) {
      console.warn(`Skipping row ${i + 1}: column count mismatch`)
      continue
    }
    
    const store: Store = {
      id: values[header.indexOf('id')],
      name: values[header.indexOf('name')],
      city: values[header.indexOf('city')],
      state: values[header.indexOf('state')],
      region: values[header.indexOf('region')]
    }
    
    const notesIndex = header.indexOf('notes')
    if (notesIndex !== -1 && values[notesIndex]) {
      store.notes = values[notesIndex]
    }
    
    stores.push(store)
  }
  
  return stores
}

export function getRegions(): string[] {
  const stores = listStores()
  return [...new Set(stores.map(store => store.region))].sort()
}

export function getStoresByRegion(region: string): Store[] {
  return listStores().filter(store => store.region === region)
}
/**
 * LocalStorage-based persistence for Wrike export mappings
 * 
 * Since this is a frontend-only app, we use localStorage to persist
 * export mappings with idempotency keys.
 */

import { WrikeExportRecord } from './idempotency'

const WRIKE_EXPORTS_KEY = 'vizzy:wrike-exports'

/**
 * Get all export records from localStorage
 */
export function getExportRecords(): WrikeExportRecord[] {
  try {
    const data = localStorage.getItem(WRIKE_EXPORTS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.warn('Failed to parse export records:', error)
    return []
  }
}

/**
 * Save export records to localStorage
 */
export function saveExportRecords(records: WrikeExportRecord[]): void {
  try {
    localStorage.setItem(WRIKE_EXPORTS_KEY, JSON.stringify(records))
  } catch (error) {
    console.error('Failed to save export records:', error)
    throw new Error('Failed to persist export record')
  }
}

/**
 * Find existing export by idempotency key
 */
export function findExportByKey(idempotencyKey: string): WrikeExportRecord | null {
  const records = getExportRecords()
  return records.find(record => record.idempotencyKey === idempotencyKey) || null
}

/**
 * Create new export record with unique key constraint simulation
 */
export function createExportRecord(
  tenantId: string,
  campaignId: string,
  snapshotVersion: string,
  idempotencyKey: string,
  wrikeProjectId: string
): WrikeExportRecord {
  const records = getExportRecords()
  
  // Simulate unique key constraint - check for existing key
  const existing = records.find(record => record.idempotencyKey === idempotencyKey)
  if (existing) {
    throw new Error(`Export with idempotency key ${idempotencyKey} already exists`)
  }
  
  const newRecord: WrikeExportRecord = {
    id: `export_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    tenantId,
    campaignId,
    snapshotVersion,
    idempotencyKey,
    wrikeProjectId,
    createdAt: new Date().toISOString()
  }
  
  records.push(newRecord)
  saveExportRecords(records)
  
  return newRecord
}

/**
 * Get export records for a specific campaign
 */
export function getExportRecordsForCampaign(campaignId: string): WrikeExportRecord[] {
  const records = getExportRecords()
  return records.filter(record => record.campaignId === campaignId)
}

/**
 * Clean up old export records (optional housekeeping)
 */
export function cleanupOldExports(daysOld: number = 30): number {
  const records = getExportRecords()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)
  
  const filtered = records.filter(record => new Date(record.createdAt) > cutoffDate)
  const removedCount = records.length - filtered.length
  
  if (removedCount > 0) {
    saveExportRecords(filtered)
  }
  
  return removedCount
}
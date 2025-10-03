/**
 * Basic tests for Wrike export idempotency
 * 
 * Run these tests to verify the idempotency system works correctly
 */

import { createWrikeProject } from '../lib/export/wrike'
import { getExportRecords, saveExportRecords } from '../lib/export/persistence'

// Mock campaign for testing
const mockCampaign = {
  id: 'test-campaign-123',
  name: 'Test Campaign',
  status: 'Draft',
  startDate: '2025-10-03',
  endDate: '2025-10-10',
  owners: {
    creative: 'Abby',
    social: 'Vanezza',
    stores: 'Antonio',
    approvals: 'Theo'
  },
  createdAt: '2025-10-03T12:00:00Z'
}

/**
 * Test: First export creates project, second export reuses it
 */
export async function testIdempotentExport() {
  console.log('🧪 Testing idempotent export...')
  
  // Clear any existing exports for this test
  const allExports = getExportRecords()
  const filtered = allExports.filter(record => record.campaignId !== mockCampaign.id)
  saveExportRecords(filtered)
  
  try {
    // First export - should create new project
    console.log('📝 First export attempt...')
    const result1 = await createWrikeProject(mockCampaign)
    console.log('✅ First result:', result1)
    
    if (result1.idempotent) {
      throw new Error('First export should not be idempotent')
    }
    
    // Second export - should reuse existing project
    console.log('📝 Second export attempt...')
    const result2 = await createWrikeProject(mockCampaign)
    console.log('✅ Second result:', result2)
    
    if (!result2.idempotent) {
      throw new Error('Second export should be idempotent')
    }
    
    if (result1.wrikeProjectId !== result2.wrikeProjectId) {
      throw new Error('Both exports should return same project ID')
    }
    
    console.log('🎉 Idempotency test PASSED!')
    return true
    
  } catch (error) {
    console.error('❌ Idempotency test FAILED:', error)
    return false
  }
}

/**
 * Test: Different campaigns get different project IDs
 */
export async function testDifferentCampaigns() {
  console.log('🧪 Testing different campaigns...')
  
  const campaign1 = { ...mockCampaign, id: 'campaign-1', name: 'Campaign 1' }
  const campaign2 = { ...mockCampaign, id: 'campaign-2', name: 'Campaign 2' }
  
  try {
    const result1 = await createWrikeProject(campaign1)
    const result2 = await createWrikeProject(campaign2)
    
    if (result1.wrikeProjectId === result2.wrikeProjectId) {
      throw new Error('Different campaigns should get different project IDs')
    }
    
    console.log('🎉 Different campaigns test PASSED!')
    return true
    
  } catch (error) {
    console.error('❌ Different campaigns test FAILED:', error)
    return false
  }
}

/**
 * Test: Campaign changes create new project ID
 */
export async function testCampaignChanges() {
  console.log('🧪 Testing campaign changes...')
  
  const originalCampaign = { ...mockCampaign, id: 'change-test' }
  const modifiedCampaign = { 
    ...originalCampaign, 
    name: 'Modified Campaign Name',
    updatedAt: '2025-10-03T13:00:00Z'
  }
  
  try {
    const result1 = await createWrikeProject(originalCampaign)
    const result2 = await createWrikeProject(modifiedCampaign)
    
    if (result1.wrikeProjectId === result2.wrikeProjectId) {
      throw new Error('Modified campaigns should get new project IDs')
    }
    
    console.log('🎉 Campaign changes test PASSED!')
    return true
    
  } catch (error) {
    console.error('❌ Campaign changes test FAILED:', error)
    return false
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🚀 Running Wrike export idempotency tests...')
  
  const results = await Promise.all([
    testIdempotentExport(),
    testDifferentCampaigns(),
    testCampaignChanges()
  ])
  
  const passed = results.filter(r => r).length
  const total = results.length
  
  console.log(`\n📊 Test Results: ${passed}/${total} passed`)
  
  if (passed === total) {
    console.log('🎉 All tests PASSED! Idempotency system is working correctly.')
  } else {
    console.log('❌ Some tests FAILED. Check the logs above.')
  }
  
  return passed === total
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testWrikeIdempotency = {
    runAllTests,
    testIdempotentExport,
    testDifferentCampaigns,
    testCampaignChanges
  }
}
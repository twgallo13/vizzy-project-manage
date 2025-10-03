import React, { useState, useEffect } from "react"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Checkbox } from "../ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { getRegions, getStoresByRegion, Store } from "../../lib/stores/storeRegistry"
import { TCampaignTargeting } from "../../lib/validation/campaignSchema"

interface StoreTargetingProps {
  targeting?: TCampaignTargeting
  onTargetingChange: (targeting: TCampaignTargeting) => void
  onEventTypeChange?: (eventType: string, notes: string) => void
}

export function StoreTargeting({ targeting, onTargetingChange, onEventTypeChange }: StoreTargetingProps) {
  const [regions] = useState(getRegions())
  const [availableStores, setAvailableStores] = useState<Store[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>(targeting?.regions || [])
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>(targeting?.storeIds || [])
  const [eventType, setEventType] = useState<string>(targeting?.eventType || "customer")

  useEffect(() => {
    // Update available stores when regions change
    if (selectedRegions.length > 0) {
      const stores = selectedRegions.flatMap(region => getStoresByRegion(region))
      setAvailableStores(stores)
      
      // Remove selected stores that are no longer available
      const availableStoreIds = stores.map(store => store.id)
      const validSelectedStoreIds = selectedStoreIds.filter(id => availableStoreIds.includes(id))
      if (validSelectedStoreIds.length !== selectedStoreIds.length) {
        setSelectedStoreIds(validSelectedStoreIds)
      }
    } else {
      setAvailableStores([])
      setSelectedStoreIds([])
    }
  }, [selectedRegions])

  useEffect(() => {
    // Update parent component when targeting changes
    const newTargeting: TCampaignTargeting = {
      regions: selectedRegions.length > 0 ? selectedRegions : undefined,
      storeIds: selectedStoreIds.length > 0 ? selectedStoreIds : undefined,
      eventType: eventType !== "customer" ? eventType as "community" | "partner" : undefined
    }
    onTargetingChange(newTargeting)
  }, [selectedRegions, selectedStoreIds, eventType, onTargetingChange])

  const handleRegionToggle = (region: string) => {
    const newRegions = selectedRegions.includes(region)
      ? selectedRegions.filter(r => r !== region)
      : [...selectedRegions, region]
    setSelectedRegions(newRegions)
  }

  const handleStoreToggle = (storeId: string) => {
    const newStoreIds = selectedStoreIds.includes(storeId)
      ? selectedStoreIds.filter(id => id !== storeId)
      : [...selectedStoreIds, storeId]
    setSelectedStoreIds(newStoreIds)
  }

  const handleEventTypeChange = (newEventType: string) => {
    setEventType(newEventType)
    
    // Apply default owners and notes based on event type
    let notes = ""
    if (newEventType === "community") {
      notes = "Community event - involves Rosa/Janet for local coordination"
      onEventTypeChange?.("community", notes)
    } else if (newEventType === "partner") {
      notes = "Sangre Mia partner lane - requires David oversight"
      onEventTypeChange?.("partner", notes)
    } else {
      onEventTypeChange?.("customer", "")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Stores & Events</CardTitle>
        <CardDescription>
          Configure store targeting and event type for this campaign
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Event Type</Label>
          <Select value={eventType} onValueChange={handleEventTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer Event</SelectItem>
              <SelectItem value="community">Community Event</SelectItem>
              <SelectItem value="partner">Partner Event</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {regions.length > 0 && (
          <div>
            <Label className="text-sm font-medium">Regions ({selectedRegions.length} selected)</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {regions.map(region => (
                <div key={region} className="flex items-center space-x-2">
                  <Checkbox
                    id={`region-${region}`}
                    checked={selectedRegions.includes(region)}
                    onCheckedChange={() => handleRegionToggle(region)}
                  />
                  <Label htmlFor={`region-${region}`} className="text-sm">{region}</Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {availableStores.length > 0 && (
          <div>
            <Label className="text-sm font-medium">
              Stores ({selectedStoreIds.length}/{availableStores.length} selected)
            </Label>
            <div className="max-h-48 overflow-y-auto mt-2 space-y-1">
              {availableStores.map(store => (
                <div key={store.id} className="flex items-center space-x-2 p-2 rounded border">
                  <Checkbox
                    id={`store-${store.id}`}
                    checked={selectedStoreIds.includes(store.id)}
                    onCheckedChange={() => handleStoreToggle(store.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={`store-${store.id}`} className="text-sm font-medium">
                      {store.name}
                    </Label>
                    <div className="text-xs text-muted-foreground">
                      {store.city}, {store.state} • <Badge variant="outline" className="text-xs">{store.region}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {regions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <p>No stores available.</p>
            <p>Import stores via Admin → Stores to enable targeting.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
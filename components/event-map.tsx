"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface EventMapProps {
  events: Array<{
    id: string
    title: string
    latitude?: number
    longitude?: number
    venue_name?: string
    city?: string
    start_date: string
  }>
  selectedEventId?: string
  onEventSelect?: (eventId: string) => void
}

export function EventMap({ events, selectedEventId, onEventSelect }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // In a real implementation, you would initialize a map here
    // For now, we'll create a simple visual representation
    if (!mapRef.current) return

    // Clear previous content
    mapRef.current.innerHTML = ""

    // Create a simple grid-based map visualization
    const mapContainer = document.createElement("div")
    mapContainer.className = "relative w-full h-full bg-muted/20 rounded-lg overflow-hidden"

    // Add some visual elements to simulate a map
    const mapBackground = document.createElement("div")
    mapBackground.className = "absolute inset-0 opacity-10"
    mapBackground.style.backgroundImage = `
      linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px),
      linear-gradient(hsl(var(--border)) 1px, transparent 1px)
    `
    mapBackground.style.backgroundSize = "20px 20px"
    mapContainer.appendChild(mapBackground)

    // Add event markers
    events.forEach((event, index) => {
      if (!event.latitude || !event.longitude) return

      const marker = document.createElement("div")
      marker.className = `absolute w-6 h-6 bg-primary rounded-full border-2 border-background shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform ${
        selectedEventId === event.id ? "ring-2 ring-primary ring-offset-2" : ""
      }`

      // Position markers based on a simple grid (in real app, use actual coordinates)
      const x = 20 + (index % 5) * 60 + Math.random() * 40
      const y = 20 + Math.floor(index / 5) * 60 + Math.random() * 40
      marker.style.left = `${Math.min(x, 90)}%`
      marker.style.top = `${Math.min(y, 80)}%`

      marker.title = `${event.title} - ${event.venue_name || event.city}`

      if (onEventSelect) {
        marker.addEventListener("click", () => onEventSelect(event.id))
      }

      mapContainer.appendChild(marker)
    })

    mapRef.current.appendChild(mapContainer)
  }, [events, selectedEventId, onEventSelect])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Carte des événements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={mapRef} className="w-full h-64 md:h-80" />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Cliquez sur les marqueurs pour voir les détails des événements
        </p>
      </CardContent>
    </Card>
  )
}

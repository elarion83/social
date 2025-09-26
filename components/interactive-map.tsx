"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Users, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Event {
  id: string
  title: string
  latitude?: number
  longitude?: number
  venue_name?: string
  city?: string
  start_date: string
  category: string
  price: number
  currency: string
  current_attendees?: number
  short_description?: string
  description?: string
}

interface InteractiveMapProps {
  events: Event[]
  height?: string
  showEventList?: boolean
}

export function InteractiveMap({ events, height = "h-96", showEventList = false }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Clear any existing map
      if (mapInstance) {
        mapInstance.remove()
      }

      // Create map centered on France
      const map = L.map(mapRef.current!).setView([46.603354, 1.888334], 6)

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      // Custom marker icon
      const customIcon = L.divIcon({
        html: `<div class="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                 <div class="w-2 h-2 bg-white rounded-full"></div>
               </div>`,
        className: "custom-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      // Add markers for events with coordinates
      events.forEach((event) => {
        if (event.latitude && event.longitude) {
          const marker = L.marker([event.latitude, event.longitude], { icon: customIcon }).addTo(map)

          // Create popup content
          const popupContent = `
            <div class="p-2 min-w-[200px]">
              <h3 class="font-semibold text-sm mb-2 line-clamp-2">${event.title}</h3>
              <div class="space-y-1 text-xs text-gray-600">
                <div class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  ${new Date(event.start_date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
                ${
                  event.venue_name
                    ? `
                  <div class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    ${event.venue_name}, ${event.city}
                  </div>
                `
                    : ""
                }
                <div class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  ${event.current_attendees || 0} participant${(event.current_attendees || 0) > 1 ? "s" : ""}
                </div>
              </div>
              <div class="mt-3">
                <a href="/events/${event.id}" class="inline-flex items-center gap-1 text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/90 transition-colors">
                  Voir détails
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          `

          marker.bindPopup(popupContent, {
            maxWidth: 250,
            className: "custom-popup",
          })

          // Handle marker click for event list
          marker.on("click", () => {
            setSelectedEvent(event)
          })
        }
      })

      // Fit map to show all markers if events exist
      if (events.length > 0) {
        const validEvents = events.filter((e) => e.latitude && e.longitude)
        if (validEvents.length > 0) {
          const group = new L.featureGroup(validEvents.map((event) => L.marker([event.latitude!, event.longitude!])))
          map.fitBounds(group.getBounds().pad(0.1))
        }
      }

      setMapInstance(map)
    })

    return () => {
      if (mapInstance) {
        mapInstance.remove()
      }
    }
  }, [events])

  return (
    <div className={showEventList ? "grid lg:grid-cols-3 gap-6" : ""}>
      <div className={showEventList ? "lg:col-span-2" : ""}>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Découvrez Vos Prochaines Expériences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div ref={mapRef} className={`w-full ${height}`} />
            <div className="p-4">
              <p className="text-xs text-muted-foreground text-center">
                Cliquez sur les points pour révéler votre prochaine aventure
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showEventList && (
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expériences Disponibles ({events.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedEvent?.id === event.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm line-clamp-2">{event.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(event.start_date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                    {event.venue_name && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.city}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {event.current_attendees || 0}
                      </div>
                      <Button asChild size="sm" variant="outline" className="h-6 text-xs bg-transparent">
                        <Link href={`/events/${event.id}`}>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Votre prochaine aventure arrive bientôt</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Search, Navigation } from "lucide-react"

interface LocationPickerProps {
  onLocationSelect: (location: {
    venue_name: string
    address: string
    city: string
    country: string
    latitude?: number
    longitude?: number
  }) => void
  initialLocation?: {
    venue_name?: string
    address?: string
    city?: string
    country?: string
    latitude?: number
    longitude?: number
  }
}

export function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || {})

  // Simulate location search (in a real app, you'd use Google Places API or similar)
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock suggestions based on query
    const mockSuggestions = [
      {
        venue_name: `${query} - Salle de Concert`,
        address: `123 Rue de ${query}`,
        city: "Paris",
        country: "France",
        latitude: 48.8566 + Math.random() * 0.1,
        longitude: 2.3522 + Math.random() * 0.1,
      },
      {
        venue_name: `Centre ${query}`,
        address: `456 Avenue ${query}`,
        city: "Lyon",
        country: "France",
        latitude: 45.764 + Math.random() * 0.1,
        longitude: 4.8357 + Math.random() * 0.1,
      },
      {
        venue_name: `Espace ${query}`,
        address: `789 Boulevard ${query}`,
        city: "Marseille",
        country: "France",
        latitude: 43.2965 + Math.random() * 0.1,
        longitude: 5.3698 + Math.random() * 0.1,
      },
    ]

    setSuggestions(mockSuggestions)
    setIsLoading(false)
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords

        // In a real app, you'd reverse geocode these coordinates
        const mockLocation = {
          venue_name: "Ma position actuelle",
          address: "Position GPS",
          city: "Ville détectée",
          country: "France",
          latitude,
          longitude,
        }

        setSelectedLocation(mockLocation)
        onLocationSelect(mockLocation)
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error)
        alert("Impossible d'obtenir votre position")
      },
    )
  }

  const handleSuggestionSelect = (suggestion: any) => {
    setSelectedLocation(suggestion)
    onLocationSelect(suggestion)
    setSuggestions([])
    setSearchQuery("")
  }

  const handleManualInput = (field: string, value: string) => {
    const updatedLocation = { ...selectedLocation, [field]: value }
    setSelectedLocation(updatedLocation)
    onLocationSelect(updatedLocation)
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchLocations(searchQuery)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="space-y-2">
        <Label>Rechercher un lieu</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une adresse, un lieu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="button" variant="outline" onClick={getCurrentLocation} className="bg-transparent">
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardContent className="p-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionSelect(suggestion)}
                className="w-full text-left p-3 hover:bg-muted rounded-md transition-colors"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">{suggestion.venue_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.address}, {suggestion.city}, {suggestion.country}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Recherche en cours...</p>
        </div>
      )}

      {/* Manual Input */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="venue_name">Nom du lieu</Label>
          <Input
            id="venue_name"
            placeholder="Ex: Salle Pleyel"
            value={selectedLocation.venue_name || ""}
            onChange={(e) => handleManualInput("venue_name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            placeholder="Ex: 252 Rue du Faubourg Saint-Honoré"
            value={selectedLocation.address || ""}
            onChange={(e) => handleManualInput("address", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            placeholder="Ex: Paris"
            value={selectedLocation.city || ""}
            onChange={(e) => handleManualInput("city", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Pays</Label>
          <Input
            id="country"
            placeholder="Ex: France"
            value={selectedLocation.country || ""}
            onChange={(e) => handleManualInput("country", e.target.value)}
          />
        </div>
      </div>

      {/* Selected Location Preview */}
      {(selectedLocation.venue_name || selectedLocation.address) && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary mt-1" />
              <div>
                <p className="font-medium">{selectedLocation.venue_name}</p>
                <p className="text-sm text-muted-foreground">
                  {[selectedLocation.address, selectedLocation.city, selectedLocation.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {selectedLocation.latitude && selectedLocation.longitude && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Coordonnées: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

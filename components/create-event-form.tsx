"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Users, Euro, ImageIcon } from "lucide-react"
import { LocationPicker } from "@/components/location-picker"

const categories = [
  { value: "concert", label: "Concert" },
  { value: "conference", label: "Conférence" },
  { value: "workshop", label: "Atelier" },
  { value: "party", label: "Soirée" },
  { value: "sports", label: "Sport" },
  { value: "networking", label: "Networking" },
  { value: "other", label: "Autre" },
]

const eventTypes = [
  { value: "public", label: "Public" },
  { value: "private", label: "Privé" },
  { value: "invite_only", label: "Sur invitation" },
]

export function CreateEventForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    short_description: "",
    category: "",
    type: "",
    start_date: "",
    end_date: "",
    max_attendees: "",
    price: "",
    currency: "EUR",
    image_url: "",
    external_url: "",
    tags: "",
  })

  const [locationData, setLocationData] = useState({
    venue_name: "",
    address: "",
    city: "",
    country: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Vous devez être connecté pour créer un événement")
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        short_description: formData.short_description,
        category: formData.category,
        type: formData.type,
        venue_name: locationData.venue_name || null,
        address: locationData.address || null,
        city: locationData.city || null,
        country: locationData.country || null,
        latitude: locationData.latitude || null,
        longitude: locationData.longitude || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        max_attendees: formData.max_attendees ? Number.parseInt(formData.max_attendees) : null,
        price: formData.price ? Number.parseFloat(formData.price) : 0,
        currency: formData.currency,
        image_url: formData.image_url || null,
        external_url: formData.external_url || null,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
        organizer_id: user.id,
        status: "published",
      }

      const { data, error } = await supabase.from("events").insert([eventData]).select().single()

      if (error) throw error

      router.push(`/events/${data.id}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informations de base
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titre de l'événement *</Label>
            <Input
              id="title"
              placeholder="Ex: Concert Jazz au Sunset"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Description courte</Label>
            <Input
              id="short_description"
              placeholder="Une phrase accrocheuse pour présenter votre événement"
              value={formData.short_description}
              onChange={(e) => handleInputChange("short_description", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description complète</Label>
            <Textarea
              id="description"
              placeholder="Décrivez votre événement en détail..."
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type d'événement *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL de l'image</Label>
            <div className="flex gap-2">
              <ImageIcon className="h-5 w-5 text-muted-foreground mt-2" />
              <Input
                id="image_url"
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={(e) => handleInputChange("image_url", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Lieu de l'événement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LocationPicker onLocationSelect={setLocationData} initialLocation={locationData} />
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date et heure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Date et heure de début *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => handleInputChange("start_date", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Date et heure de fin *</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Capacity & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Capacité et tarification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="max_attendees">Nombre maximum de participants</Label>
            <Input
              id="max_attendees"
              type="number"
              placeholder="Ex: 100"
              value={formData.max_attendees}
              onChange={(e) => handleInputChange("max_attendees", e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix (0 pour gratuit)</Label>
              <div className="flex gap-2">
                <Euro className="h-5 w-5 text-muted-foreground mt-2" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Devise</Label>
              <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations supplémentaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
            <Input
              id="tags"
              placeholder="Ex: jazz, musique, concert, paris"
              value={formData.tags}
              onChange={(e) => handleInputChange("tags", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="external_url">Lien externe (site web, billetterie...)</Label>
            <Input
              id="external_url"
              type="url"
              placeholder="https://example.com"
              value={formData.external_url}
              onChange={(e) => handleInputChange("external_url", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Création en cours..." : "Créer l'événement"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="bg-transparent">
          Annuler
        </Button>
      </div>
    </form>
  )
}

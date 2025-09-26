import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Calendar,
  MapPin,
  Users,
  Search,
  Plus,
  Map,
  Music,
  Briefcase,
  Wrench,
  PartyPopper,
  Trophy,
  Network,
  MoreHorizontal,
} from "lucide-react"
import { getEventImage } from "@/lib/unsplash-images"

const categoryIcons = {
  concert: Music,
  conference: Briefcase,
  workshop: Wrench,
  party: PartyPopper,
  sports: Trophy,
  networking: Network,
  other: MoreHorizontal,
}

const categoryColors = {
  concert: "text-purple-600 bg-purple-50 border-purple-200",
  conference: "text-blue-600 bg-blue-50 border-blue-200",
  workshop: "text-orange-600 bg-orange-50 border-orange-200",
  party: "text-pink-600 bg-pink-50 border-pink-200",
  sports: "text-green-600 bg-green-50 border-green-200",
  networking: "text-indigo-600 bg-indigo-50 border-indigo-200",
  other: "text-gray-600 bg-gray-50 border-gray-200",
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from("events")
    .select(`
      *,
      profiles:organizer_id (
        full_name,
        avatar_url
      )
    `)
    .eq("status", "published")
    .eq("type", "public")
    .gte("start_date", new Date().toISOString())
    .order("start_date", { ascending: true })

  // Apply filters
  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  if (params.category) {
    query = query.eq("category", params.category)
  }

  const { data: events } = await query

  const categories = [
    { value: "concert", label: "Concert" },
    { value: "conference", label: "Conférence" },
    { value: "workshop", label: "Atelier" },
    { value: "party", label: "Soirée" },
    { value: "sports", label: "Sport" },
    { value: "networking", label: "Networking" },
    { value: "other", label: "Autre" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Découvrir les Événements</h1>
            <p className="text-muted-foreground">Trouvez votre prochaine expérience inoubliable</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/events/map">
                <Map className="h-4 w-4 mr-2 text-primary" />
                Vue carte
              </Link>
            </Button>
            <Button asChild className="accent-button">
              <Link href="/create-event">
                <Plus className="h-4 w-4 mr-2" />
                Créer un événement
              </Link>
            </Button>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <Card className="mb-8 elegant-shadow">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
                <Input
                  placeholder="Rechercher des événements..."
                  className="pl-10 h-12 text-base"
                  defaultValue={params.search}
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                <Button
                  asChild
                  variant={!params.category ? "default" : "outline"}
                  size="sm"
                  className={!params.category ? "accent-button" : ""}
                >
                  <Link href="/events">Tous</Link>
                </Button>
                {categories.map((category) => {
                  const Icon = categoryIcons[category.value as keyof typeof categoryIcons]
                  const isActive = params.category === category.value
                  return (
                    <Button
                      key={category.value}
                      asChild
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className={isActive ? "accent-button" : "hover:bg-muted/50"}
                    >
                      <Link href={`/events?category=${category.value}`} className="flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        {category.label}
                      </Link>
                    </Button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {events && events.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const Icon = categoryIcons[event.category as keyof typeof categoryIcons] || MoreHorizontal
              const categoryColorClass =
                categoryColors[event.category as keyof typeof categoryColors] || categoryColors.other

              return (
                <Card key={event.id} className="overflow-hidden hover-lift elegant-shadow group">
                  {event.image_url && (
                    <div className="aspect-video bg-muted image-overlay">
                      <img
                        src={event.image_url || getEventImage(event.category, event.id)}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={`${categoryColorClass} border`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {event.category}
                      </Badge>
                      {event.price > 0 && (
                        <Badge variant="outline" className="font-semibold">
                          {event.price} {event.currency}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </CardTitle>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {new Date(event.start_date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {event.venue_name && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="truncate">
                            {event.venue_name}, <span className="highlight-text">{event.city}</span>
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span>
                          <span className="highlight-text font-semibold">{event.current_attendees || 0}</span>{" "}
                          participant{(event.current_attendees || 0) > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {event.short_description || event.description}
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
                    >
                      <Link href={`/events/${event.id}`}>Voir les détails</Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="elegant-shadow">
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">Aucun événement trouvé</CardTitle>
              <CardDescription className="mb-4">
                {params.search || params.category
                  ? "Essayez de modifier vos critères de recherche"
                  : "Soyez le premier à créer un événement !"}
              </CardDescription>
              <Button asChild className="accent-button">
                <Link href="/create-event">Créer un événement</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

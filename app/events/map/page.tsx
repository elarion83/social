import { createClient } from "@/lib/supabase/server"
import { EventMap } from "@/components/event-map"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Music,
  Briefcase,
  Wrench,
  PartyPopper,
  Trophy,
  Network,
  MoreHorizontal,
} from "lucide-react"

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

export default async function EventsMapPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; category?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Get events with location data
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
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("start_date", { ascending: true })

  // Apply filters
  if (params.city) {
    query = query.ilike("city", `%${params.city}%`)
  }

  if (params.category) {
    query = query.eq("category", params.category)
  }

  const { data: events } = await query

  // Get unique cities for filter
  const { data: cities } = await supabase
    .from("events")
    .select("city")
    .eq("status", "published")
    .eq("type", "public")
    .not("city", "is", null)
    .order("city")

  const uniqueCities = [...new Set(cities?.map((c) => c.city).filter(Boolean))]

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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button asChild variant="outline" size="sm">
              <Link href="/events">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la liste
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2">Carte des Événements</h1>
              <p className="text-muted-foreground">Découvrez les événements près de chez vous</p>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-8 elegant-shadow">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    variant={!params.city ? "default" : "outline"}
                    size="sm"
                    className={!params.city ? "accent-button" : ""}
                  >
                    <Link href="/events/map">Toutes les villes</Link>
                  </Button>
                  {uniqueCities.slice(0, 5).map((city) => (
                    <Button
                      key={city}
                      asChild
                      variant={params.city === city ? "default" : "outline"}
                      size="sm"
                      className={params.city === city ? "accent-button" : "hover:bg-muted/50"}
                    >
                      <Link href={`/events/map?city=${city}${params.category ? `&category=${params.category}` : ""}`}>
                        <span className="highlight-text">{city}</span>
                      </Link>
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    variant={!params.category ? "default" : "outline"}
                    size="sm"
                    className={!params.category ? "accent-button" : ""}
                  >
                    <Link href={`/events/map${params.city ? `?city=${params.city}` : ""}`}>Toutes catégories</Link>
                  </Button>
                  {categories.slice(0, 4).map((category) => {
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
                        <Link
                          href={`/events/map?category=${category.value}${params.city ? `&city=${params.city}` : ""}`}
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {category.label}
                        </Link>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Map */}
            <div className="lg:col-span-1">
              <EventMap events={events || []} />
            </div>

            {/* Event List */}
            <div className="lg:col-span-1">
              <Card className="elegant-shadow">
                <CardHeader>
                  <CardTitle>
                    Événements trouvés (<span className="highlight-text">{events?.length || 0}</span>)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {events && events.length > 0 ? (
                    events.map((event) => {
                      const Icon = categoryIcons[event.category as keyof typeof categoryIcons] || MoreHorizontal
                      const categoryColorClass =
                        categoryColors[event.category as keyof typeof categoryColors] || categoryColors.other

                      return (
                        <div
                          key={event.id}
                          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors hover-lift"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={`${categoryColorClass} border text-xs`}>
                                  <Icon className="h-3 w-3 mr-1" />
                                  {event.category}
                                </Badge>
                                {event.price > 0 && (
                                  <Badge variant="outline" className="text-xs font-semibold">
                                    {event.price} {event.currency}
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-semibold line-clamp-2 mb-2 hover:text-primary transition-colors">
                                {event.title}
                              </h3>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-primary" />
                                  <span className="font-medium">
                                    {new Date(event.start_date).toLocaleDateString("fr-FR", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                                {event.venue_name && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3 text-primary" />
                                    <span className="truncate">
                                      {event.venue_name}, <span className="highlight-text">{event.city}</span>
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Users className="h-3 w-3 text-primary" />
                                  <span>
                                    <span className="highlight-text font-semibold">{event.current_attendees || 0}</span>{" "}
                                    participant
                                    {(event.current_attendees || 0) > 1 ? "s" : ""}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
                            >
                              <Link href={`/events/${event.id}`}>Voir</Link>
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Aucun événement trouvé avec ces critères</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

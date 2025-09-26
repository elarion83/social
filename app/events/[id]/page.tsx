import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { Calendar, MapPin, Users, Euro, Clock, ExternalLink, Share2, Heart, Edit } from "lucide-react"
import { EventActions } from "@/components/event-actions"

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get event details with organizer info
  const { data: event, error } = await supabase
    .from("events")
    .select(`
      *,
      profiles:organizer_id (
        id,
        full_name,
        avatar_url,
        bio
      )
    `)
    .eq("id", id)
    .single()

  if (error || !event) {
    notFound()
  }

  // Check if user is attending
  let attendeeStatus = null
  if (user) {
    const { data: attendee } = await supabase
      .from("event_attendees")
      .select("status")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .single()

    attendeeStatus = attendee?.status
  }

  // Get attendees count
  const { count: attendeesCount } = await supabase
    .from("event_attendees")
    .select("*", { count: "exact", head: true })
    .eq("event_id", id)
    .eq("status", "going")

  const isOrganizer = user?.id === event.organizer_id
  const eventDate = new Date(event.start_date)
  const endDate = new Date(event.end_date)
  const isPastEvent = eventDate < new Date()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Event Image */}
          {event.image_url && (
            <div className="aspect-video mb-8 rounded-lg overflow-hidden">
              <img
                src={event.image_url || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">{event.category}</Badge>
                  <Badge variant={event.type === "public" ? "default" : "outline"}>{event.type}</Badge>
                  {isPastEvent && <Badge variant="destructive">Terminé</Badge>}
                </div>
                <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
                {event.short_description && (
                  <p className="text-lg text-muted-foreground mb-4">{event.short_description}</p>
                )}
              </div>

              {/* Event Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Détails de l'événement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {eventDate.toLocaleDateString("fr-FR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {eventDate.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {endDate.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {event.venue_name && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{event.venue_name}</p>
                        {event.address && <p className="text-sm text-muted-foreground">{event.address}</p>}
                        {event.city && event.country && (
                          <p className="text-sm text-muted-foreground">
                            {event.city}, {event.country}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {attendeesCount || 0} participant{(attendeesCount || 0) > 1 ? "s" : ""}
                      </p>
                      {event.max_attendees && (
                        <p className="text-sm text-muted-foreground">Limite : {event.max_attendees} places</p>
                      )}
                    </div>
                  </div>

                  {event.price > 0 && (
                    <div className="flex items-center gap-3">
                      <Euro className="h-5 w-5 text-muted-foreground" />
                      <p className="font-medium">
                        {event.price} {event.currency}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Description */}
              {event.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{event.description}</p>
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Action Buttons */}
              <Card>
                <CardContent className="p-6">
                  {user ? (
                    <div className="space-y-4">
                      {isOrganizer ? (
                        <Button asChild className="w-full">
                          <Link href={`/events/${event.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier l'événement
                          </Link>
                        </Button>
                      ) : (
                        <EventActions
                          eventId={event.id}
                          currentStatus={attendeeStatus}
                          isPastEvent={isPastEvent}
                          maxAttendees={event.max_attendees}
                          currentAttendees={attendeesCount || 0}
                        />
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Heart className="h-4 w-4 mr-2" />
                          J'aime
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Share2 className="h-4 w-4 mr-2" />
                          Partager
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground text-center">
                        Connectez-vous pour participer à cet événement
                      </p>
                      <Button asChild className="w-full">
                        <Link href="/auth/login">Se connecter</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Organizer */}
              <Card>
                <CardHeader>
                  <CardTitle>Organisateur</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={event.profiles?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {event.profiles?.full_name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{event.profiles?.full_name || "Organisateur"}</p>
                      {event.profiles?.bio && <p className="text-sm text-muted-foreground">{event.profiles.bio}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* External Link */}
              {event.external_url && (
                <Card>
                  <CardContent className="p-6">
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href={event.external_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Site web
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

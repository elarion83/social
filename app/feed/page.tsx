import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, MapPin, Users, UserPlus } from "lucide-react"
import { FeedActions } from "@/components/feed-actions"
import { getEventImage, getDefaultAvatarImage } from "@/lib/unsplash-images"

export default async function FeedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's feed - events from people they follow + their own events
  const { data: followedUsers } = await supabase.from("follows").select("following_id").eq("follower_id", user.id)

  const followedIds = followedUsers?.map((f) => f.following_id) || []
  const allUserIds = [...followedIds, user.id]

  // Get recent events from followed users and own events
  const { data: feedEvents } = await supabase
    .from("events")
    .select(`
      *,
      profiles:organizer_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .in("organizer_id", allUserIds)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(20)

  // Get recent attendee activities
  const { data: recentAttendees } = await supabase
    .from("event_attendees")
    .select(`
      *,
      events (
        id,
        title,
        start_date,
        image_url
      ),
      profiles:user_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .in("user_id", allUserIds)
    .eq("status", "going")
    .order("created_at", { ascending: false })
    .limit(10)

  // Get suggested users to follow
  const { data: suggestedUsers } = await supabase
    .from("profiles")
    .select("*")
    .neq("id", user.id)
    .not("id", "in", `(${followedIds.join(",") || "null"})`)
    .limit(5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Mon Feed</h1>
            <p className="text-muted-foreground">Découvrez les dernières activités de votre réseau</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* New Events */}
              {feedEvents && feedEvents.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Nouveaux Événements</h2>
                  {feedEvents.map((event) => (
                    <Card key={event.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={event.profiles?.avatar_url || getDefaultAvatarImage()} />
                            <AvatarFallback>
                              {event.profiles?.full_name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">{event.profiles?.full_name}</span> a créé un nouvel
                              événement
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.created_at).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{event.category}</Badge>
                          {event.price > 0 && (
                            <Badge variant="outline">
                              {event.price} {event.currency}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {event.image_url && (
                          <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                            <img
                              src={event.image_url || getEventImage(event.category, event.id)}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.start_date).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                          {event.venue_name && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {event.venue_name}, {event.city}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {event.short_description || event.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Button asChild variant="outline" size="sm" className="bg-transparent">
                            <Link href={`/events/${event.id}`}>Voir les détails</Link>
                          </Button>
                          <FeedActions eventId={event.id} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Recent Activities */}
              {recentAttendees && recentAttendees.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Activités Récentes</h2>
                  {recentAttendees.map((attendee) => (
                    <Card key={`${attendee.event_id}-${attendee.user_id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={attendee.profiles?.avatar_url || getDefaultAvatarImage()} />
                            <AvatarFallback>
                              {attendee.profiles?.full_name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium">{attendee.profiles?.full_name}</span> participe à{" "}
                              <Link
                                href={`/events/${attendee.events?.id}`}
                                className="font-medium text-primary hover:underline"
                              >
                                {attendee.events?.title}
                              </Link>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(attendee.created_at).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          {attendee.events?.image_url && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden">
                              <img
                                src={attendee.events.image_url || getEventImage("other", attendee.events.id)}
                                alt={attendee.events.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {(!feedEvents || feedEvents.length === 0) && (!recentAttendees || recentAttendees.length === 0) && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <CardTitle className="mb-2">Votre feed est vide</CardTitle>
                    <p className="text-muted-foreground mb-4">
                      Suivez d'autres utilisateurs pour voir leurs événements et activités
                    </p>
                    <Button asChild>
                      <Link href="/discover">Découvrir des utilisateurs</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Suggested Users */}
              {suggestedUsers && suggestedUsers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {suggestedUsers.map((suggestedUser) => (
                      <div key={suggestedUser.id} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={suggestedUser.avatar_url || getDefaultAvatarImage()} />
                          <AvatarFallback>
                            {suggestedUser.full_name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{suggestedUser.full_name}</p>
                          {suggestedUser.bio && (
                            <p className="text-xs text-muted-foreground truncate">{suggestedUser.bio}</p>
                          )}
                        </div>
                        <Button size="sm" variant="outline" className="bg-transparent">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions Rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/create-event">Créer un Événement</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/events">Découvrir des Événements</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/profile">Mon Profil</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

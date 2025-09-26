import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Calendar, MapPin, Users, Settings, Edit, Globe, MapPinIcon } from "lucide-react"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's events
  const { data: userEvents } = await supabase
    .from("events")
    .select("*")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false })

  // Get events user is attending
  const { data: attendingEvents } = await supabase
    .from("event_attendees")
    .select(`
      *,
      events (
        *,
        profiles:organizer_id (
          full_name,
          avatar_url
        )
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "going")
    .order("created_at", { ascending: false })

  // Get followers/following counts
  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", user.id)

  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", user.id)

  const organizedEvents = userEvents || []
  const attendingEventsData = attendingEvents?.map((a) => a.events).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-24 w-24 mx-auto md:mx-0">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {profile?.full_name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase() || user.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{profile?.full_name || "Utilisateur"}</h1>
                  <p className="text-muted-foreground mb-4">{profile?.bio || "Aucune bio disponible"}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
                    {profile?.location && (
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4" />
                        {profile.location}
                      </div>
                    )}
                    {profile?.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary"
                        >
                          Site web
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center md:justify-start gap-6 mb-4">
                    <div className="text-center">
                      <p className="font-bold text-lg">{organizedEvents.length}</p>
                      <p className="text-sm text-muted-foreground">Événements créés</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{attendingEventsData.length}</p>
                      <p className="text-sm text-muted-foreground">Participations</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{followersCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Abonnés</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-lg">{followingCount || 0}</p>
                      <p className="text-sm text-muted-foreground">Abonnements</p>
                    </div>
                  </div>
                  <div className="flex justify-center md:justify-start gap-3">
                    <Button asChild>
                      <Link href="/profile/edit">
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier le profil
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="bg-transparent">
                      <Link href="/settings">
                        <Settings className="h-4 w-4 mr-2" />
                        Paramètres
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="organized" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="organized">Mes Événements ({organizedEvents.length})</TabsTrigger>
              <TabsTrigger value="attending">Participations ({attendingEventsData.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="organized" className="space-y-6">
              {organizedEvents.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {organizedEvents.map((event) => (
                    <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {event.image_url && (
                        <div className="aspect-video bg-muted">
                          <img
                            src={event.image_url || "/placeholder.svg"}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="secondary">{event.category}</Badge>
                          <Badge variant={event.status === "published" ? "default" : "outline"}>{event.status}</Badge>
                        </div>
                        <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                        <div className="space-y-2 text-sm text-muted-foreground">
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
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {event.current_attendees || 0} participant{(event.current_attendees || 0) > 1 ? "s" : ""}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Link href={`/events/${event.id}`}>Voir</Link>
                          </Button>
                          <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Link href={`/events/${event.id}/edit`}>Modifier</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <CardTitle className="mb-2">Aucun événement créé</CardTitle>
                    <p className="text-muted-foreground mb-4">Commencez par créer votre premier événement</p>
                    <Button asChild>
                      <Link href="/create-event">Créer un événement</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="attending" className="space-y-6">
              {attendingEventsData.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {attendingEventsData.map((event) => (
                    <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {event.image_url && (
                        <div className="aspect-video bg-muted">
                          <img
                            src={event.image_url || "/placeholder.svg"}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={event.profiles?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {event.profiles?.full_name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">par {event.profiles?.full_name}</span>
                        </div>
                        <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                        <div className="space-y-2 text-sm text-muted-foreground">
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
                      </CardHeader>
                      <CardContent>
                        <Button asChild variant="outline" className="w-full bg-transparent">
                          <Link href={`/events/${event.id}`}>Voir les détails</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <CardTitle className="mb-2">Aucune participation</CardTitle>
                    <p className="text-muted-foreground mb-4">Découvrez des événements qui vous intéressent</p>
                    <Button asChild>
                      <Link href="/events">Découvrir des événements</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

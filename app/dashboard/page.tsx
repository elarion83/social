import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Users, Ticket, Euro, Eye, Plus, BarChart3, Clock } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's events with stats
  const { data: userEvents } = await supabase
    .from("events")
    .select(`
      *,
      event_attendees(count),
      ticket_purchases(
        total_price,
        status
      )
    `)
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false })

  // Get upcoming events user is attending
  const { data: attendingEvents } = await supabase
    .from("event_attendees")
    .select(`
      *,
      events (
        id,
        title,
        date,
        location,
        image_url,
        profiles:organizer_id (
          full_name,
          avatar_url
        )
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "going")
    .gte("events.date", new Date().toISOString())
    .order("events.date", { ascending: true })
    .limit(5)

  // Get recent ticket purchases
  const { data: recentPurchases } = await supabase
    .from("ticket_purchases")
    .select(`
      *,
      events (
        title,
        date,
        image_url
      ),
      ticket_types (
        name
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "confirmed")
    .order("purchase_date", { ascending: false })
    .limit(5)

  // Calculate stats
  const totalEvents = userEvents?.length || 0
  const publishedEvents = userEvents?.filter((e) => e.status === "published").length || 0
  const totalAttendees =
    userEvents?.reduce((sum, event) => {
      return sum + (event.event_attendees?.[0]?.count || 0)
    }, 0) || 0

  const totalRevenue =
    userEvents?.reduce((sum, event) => {
      const eventRevenue =
        event.ticket_purchases?.reduce((eventSum: number, purchase: any) => {
          return purchase.status === "confirmed" ? eventSum + purchase.total_price : eventSum
        }, 0) || 0
      return sum + eventRevenue
    }, 0) || 0

  const upcomingEventsCount =
    userEvents?.filter((e) => new Date(e.date) > new Date() && e.status === "published").length || 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Bonjour, {profile?.full_name || "Utilisateur"} 👋
              </h1>
              <p className="text-muted-foreground">Voici un aperçu de votre activité sur EventSphere</p>
            </div>
            <Button asChild>
              <Link href="/create-event">
                <Plus className="h-4 w-4 mr-2" />
                Nouvel événement
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Événements créés</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground">{publishedEvents} publiés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participants totaux</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAttendees}</div>
              <p className="text-xs text-muted-foreground">Tous événements confondus</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} €</div>
              <p className="text-xs text-muted-foreground">Billets vendus</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Événements à venir</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEventsCount}</div>
              <p className="text-xs text-muted-foreground">Prochainement</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Mes événements récents
                </CardTitle>
                <CardDescription>Aperçu de vos derniers événements créés</CardDescription>
              </CardHeader>
              <CardContent>
                {userEvents && userEvents.length > 0 ? (
                  <div className="space-y-4">
                    {userEvents.slice(0, 5).map((event) => {
                      const attendeesCount = event.event_attendees?.[0]?.count || 0
                      const revenue =
                        event.ticket_purchases?.reduce((sum: number, purchase: any) => {
                          return purchase.status === "confirmed" ? sum + purchase.total_price : sum
                        }, 0) || 0

                      return (
                        <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                              <Calendar className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(event.date).toLocaleDateString("fr-FR")}
                                </span>
                                <Badge variant={event.status === "published" ? "default" : "secondary"}>
                                  {event.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{attendeesCount} participants</div>
                            <div className="text-sm text-muted-foreground">{revenue.toFixed(2)} € revenus</div>
                          </div>
                        </div>
                      )
                    })}
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href="/profile">Voir tous mes événements</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun événement</h3>
                    <p className="text-muted-foreground mb-4">Créez votre premier événement pour commencer</p>
                    <Button asChild>
                      <Link href="/create-event">Créer un événement</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Purchases */}
            {recentPurchases && recentPurchases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="h-5 w-5" />
                    Mes achats récents
                  </CardTitle>
                  <CardDescription>Vos derniers billets achetés</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPurchases.map((purchase) => (
                      <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-lg flex items-center justify-center">
                            <Ticket className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{purchase.events.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{purchase.ticket_types.name}</span>
                              <span>× {purchase.quantity}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{purchase.total_price.toFixed(2)} €</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(purchase.purchase_date).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button asChild variant="outline" className="w-full bg-transparent">
                      <Link href="/profile/tickets">Voir tous mes billets</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events I'm Attending */}
            {attendingEvents && attendingEvents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Prochains événements</CardTitle>
                  <CardDescription>Événements auxquels vous participez</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attendingEvents.map((attendance) => {
                      const event = attendance.events
                      return (
                        <div key={event.id} className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={event.profiles?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {event.profiles?.full_name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{event.title}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(event.date).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
                      <Link href="/profile">Voir tout</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/create-event">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un événement
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/events">
                    <Eye className="h-4 w-4 mr-2" />
                    Découvrir des événements
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/profile/tickets">
                    <Ticket className="h-4 w-4 mr-2" />
                    Mes billets
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                  <Link href="/profile/edit">
                    <Users className="h-4 w-4 mr-2" />
                    Modifier mon profil
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Users,
  Euro,
  Plus,
  BarChart3,
  Clock,
  TrendingUp,
  Eye,
  Edit,
  Share2,
  AlertCircle,
  CheckCircle,
  Star,
  MapPin,
  Zap,
} from "lucide-react"
import Link from "next/link"

export default async function CreatorDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's events with comprehensive stats
  const { data: userEvents } = await supabase
    .from("events")
    .select(`
      *,
      profiles:organizer_id (
        full_name,
        avatar_url
      )
    `)
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false })

  // Calculate comprehensive stats
  const totalEvents = userEvents?.length || 0
  const publishedEvents = userEvents?.filter((e) => e.status === "published").length || 0
  const draftEvents = userEvents?.filter((e) => e.status === "draft").length || 0
  const upcomingEvents =
    userEvents?.filter((e) => new Date(e.start_date) > new Date() && e.status === "published").length || 0
  const pastEvents =
    userEvents?.filter((e) => new Date(e.start_date) < new Date() && e.status === "published").length || 0

  const totalAttendees = userEvents?.reduce((sum, event) => sum + (event.current_attendees || 0), 0) || 0
  const totalRevenue =
    userEvents?.reduce((sum, event) => sum + (event.price || 0) * (event.current_attendees || 0), 0) || 0

  // Get recent activity and performance metrics
  const recentEvents = userEvents?.slice(0, 5) || []
  const topPerformingEvents =
    userEvents
      ?.filter((e) => e.current_attendees > 0)
      ?.sort((a, b) => (b.current_attendees || 0) - (a.current_attendees || 0))
      ?.slice(0, 3) || []

  // Calculate growth metrics (mock data for demo)
  const monthlyGrowth = 15.2
  const weeklyViews = 1247
  const conversionRate = 8.5

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Tableau de Bord Créateur</h1>
              <p className="text-muted-foreground text-lg">
                Bonjour {profile?.full_name || "Créateur"} ! Voici vos performances en temps réel
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/events">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir Mes Événements
                </Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-primary to-primary/80">
                <Link href="/create-event">
                  <Plus className="h-4 w-4 mr-2" />
                  Lancer Nouvel Événement
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Événements Actifs</CardTitle>
              <div className="p-2 bg-primary/10 rounded-full">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{upcomingEvents}</div>
              <p className="text-xs text-muted-foreground mt-1">{totalEvents} créés au total</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600 font-medium">+{monthlyGrowth}% ce mois</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-secondary/5 to-secondary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participants Totaux</CardTitle>
              <div className="p-2 bg-secondary/10 rounded-full">
                <Users className="h-4 w-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{totalAttendees}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Moyenne: {totalEvents > 0 ? Math.round(totalAttendees / totalEvents) : 0} par événement
              </p>
              <div className="flex items-center mt-2">
                <Star className="h-3 w-3 text-yellow-600 mr-1" />
                <span className="text-xs text-yellow-600 font-medium">Taux conversion: {conversionRate}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/5 to-green-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus Générés</CardTitle>
              <div className="p-2 bg-green-500/10 rounded-full">
                <Euro className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{totalRevenue.toFixed(0)}€</div>
              <p className="text-xs text-muted-foreground mt-1">
                Revenus moyens: {totalEvents > 0 ? Math.round(totalRevenue / totalEvents) : 0}€
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600 font-medium">+23% vs mois dernier</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500/5 to-purple-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vues Cette Semaine</CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-full">
                <Eye className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{weeklyViews}</div>
              <p className="text-xs text-muted-foreground mt-1">Portée moyenne par événement</p>
              <div className="flex items-center mt-2">
                <Zap className="h-3 w-3 text-purple-600 mr-1" />
                <span className="text-xs text-purple-600 font-medium">Engagement élevé</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="events">Mes Événements</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="growth">Croissance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Events */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Événements Récents
                    </CardTitle>
                    <CardDescription>Gérez et suivez vos dernières créations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentEvents.length > 0 ? (
                      <div className="space-y-4">
                        {recentEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{event.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(event.start_date).toLocaleDateString("fr-FR")}
                                  </span>
                                  <Badge variant={event.status === "published" ? "default" : "secondary"}>
                                    {event.status === "published" ? "Publié" : "Brouillon"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-sm font-medium">{event.current_attendees || 0} participants</div>
                                <div className="text-sm text-muted-foreground">
                                  {((event.price || 0) * (event.current_attendees || 0)).toFixed(0)}€ revenus
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button asChild size="sm" variant="outline">
                                  <Link href={`/events/${event.id}`}>
                                    <Eye className="h-3 w-3" />
                                  </Link>
                                </Button>
                                <Button asChild size="sm" variant="outline">
                                  <Link href={`/events/${event.id}/edit`}>
                                    <Edit className="h-3 w-3" />
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Créez Votre Premier Événement</h3>
                        <p className="text-muted-foreground mb-6">
                          Commencez votre aventure de créateur et touchez des milliers de personnes
                        </p>
                        <Button asChild>
                          <Link href="/create-event">
                            <Plus className="h-4 w-4 mr-2" />
                            Lancer Mon Premier Événement
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Top Performing Events */}
                {topPerformingEvents.length > 0 && (
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Top Performances
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {topPerformingEvents.map((event, index) => (
                          <div key={event.id} className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                index === 0
                                  ? "bg-yellow-100 text-yellow-800"
                                  : index === 1
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{event.title}</p>
                              <p className="text-xs text-muted-foreground">{event.current_attendees} participants</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Actions Rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild className="w-full justify-start">
                      <Link href="/create-event">
                        <Plus className="h-4 w-4 mr-2" />
                        Créer un Événement
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                      <Link href="/events">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir Tous Mes Événements
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                      <Link href="/profile/edit">
                        <Edit className="h-4 w-4 mr-2" />
                        Optimiser Mon Profil
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Status Overview */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">État des Événements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Publiés</span>
                      </div>
                      <span className="font-semibold">{publishedEvents}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">Brouillons</span>
                      </div>
                      <span className="font-semibold">{draftEvents}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">À venir</span>
                      </div>
                      <span className="font-semibold">{upcomingEvents}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Terminés</span>
                      </div>
                      <span className="font-semibold">{pastEvents}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Tous Mes Événements</CardTitle>
                <CardDescription>Gérez l'ensemble de votre portfolio d'événements</CardDescription>
              </CardHeader>
              <CardContent>
                {userEvents && userEvents.length > 0 ? (
                  <div className="space-y-4">
                    {userEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                            {event.image_url ? (
                              <img
                                src={event.image_url || "/placeholder.svg"}
                                alt={event.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <Calendar className="h-8 w-8 text-primary" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{event.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(event.start_date).toLocaleDateString("fr-FR")}
                              </span>
                              {event.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {event.city}
                                </span>
                              )}
                              <Badge variant={event.status === "published" ? "default" : "secondary"}>
                                {event.status === "published" ? "Publié" : "Brouillon"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">{event.current_attendees || 0} participants</div>
                            <div className="text-sm text-muted-foreground">
                              {((event.price || 0) * (event.current_attendees || 0)).toFixed(0)}€ revenus
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/events/${event.id}`}>
                                <Eye className="h-3 w-3" />
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/events/${event.id}/edit`}>
                                <Edit className="h-3 w-3" />
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline">
                              <Share2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Aucun événement créé</h3>
                    <p className="text-muted-foreground mb-6">Commencez votre parcours de créateur dès maintenant</p>
                    <Button asChild>
                      <Link href="/create-event">Créer Mon Premier Événement</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Performance Globale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taux de Conversion</span>
                      <span className="font-medium">{conversionRate}%</span>
                    </div>
                    <Progress value={conversionRate} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Engagement Moyen</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Satisfaction Client</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Croissance Mensuelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">+{monthlyGrowth}%</div>
                    <p className="text-muted-foreground">Croissance ce mois</p>
                    <div className="mt-4 flex justify-center">
                      <TrendingUp className="h-12 w-12 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="growth" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Conseils pour Booster Votre Succès</CardTitle>
                <CardDescription>Optimisez vos événements avec ces recommandations personnalisées</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Optimisez vos descriptions</h4>
                    <p className="text-sm text-blue-700">
                      Les événements avec des descriptions détaillées attirent 40% plus de participants
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Ajoutez des images attractives</h4>
                    <p className="text-sm text-green-700">
                      Les événements avec images de qualité ont un taux de conversion 60% supérieur
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <Star className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-purple-900">Engagez votre communauté</h4>
                    <p className="text-sm text-purple-700">
                      Répondez aux commentaires et questions pour créer une communauté fidèle
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

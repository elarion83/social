import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Users,
  Ticket,
  MapPin,
  Clock,
  Star,
  Heart,
  TrendingUp,
  Award,
  Camera,
  MessageCircle,
  Share2,
  Bell,
  Gift,
  Zap,
} from "lucide-react"
import Link from "next/link"

export default async function ParticipantDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get upcoming events user is attending
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select(`
      *,
      profiles:organizer_id (
        full_name,
        avatar_url
      )
    `)
    .gte("start_date", new Date().toISOString())
    .eq("status", "published")
    .order("start_date", { ascending: true })
    .limit(10)

  // Get past events user attended
  const { data: pastEvents } = await supabase
    .from("events")
    .select(`
      *,
      profiles:organizer_id (
        full_name,
        avatar_url
      )
    `)
    .lt("start_date", new Date().toISOString())
    .eq("status", "published")
    .order("start_date", { ascending: false })
    .limit(10)

  // Get user's favorite events/interests
  const { data: favoriteEvents } = await supabase
    .from("events")
    .select(`
      *,
      profiles:organizer_id (
        full_name,
        avatar_url
      )
    `)
    .eq("status", "published")
    .order("current_attendees", { ascending: false })
    .limit(6)

  // Calculate stats
  const totalEventsAttended = pastEvents?.length || 0
  const upcomingEventsCount = upcomingEvents?.length || 0
  const totalSpent = pastEvents?.reduce((sum, event) => sum + (event.price || 0), 0) || 0
  const favoriteCategories = pastEvents?.reduce((acc: any, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1
    return acc
  }, {})

  const topCategory = favoriteCategories
    ? Object.entries(favoriteCategories).sort(([, a]: any, [, b]: any) => b - a)[0]?.[0]
    : null

  // Mock data for enhanced features
  const streakDays = 12
  const pointsEarned = 2450
  const badgesEarned = 8
  const friendsConnected = 23

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Mon Univers d'Expériences</h1>
              <p className="text-muted-foreground text-lg">
                Salut {profile?.full_name || "Explorateur"} ! Découvrez vos aventures passées et futures
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/events">
                  <Calendar className="h-4 w-4 mr-2" />
                  Découvrir Plus
                </Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-primary to-primary/80">
                <Link href="/profile/edit">
                  <Star className="h-4 w-4 mr-2" />
                  Optimiser Mon Profil
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/5 to-blue-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prochaines Aventures</CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-full">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{upcomingEventsCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Événements confirmés</p>
              <div className="flex items-center mt-2">
                <Clock className="h-3 w-3 text-blue-600 mr-1" />
                <span className="text-xs text-blue-600 font-medium">Le prochain dans 3 jours</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/5 to-green-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expériences Vécues</CardTitle>
              <div className="p-2 bg-green-500/10 rounded-full">
                <Award className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{totalEventsAttended}</div>
              <p className="text-xs text-muted-foreground mt-1">Événements complétés</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600 font-medium">Série de {streakDays} jours</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500/5 to-purple-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points d'Expérience</CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-full">
                <Zap className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{pointsEarned}</div>
              <p className="text-xs text-muted-foreground mt-1">Points gagnés</p>
              <div className="flex items-center mt-2">
                <Gift className="h-3 w-3 text-purple-600 mr-1" />
                <span className="text-xs text-purple-600 font-medium">{badgesEarned} badges débloqués</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500/5 to-orange-500/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Réseau Social</CardTitle>
              <div className="p-2 bg-orange-500/10 rounded-full">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{friendsConnected}</div>
              <p className="text-xs text-muted-foreground mt-1">Amis connectés</p>
              <div className="flex items-center mt-2">
                <Heart className="h-3 w-3 text-orange-600 mr-1" />
                <span className="text-xs text-orange-600 font-medium">Communauté active</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upcoming">À Venir</TabsTrigger>
            <TabsTrigger value="memories">Mes Souvenirs</TabsTrigger>
            <TabsTrigger value="discover">Découvrir</TabsTrigger>
            <TabsTrigger value="profile">Mon Profil</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming Events */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Mes Prochaines Aventures
                    </CardTitle>
                    <CardDescription>Ne ratez aucune de vos expériences planifiées</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {upcomingEvents && upcomingEvents.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingEvents.slice(0, 5).map((event) => (
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
                                    {new Date(event.start_date).toLocaleDateString("fr-FR", {
                                      day: "numeric",
                                      month: "long",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  {event.city && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {event.city}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline">{event.category}</Badge>
                                  {event.price > 0 && <Badge variant="secondary">{event.price}€</Badge>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/events/${event.id}`}>
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Détails
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline">
                                <Share2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Aucun événement prévu</h3>
                        <p className="text-muted-foreground mb-6">
                          Découvrez des expériences incroyables qui vous attendent
                        </p>
                        <Button asChild>
                          <Link href="/events">Découvrir des Événements</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Progress & Achievements */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      Mes Accomplissements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Explorateur Niveau</span>
                        <span className="font-medium">7</span>
                      </div>
                      <Progress value={75} className="h-2" />
                      <p className="text-xs text-muted-foreground">Plus que 3 événements pour le niveau 8</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-yellow-50 rounded-lg">
                        <Award className="h-4 w-4 text-yellow-600 mx-auto mb-1" />
                        <div className="text-xs font-medium">Aventurier</div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <Users className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                        <div className="text-xs font-medium">Social</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded-lg">
                        <Star className="h-4 w-4 text-green-600 mx-auto mb-1" />
                        <div className="text-xs font-medium">Fidèle</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded-lg">
                        <Camera className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                        <div className="text-xs font-medium">Créatif</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Mes Statistiques</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Billets achetés</span>
                      </div>
                      <span className="font-semibold">{totalEventsAttended}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-600" />
                        <span className="text-sm">Événements favoris</span>
                      </div>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Avis laissés</span>
                      </div>
                      <span className="font-semibold">8</span>
                    </div>
                    {topCategory && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm">Catégorie préférée</span>
                        </div>
                        <Badge variant="outline">{topCategory}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" />
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3 p-2 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Nouvel événement recommandé</p>
                        <p className="text-xs text-muted-foreground">Concert Jazz ce weekend</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Rappel événement</p>
                        <p className="text-xs text-muted-foreground">Atelier demain à 14h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="memories" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Mes Souvenirs d'Expériences</CardTitle>
                <CardDescription>Revivez vos moments préférés</CardDescription>
              </CardHeader>
              <CardContent>
                {pastEvents && pastEvents.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pastEvents.map((event) => (
                      <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-video bg-muted relative">
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
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-white/90">
                              {event.category}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2 line-clamp-2">{event.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.start_date).toLocaleDateString("fr-FR")}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${star <= 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/events/${event.id}`}>Revoir</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Vos premiers souvenirs vous attendent</h3>
                    <p className="text-muted-foreground mb-6">
                      Participez à des événements pour créer des souvenirs inoubliables
                    </p>
                    <Button asChild>
                      <Link href="/events">Découvrir des Événements</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recommandations Personnalisées</CardTitle>
                <CardDescription>Découvrez des événements qui correspondent à vos goûts</CardDescription>
              </CardHeader>
              <CardContent>
                {favoriteEvents && favoriteEvents.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoriteEvents.map((event) => (
                      <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                        <div className="aspect-video bg-muted relative">
                          {event.image_url ? (
                            <img
                              src={event.image_url || "/placeholder.svg"}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Calendar className="h-8 w-8 text-primary" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-white/90">
                              {event.category}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2 line-clamp-2">{event.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.start_date).toLocaleDateString("fr-FR")}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-3 w-3" />
                              {event.current_attendees || 0} participants
                            </div>
                            <Button asChild size="sm">
                              <Link href={`/events/${event.id}`}>Découvrir</Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Découvrez de nouvelles expériences</h3>
                    <p className="text-muted-foreground mb-6">
                      Explorez notre catalogue d'événements pour trouver votre prochaine aventure
                    </p>
                    <Button asChild>
                      <Link href="/events">Explorer Maintenant</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Mon Profil d'Explorateur</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-lg">
                        {profile?.full_name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{profile?.full_name || "Utilisateur"}</h3>
                      <p className="text-muted-foreground">Explorateur d'expériences</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">Niveau 7</Badge>
                        <Badge variant="outline">{pointsEarned} points</Badge>
                      </div>
                    </div>
                  </div>
                  {profile?.bio && (
                    <div>
                      <h4 className="font-medium mb-2">À propos</h4>
                      <p className="text-sm text-muted-foreground">{profile.bio}</p>
                    </div>
                  )}
                  <Button asChild className="w-full">
                    <Link href="/profile/edit">Modifier Mon Profil</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Mes Préférences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Catégories favorites</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(favoriteCategories || {}).map(([category, count]) => (
                        <Badge key={category} variant="secondary">
                          {category} ({count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Statistiques</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Événements participés</span>
                        <span className="font-medium">{totalEventsAttended}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dépenses totales</span>
                        <span className="font-medium">{totalSpent.toFixed(0)}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Amis connectés</span>
                        <span className="font-medium">{friendsConnected}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

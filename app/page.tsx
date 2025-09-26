import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InteractiveMap } from "@/components/interactive-map"
import Link from "next/link"
import { Calendar, MapPin, Users, Sparkles, TrendingUp, Globe, Heart } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get featured events with location data for the map
  const { data: mapEvents } = await supabase
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
    .limit(20)

  // Get featured events for the grid
  const { data: featuredEvents } = await supabase
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
    .limit(6)

  // Get stats
  const { count: totalEvents } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")

  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/vibrant-event-crowd-celebration-festival-atmospher.jpg"
            alt="Event atmosphere"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/90" />
        </div>

        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-primary mr-3" />
              <h1 className="text-6xl font-bold text-foreground">What2Do</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Transformez vos idées en événements inoubliables. Rejoignez 10,000+ créateurs qui font vibrer leur
              communauté avec What2Do.
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{totalEvents || 0}+</div>
                <div className="text-sm text-muted-foreground">Événements Créés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{totalUsers || 0}+</div>
                <div className="text-sm text-muted-foreground">Créateurs Actifs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">50+</div>
                <div className="text-sm text-muted-foreground">Villes Conquises</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Button asChild size="lg" className="text-lg px-8">
                    <Link href="/dashboard">Mes Événements</Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg" className="text-lg px-8">
                    <Link href="/create-event">Lancer Mon Événement</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg px-8">
                    <Link href="/auth/sign-up">Créer Mon Premier Événement</Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg" className="text-lg px-8">
                    <Link href="/auth/login">Accéder à Mon Compte</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      {mapEvents && mapEvents.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Vos Événements Vous Attendent</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Découvrez instantanément les expériences qui vous correspondent grâce à notre carte interactive
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <InteractiveMap events={mapEvents} height="h-[500px]" showEventList={true} />
            </div>

            <div className="text-center mt-8">
              <Button asChild variant="outline" size="lg">
                <Link href="/events/map">
                  <Globe className="h-4 w-4 mr-2" />
                  Explorer Tous les Événements
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0">
          <img
            src="/modern-workspace-collaboration-creative-people-net.jpg"
            alt="Collaboration"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Organisez Sans Stress, Participez Sans Limite</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour créer des moments magiques et découvrir des expériences uniques
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-primary">De l'Idée à l'Événement en 5 Minutes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Notre interface intuitive transforme votre vision en événement réel. Plus de complications, juste de
                  la créativité.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-secondary">Votre Communauté Vous Attend</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Connectez-vous avec des passionnés comme vous. Chaque événement est une nouvelle rencontre, chaque
                  participation une nouvelle amitié.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-accent">L'Aventure Commence Ici</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Votre prochaine expérience extraordinaire se trouve peut-être au coin de la rue. Laissez-nous vous la
                  révéler.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents && featuredEvents.length > 0 && (
        <section className="py-20 relative">
          <div className="absolute inset-0">
            <img
              src="/diverse-events-collage-concerts-festivals-workshop.jpg"
              alt="Events collage"
              className="w-full h-full object-cover opacity-5"
            />
          </div>
          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Ne Ratez Plus Jamais l'Événement Parfait</h2>
              <p className="text-lg text-muted-foreground">
                Ces expériences uniques partent vite - réservez votre place maintenant
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {featuredEvents.map((event) => (
                <Card
                  key={event.id}
                  className="overflow-hidden hover:shadow-xl transition-shadow border-0 shadow-lg bg-card/90 backdrop-blur-sm group"
                >
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                      src={
                        event.image_url ||
                        `/placeholder.svg?height=200&width=400&query=${event.category || "/placeholder.svg"} event ${event.title}`
                      }
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    {event.max_attendees &&
                      event.current_attendees &&
                      event.max_attendees - event.current_attendees <= 10 && (
                        <div className="absolute top-3 left-3">
                          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            Plus que {event.max_attendees - event.current_attendees} places !
                          </div>
                        </div>
                      )}
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.start_date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </CardTitle>
                    {event.venue_name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {event.venue_name}, {event.city}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {event.short_description || event.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{event.current_attendees || 0} participants confirmés</span>
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/events/${event.id}`}>Réserver Ma Place</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button asChild variant="outline" size="lg">
                <Link href="/events">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Découvrir Tous les Événements
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0">
          <img
            src="/success-celebration-achievement-community-gatherin.jpg"
            alt="Success celebration"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/70" />
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl font-bold mb-4">Votre Prochaine Aventure Commence Maintenant</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez 10,000+ créateurs qui transforment leurs passions en événements mémorables. Gratuit, simple,
            efficace.
          </p>
          {!user && (
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/auth/sign-up">Créer Mon Premier Événement Gratuitement</Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}

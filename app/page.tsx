import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Calendar, MapPin, Users, Sparkles } from "lucide-react"
import { getEventImage } from "@/lib/unsplash-images"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get featured events
  const { data: events } = await supabase
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-40 right-20 w-24 h-24 bg-secondary/30 rounded-full blur-lg animate-bounce" />
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-accent/15 rounded-full blur-2xl animate-pulse" />
        </div>

        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-primary mr-3 animate-spin" />
              <h1 className="text-6xl font-bold gradient-text">What2Do</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Découvrez, créez et partagez des expériences inoubliables. La plateforme événementielle colorée qui
              connecte les passionnés et inspire l'action.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Button asChild size="lg" className="text-lg px-8 warm-glow">
                    <Link href="/dashboard">Mon Dashboard</Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg" className="text-lg px-8">
                    <Link href="/create-event">Créer un Événement</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg px-8 warm-glow">
                    <Link href="/auth/sign-up">Commencer Gratuitement</Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg" className="text-lg px-8">
                    <Link href="/auth/login">Se Connecter</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-muted/30 via-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 gradient-text">Pourquoi What2Do ?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une expérience complète et colorée pour organiser et découvrir des événements exceptionnels
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center border-0 shadow-lg card-hover bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-primary">Gestion Simplifiée</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Créez et gérez vos événements en quelques clics avec nos outils intuitifs et colorés
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg card-hover bg-gradient-to-br from-secondary/5 to-secondary/10">
              <CardHeader>
                <Users className="h-12 w-12 text-secondary mx-auto mb-4" />
                <CardTitle className="text-secondary">Réseau Social</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Connectez-vous avec d'autres passionnés et découvrez des événements personnalisés
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg card-hover bg-gradient-to-br from-accent/5 to-accent/10">
              <CardHeader>
                <MapPin className="h-12 w-12 text-accent mx-auto mb-4" />
                <CardTitle className="text-accent">Découverte Locale</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Explorez les événements près de chez vous avec notre système de géolocalisation
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      {events && events.length > 0 && (
        <section className="py-20 bg-gradient-to-l from-accent/5 via-background to-primary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 gradient-text">Événements à la Une</h2>
              <p className="text-lg text-muted-foreground">Découvrez les prochains événements populaires</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden card-hover border-0 shadow-lg">
                  {event.image_url && (
                    <div className="aspect-video bg-muted">
                      <img
                        src={event.image_url || getEventImage(event.category, event.id)}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.start_date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
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
                    <Button asChild className="w-full warm-glow">
                      <Link href={`/events/${event.id}`}>Voir Détails</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4 gradient-text">Prêt à Commencer ?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'organisateurs et de participants qui font confiance à What2Do
          </p>
          {!user && (
            <Button asChild size="lg" className="text-lg px-8 warm-glow">
              <Link href="/auth/sign-up">Créer Mon Compte</Link>
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}

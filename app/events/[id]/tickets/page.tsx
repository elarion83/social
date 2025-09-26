import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TicketPurchaseForm } from "@/components/ticket-purchase-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"

export default async function EventTicketsPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get event details
  const { data: event } = await supabase
    .from("events")
    .select(`
      *,
      profiles:organizer_id (
        full_name,
        avatar_url
      )
    `)
    .eq("id", params.id)
    .single()

  if (!event) {
    redirect("/events")
  }

  // Get ticket types
  const { data: ticketTypes } = await supabase
    .from("ticket_types")
    .select("*")
    .eq("event_id", params.id)
    .eq("is_active", true)
    .order("price", { ascending: true })

  // Check if user already has tickets
  const { data: userPurchases } = await supabase
    .from("ticket_purchases")
    .select("*, ticket_types(name)")
    .eq("event_id", params.id)
    .eq("user_id", user.id)
    .eq("status", "confirmed")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/events/${params.id}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Event
            </Button>
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(event.date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {event.location}
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {event.max_participants} places
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Choisir vos billets</CardTitle>
                <CardDescription>Sélectionnez le type de billet qui vous convient</CardDescription>
              </CardHeader>
              <CardContent>
                {ticketTypes && ticketTypes.length > 0 ? (
                  <TicketPurchaseForm eventId={params.id} ticketTypes={ticketTypes} userId={user.id} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucun billet disponible pour cet événement.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {userPurchases && userPurchases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Vos billets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userPurchases.map((purchase) => (
                      <div key={purchase.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{purchase.ticket_types?.name}</p>
                          <p className="text-sm text-muted-foreground">Quantité: {purchase.quantity}</p>
                        </div>
                        <Badge variant="secondary">Confirmé</Badge>
                      </div>
                    ))}
                  </div>
                  <Link href="/profile/tickets">
                    <Button variant="outline" className="w-full mt-4 bg-transparent">
                      Voir tous mes billets
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Informations importantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium">Politique d'annulation</h4>
                  <p className="text-muted-foreground">Remboursement possible jusqu'à 48h avant l'événement.</p>
                </div>
                <div>
                  <h4 className="font-medium">Accès à l'événement</h4>
                  <p className="text-muted-foreground">Présentez votre billet numérique à l'entrée.</p>
                </div>
                <div>
                  <h4 className="font-medium">Contact</h4>
                  <p className="text-muted-foreground">Organisé par {event.profiles?.full_name}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

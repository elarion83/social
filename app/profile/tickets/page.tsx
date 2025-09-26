import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Ticket, QrCode, Download } from "lucide-react"
import Link from "next/link"

export default async function UserTicketsPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user's ticket purchases with event details
  const { data: purchases } = await supabase
    .from("ticket_purchases")
    .select(`
      *,
      ticket_types (
        name,
        description
      ),
      events (
        title,
        date,
        location,
        image_url
      ),
      tickets (
        id,
        ticket_code,
        is_used,
        used_at
      )
    `)
    .eq("user_id", user.id)
    .order("purchase_date", { ascending: false })

  const confirmedPurchases = purchases?.filter((p) => p.status === "confirmed") || []
  const upcomingEvents = confirmedPurchases.filter((p) => new Date(p.events.date) > new Date())
  const pastEvents = confirmedPurchases.filter((p) => new Date(p.events.date) <= new Date())

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mes billets</h1>
          <p className="text-muted-foreground">Gérez vos billets et accédez à vos événements</p>
        </div>

        {confirmedPurchases.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun billet</h3>
              <p className="text-muted-foreground mb-6">Vous n'avez pas encore acheté de billets.</p>
              <Link href="/events">
                <Button>Découvrir les événements</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Événements à venir</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((purchase) => (
                    <TicketCard key={purchase.id} purchase={purchase} />
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Événements passés</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((purchase) => (
                    <TicketCard key={purchase.id} purchase={purchase} isPast />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function TicketCard({ purchase, isPast = false }: { purchase: any; isPast?: boolean }) {
  const eventDate = new Date(purchase.events.date)
  const isUsed = purchase.tickets.some((ticket: any) => ticket.is_used)

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative">
        {purchase.events.image_url ? (
          <img
            src={purchase.events.image_url || "/placeholder.svg"}
            alt={purchase.events.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant={isPast ? "secondary" : isUsed ? "destructive" : "default"}>
            {isPast ? "Passé" : isUsed ? "Utilisé" : "Valide"}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2">{purchase.events.title}</CardTitle>
        <CardDescription className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            {eventDate.toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            {purchase.events.location}
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{purchase.ticket_types.name}</span>
            <span className="text-sm text-muted-foreground">× {purchase.quantity}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span>Total payé</span>
            <span className="font-medium">{purchase.total_price.toFixed(2)} €</span>
          </div>

          {!isPast && (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

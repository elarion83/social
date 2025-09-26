import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Users, Plus, Lock, Globe, Crown, Calendar, Settings, MessageCircle } from "lucide-react"

async function getCircleDetails(circleId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get circle details with member info
  const { data: circle, error: circleError } = await supabase
    .from("circles")
    .select(`
      *,
      circle_members!inner(role),
      creator:profiles!circles_creator_id_fkey(full_name, avatar_url)
    `)
    .eq("id", circleId)
    .or(`creator_id.eq.${user.id},circle_members.user_id.eq.${user.id}`)
    .single()

  if (circleError || !circle) {
    notFound()
  }

  // Get all members
  const { data: members } = await supabase
    .from("circle_members")
    .select(`
      *,
      user:profiles!circle_members_user_id_fkey(full_name, avatar_url, email)
    `)
    .eq("circle_id", circleId)

  // Get circle events
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("circle_id", circleId)
    .eq("visibility", "circle")
    .order("start_date", { ascending: true })

  return { circle, members: members || [], events: events || [], currentUser: user }
}

export default async function CircleDetailPage({ params }: { params: { id: string } }) {
  const { circle, members, events, currentUser } = await getCircleDetails(params.id)

  const isCreator = circle.creator_id === currentUser.id
  const userMember = members.find((m) => m.user_id === currentUser.id)
  const isAdmin = userMember?.role === "admin" || isCreator

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Circle Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {circle.is_private ? (
                <Lock className="h-6 w-6 text-orange-500" />
              ) : (
                <Globe className="h-6 w-6 text-green-500" />
              )}
              <h1 className="text-3xl font-bold">{circle.name}</h1>
            </div>
            {isCreator && <Crown className="h-6 w-6 text-yellow-500" />}
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Messages
            </Button>
            {isAdmin && (
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Gérer
              </Button>
            )}
          </div>
        </div>

        {circle.description && <p className="text-muted-foreground mb-4">{circle.description}</p>}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{members.length} membres</span>
          </div>
          <Badge variant={circle.is_private ? "secondary" : "outline"}>{circle.is_private ? "Privé" : "Public"}</Badge>
          <span>Créé par {circle.creator?.full_name}</span>
        </div>
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList>
          <TabsTrigger value="events">Événements ({events.length})</TabsTrigger>
          <TabsTrigger value="members">Membres ({members.length})</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Événements du cercle</h2>
            <Button asChild>
              <Link href={`/create-event?circle=${circle.id}`}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un événement
              </Link>
            </Button>
          </div>

          {events.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucun événement</h3>
                <p className="text-muted-foreground mb-6">Soyez le premier à organiser un événement pour ce cercle</p>
                <Button asChild>
                  <Link href={`/create-event?circle=${circle.id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer le premier événement
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    {event.short_description && (
                      <p className="text-sm text-muted-foreground">{event.short_description}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>📅 {new Date(event.start_date).toLocaleDateString("fr-FR")}</div>
                      {event.venue_name && <div>📍 {event.venue_name}</div>}
                      <div className="flex items-center justify-between mt-4">
                        <Badge variant="outline">{event.category}</Badge>
                        <Button asChild size="sm">
                          <Link href={`/events/${event.id}`}>Voir</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Membres du cercle</h2>
            {isAdmin && (
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Inviter des membres
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.user?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {member.user?.full_name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase() || member.user?.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{member.user?.full_name || "Utilisateur"}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        {member.role === "admin" && <Crown className="h-3 w-3 text-yellow-500" />}
                        <span className="capitalize">{member.role}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <h2 className="text-xl font-semibold">Activité récente</h2>
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground">L'historique d'activité sera bientôt disponible</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

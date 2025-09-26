import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Users, Plus, Lock, Globe, Crown } from "lucide-react"

async function getCircles() {
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

  // Get circles where user is creator or member
  const { data: circles, error } = await supabase
    .from("circles")
    .select(`
      *,
      circle_members!inner(role),
      _count:circle_members(count)
    `)
    .or(`creator_id.eq.${user.id},circle_members.user_id.eq.${user.id}`)

  if (error) {
    console.error("Error fetching circles:", error)
    return []
  }

  return circles || []
}

export default async function CirclesPage() {
  const circles = await getCircles()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mes Cercles</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos communautés et partagez des événements avec les bonnes personnes
          </p>
        </div>
        <Button asChild>
          <Link href="/circles/create">
            <Plus className="h-4 w-4 mr-2" />
            Créer un cercle
          </Link>
        </Button>
      </div>

      {circles.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun cercle pour le moment</h3>
            <p className="text-muted-foreground mb-6">
              Créez votre premier cercle pour commencer à partager des événements avec vos proches
            </p>
            <Button asChild>
              <Link href="/circles/create">
                <Plus className="h-4 w-4 mr-2" />
                Créer mon premier cercle
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circles.map((circle) => (
            <Card key={circle.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {circle.is_private ? (
                      <Lock className="h-4 w-4 text-orange-500" />
                    ) : (
                      <Globe className="h-4 w-4 text-green-500" />
                    )}
                    <CardTitle className="text-lg">{circle.name}</CardTitle>
                  </div>
                  {circle.circle_members[0]?.role === "admin" ||
                    (circle.creator_id && <Crown className="h-4 w-4 text-yellow-500" />)}
                </div>
                {circle.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{circle.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{circle._count} membres</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={circle.is_private ? "secondary" : "outline"}>
                      {circle.is_private ? "Privé" : "Public"}
                    </Badge>
                    {circle.circle_members[0]?.role && (
                      <Badge variant="outline">{circle.circle_members[0].role === "admin" ? "Admin" : "Membre"}</Badge>
                    )}
                  </div>
                </div>
                <Button asChild className="w-full mt-4 bg-transparent" variant="outline">
                  <Link href={`/circles/${circle.id}`}>Voir le cercle</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

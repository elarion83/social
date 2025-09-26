import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { MessageCircle, Users, Plus, Clock } from "lucide-react"

async function getConversations() {
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

  // Get conversations with latest message and participant info
  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      *,
      conversation_participants!inner(
        user_id,
        last_read_at,
        user:profiles!conversation_participants_user_id_fkey(full_name, avatar_url)
      ),
      circle:circles(name),
      latest_message:messages(content, created_at, sender_id, sender:profiles!messages_sender_id_fkey(full_name))
    `)
    .eq("conversation_participants.user_id", user.id)
    .order("updated_at", { ascending: false })

  return { conversations: conversations || [], currentUser: user }
}

export default async function MessagesPage() {
  const { conversations, currentUser } = await getConversations()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground mt-2">Restez connecté avec votre communauté</p>
        </div>
        <Button asChild>
          <Link href="/messages/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle conversation
          </Link>
        </Button>
      </div>

      {conversations.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucune conversation</h3>
            <p className="text-muted-foreground mb-6">Commencez à échanger avec d'autres membres de la communauté</p>
            <Button asChild>
              <Link href="/messages/new">
                <Plus className="h-4 w-4 mr-2" />
                Démarrer une conversation
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => {
            const otherParticipants = conversation.conversation_participants.filter((p) => p.user_id !== currentUser.id)
            const isCircleChat = conversation.type === "circle"
            const latestMessage = conversation.latest_message?.[0]

            return (
              <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <Link href={`/messages/${conversation.id}`} className="block">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {isCircleChat ? (
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                        ) : (
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={otherParticipants[0]?.user?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>
                              {otherParticipants[0]?.user?.full_name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold truncate">
                            {isCircleChat
                              ? conversation.circle?.name || "Cercle"
                              : otherParticipants[0]?.user?.full_name || "Utilisateur"}
                          </h3>
                          <div className="flex items-center gap-2">
                            {isCircleChat && <Badge variant="outline">Cercle</Badge>}
                            {latestMessage && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(latestMessage.created_at).toLocaleDateString("fr-FR")}
                              </span>
                            )}
                          </div>
                        </div>

                        {latestMessage && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">
                              {latestMessage.sender_id === currentUser.id
                                ? "Vous"
                                : latestMessage.sender?.full_name || "Utilisateur"}
                              :{" "}
                            </span>
                            <span className="truncate">{latestMessage.content}</span>
                          </div>
                        )}

                        {!latestMessage && <p className="text-sm text-muted-foreground">Aucun message</p>}
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

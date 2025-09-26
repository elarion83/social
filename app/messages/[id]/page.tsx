import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { ChatInterface } from "@/components/messages/chat-interface"

async function getConversation(conversationId: string) {
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

  // Get conversation details
  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select(`
      *,
      conversation_participants!inner(
        user_id,
        last_read_at,
        user:profiles!conversation_participants_user_id_fkey(full_name, avatar_url, email)
      ),
      circle:circles(name, description)
    `)
    .eq("id", conversationId)
    .eq("conversation_participants.user_id", user.id)
    .single()

  if (conversationError || !conversation) {
    notFound()
  }

  // Get messages
  const { data: messages } = await supabase
    .from("messages")
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
    `)
    .eq("conversation_id", conversationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })

  return { conversation, messages: messages || [], currentUser: user }
}

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const { conversation, messages, currentUser } = await getConversation(params.id)

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ChatInterface conversation={conversation} initialMessages={messages} currentUser={currentUser} />
    </div>
  )
}

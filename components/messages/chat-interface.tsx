"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Send, Users } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { MessageCircle } from "lucide-react" // Import MessageCircle

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
  sender: {
    full_name: string
    avatar_url: string
  }
}

interface ChatInterfaceProps {
  conversation: any
  initialMessages: Message[]
  currentUser: any
}

export function ChatInterface({ conversation, initialMessages, currentUser }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel(`conversation-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          // Fetch the complete message with sender info
          const { data: newMessage } = await supabase
            .from("messages")
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
            `)
            .eq("id", payload.new.id)
            .single()

          if (newMessage) {
            setMessages((prev) => [...prev, newMessage])
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversation.id, supabase])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversation.id,
        sender_id: currentUser.id,
        content: newMessage.trim(),
      })

      if (error) {
        console.error("[v0] Error sending message:", error)
        toast.error("Erreur lors de l'envoi du message")
        return
      }

      setNewMessage("")
    } catch (error) {
      console.error("[v0] Unexpected error:", error)
      toast.error("Une erreur inattendue s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  const otherParticipants = conversation.conversation_participants.filter((p: any) => p.user_id !== currentUser.id)
  const isCircleChat = conversation.type === "circle"

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Card className="rounded-none border-x-0 border-t-0">
        <CardHeader className="py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/messages">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>

            <div className="flex items-center gap-3">
              {isCircleChat ? (
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <Avatar>
                  <AvatarImage src={otherParticipants[0]?.user?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {otherParticipants[0]?.user?.full_name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              )}

              <div>
                <CardTitle className="text-lg">
                  {isCircleChat
                    ? conversation.circle?.name || "Cercle"
                    : otherParticipants[0]?.user?.full_name || "Utilisateur"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {isCircleChat && <Badge variant="outline">Cercle</Badge>}
                  <span className="text-sm text-muted-foreground">
                    {conversation.conversation_participants.length} participants
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun message pour le moment</p>
            <p className="text-sm">Soyez le premier à envoyer un message !</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === currentUser.id
            return (
              <div key={message.id} className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                {!isOwnMessage && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.sender?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {message.sender?.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[70%] ${isOwnMessage ? "text-right" : ""}`}>
                  {!isOwnMessage && <p className="text-xs text-muted-foreground mb-1">{message.sender?.full_name}</p>}
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(message.created_at).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <Card className="rounded-none border-x-0 border-b-0">
        <CardContent className="p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Tapez votre message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

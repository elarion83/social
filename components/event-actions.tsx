"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Check, Clock, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface EventActionsProps {
  eventId: string
  currentStatus: string | null
  isPastEvent: boolean
  maxAttendees: number | null
  currentAttendees: number
}

export function EventActions({
  eventId,
  currentStatus,
  isPastEvent,
  maxAttendees,
  currentAttendees,
}: EventActionsProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      if (newStatus === "not_going" && status) {
        // Remove attendance
        const { error } = await supabase.from("event_attendees").delete().eq("event_id", eventId).eq("user_id", user.id)

        if (error) throw error
        setStatus(null)
      } else {
        // Add or update attendance
        const { error } = await supabase.from("event_attendees").upsert(
          {
            event_id: eventId,
            user_id: user.id,
            status: newStatus,
          },
          {
            onConflict: "event_id,user_id",
          },
        )

        if (error) throw error
        setStatus(newStatus)
      }

      router.refresh()
    } catch (error) {
      console.error("Error updating attendance:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isPastEvent) {
    return (
      <div className="text-center p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">Cet événement est terminé</p>
      </div>
    )
  }

  const isFull = maxAttendees && currentAttendees >= maxAttendees

  return (
    <div className="space-y-3">
      {isFull && status !== "going" && (
        <div className="text-center p-3 bg-destructive/10 rounded-lg border border-destructive/20">
          <p className="text-sm text-destructive">Événement complet</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        <Button
          onClick={() => handleStatusChange("going")}
          disabled={isLoading || (isFull && status !== "going")}
          variant={status === "going" ? "default" : "outline"}
          className={status === "going" ? "" : "bg-transparent"}
        >
          <Check className="h-4 w-4 mr-2" />
          {status === "going" ? "Je participe" : "Participer"}
        </Button>

        <Button
          onClick={() => handleStatusChange("interested")}
          disabled={isLoading}
          variant={status === "interested" ? "default" : "outline"}
          className={status === "interested" ? "" : "bg-transparent"}
        >
          <Clock className="h-4 w-4 mr-2" />
          {status === "interested" ? "Intéressé(e)" : "Ça m'intéresse"}
        </Button>

        {status && (
          <Button
            onClick={() => handleStatusChange("not_going")}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="bg-transparent"
          >
            <X className="h-4 w-4 mr-2" />
            Ne plus participer
          </Button>
        )}
      </div>
    </div>
  )
}

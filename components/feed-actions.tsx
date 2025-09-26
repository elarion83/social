"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2 } from "lucide-react"

interface FeedActionsProps {
  eventId: string
}

export function FeedActions({ eventId }: FeedActionsProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Événement EventSphere",
        url: `${window.location.origin}/events/${eventId}`,
      })
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/events/${eventId}`)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={handleLike} className={liked ? "text-red-500" : ""}>
        <Heart className={`h-4 w-4 mr-1 ${liked ? "fill-current" : ""}`} />
        {likeCount}
      </Button>
      <Button variant="ghost" size="sm">
        <MessageCircle className="h-4 w-4 mr-1" />0
      </Button>
      <Button variant="ghost" size="sm" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

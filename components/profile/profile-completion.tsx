"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, User, Camera, MapPin, Globe, FileText } from "lucide-react"
import Link from "next/link"

interface ProfileCompletionProps {
  profile: any
}

export function ProfileCompletion({ profile }: ProfileCompletionProps) {
  const [completionScore, setCompletionScore] = useState(0)
  const [completedItems, setCompletedItems] = useState<string[]>([])

  const completionItems = [
    {
      id: "full_name",
      label: "Nom complet",
      icon: User,
      completed: !!profile?.full_name,
      points: 20,
    },
    {
      id: "avatar_url",
      label: "Photo de profil",
      icon: Camera,
      completed: !!profile?.avatar_url,
      points: 15,
    },
    {
      id: "bio",
      label: "Biographie",
      icon: FileText,
      completed: !!profile?.bio,
      points: 25,
    },
    {
      id: "location",
      label: "Localisation",
      icon: MapPin,
      completed: !!profile?.location,
      points: 15,
    },
    {
      id: "website",
      label: "Site web",
      icon: Globe,
      completed: !!profile?.website,
      points: 10,
    },
  ]

  useEffect(() => {
    const completed = completionItems.filter((item) => item.completed)
    const totalPoints = completed.reduce((sum, item) => sum + item.points, 0)
    const maxPoints = completionItems.reduce((sum, item) => sum + item.points, 0)

    setCompletedItems(completed.map((item) => item.id))
    setCompletionScore(Math.round((totalPoints / maxPoints) * 100))
  }, [profile])

  if (completionScore === 100) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Profil complet !</p>
              <p className="text-sm text-green-600">Votre profil est entièrement renseigné</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Complétez votre profil</CardTitle>
          <Badge variant="outline">{completionScore}%</Badge>
        </div>
        <Progress value={completionScore} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Un profil complet vous aide à être découvert et à créer des connexions
        </p>

        <div className="space-y-3">
          {completionItems.map((item) => {
            const Icon = item.icon
            const isCompleted = completedItems.includes(item.id)

            return (
              <div key={item.id} className="flex items-center gap-3">
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className={`text-sm flex-1 ${isCompleted ? "text-muted-foreground line-through" : ""}`}>
                  {item.label}
                </span>
                <span className="text-xs text-muted-foreground">+{item.points}pts</span>
              </div>
            )
          })}
        </div>

        {completionScore < 100 && (
          <Button asChild className="w-full" size="sm">
            <Link href="/profile/edit">Compléter mon profil</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

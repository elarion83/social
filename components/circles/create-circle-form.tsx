"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Users, Lock, Globe } from "lucide-react"

export function CreateCircleForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Le nom du cercle est requis")
      return
    }

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error("Vous devez être connecté pour créer un cercle")
        return
      }

      const { data, error } = await supabase
        .from("circles")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          creator_id: user.id,
          is_private: isPrivate,
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Error creating circle:", error)
        toast.error("Erreur lors de la création du cercle")
        return
      }

      toast.success("Cercle créé avec succès!")
      router.push(`/circles/${data.id}`)
    } catch (error) {
      console.error("[v0] Unexpected error:", error)
      toast.error("Une erreur inattendue s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Créer un nouveau cercle
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du cercle *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mes amis proches, Collègues de travail..."
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre cercle et son objectif..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {isPrivate ? <Lock className="h-5 w-5 text-orange-500" /> : <Globe className="h-5 w-5 text-green-500" />}
              <div>
                <Label htmlFor="privacy" className="text-base font-medium">
                  {isPrivate ? "Cercle privé" : "Cercle public"}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isPrivate
                    ? "Seuls les membres invités peuvent voir ce cercle"
                    : "Tout le monde peut découvrir et demander à rejoindre ce cercle"}
                </p>
              </div>
            </div>
            <Switch id="privacy" checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Création en cours..." : "Créer le cercle"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

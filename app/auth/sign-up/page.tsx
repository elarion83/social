"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Sparkles } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/5 via-primary/5 to-accent/5 p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-28 h-28 bg-secondary/25 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-60 left-10 w-36 h-36 bg-accent/20 rounded-full blur-lg animate-bounce" />
        <div className="absolute bottom-40 right-1/4 w-32 h-32 bg-primary/15 rounded-full blur-2xl animate-pulse" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary mr-3 animate-spin" />
            <h1 className="text-3xl font-bold gradient-text">What2Do</h1>
          </div>
          <p className="text-muted-foreground">Votre première expérience commence ici</p>
        </div>

        <Card className="border-0 shadow-xl card-hover bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-center gradient-text">Créez Votre Premier Événement</CardTitle>
            <CardDescription className="text-center">Rejoignez 10,000+ créateurs en moins de 2 minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Comment vous appeler ?</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Votre nom complet"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Votre email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mon.email@exemple.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe sécurisé</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Au moins 6 caractères"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmez votre mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Répétez votre mot de passe"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12"
                />
              </div>
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full h-12 text-base warm-glow" disabled={isLoading}>
                {isLoading ? "Création de votre compte..." : "Créer Mon Premier Événement Gratuitement"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Déjà membre ? </span>
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Accéder à mon compte
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

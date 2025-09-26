import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, Shield, CreditCard, Globe, Smartphone, Mail, Lock, Trash2, Download } from "lucide-react"
import Link from "next/link"

export default async function SettingsPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Paramètres</h1>
            <p className="text-muted-foreground">Gérez vos préférences et paramètres de compte</p>
          </div>

          <div className="space-y-8">
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Informations du compte
                </CardTitle>
                <CardDescription>Gérez vos informations personnelles et de sécurité</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm">{user.email}</span>
                      <Badge variant="secondary">Vérifié</Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Nom complet</Label>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm">{profile?.full_name || "Non défini"}</span>
                      <Button asChild variant="outline" size="sm">
                        <Link href="/profile/edit">Modifier</Link>
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Sécurité</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Mot de passe</p>
                          <p className="text-xs text-muted-foreground">Dernière modification il y a 30 jours</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Changer
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Authentification à deux facteurs</p>
                          <p className="text-xs text-muted-foreground">Sécurisez votre compte</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Choisissez comment vous souhaitez être notifié</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Notifications par email</p>
                        <p className="text-xs text-muted-foreground">
                          Recevez des emails pour les événements importants
                        </p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Notifications push</p>
                        <p className="text-xs text-muted-foreground">Notifications en temps réel sur votre appareil</p>
                      </div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Événements recommandés</p>
                        <p className="text-xs text-muted-foreground">Recevez des suggestions d'événements</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Notifications d'événements</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="new-attendee" className="text-sm">
                        Nouveau participant
                      </Label>
                      <Switch id="new-attendee" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="event-reminder" className="text-sm">
                        Rappels d'événements
                      </Label>
                      <Switch id="event-reminder" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ticket-sales" className="text-sm">
                        Ventes de billets
                      </Label>
                      <Switch id="ticket-sales" defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Confidentialité et données
                </CardTitle>
                <CardDescription>Contrôlez vos données et votre confidentialité</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Profil public</p>
                      <p className="text-xs text-muted-foreground">Permettre aux autres de voir votre profil</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Événements publics</p>
                      <p className="text-xs text-muted-foreground">Afficher vos événements dans les recherches</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Données analytiques</p>
                      <p className="text-xs text-muted-foreground">
                        Partager des données anonymes pour améliorer le service
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Gestion des données</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter mes données
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer mon compte
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing & Subscription */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Facturation et abonnement
                </CardTitle>
                <CardDescription>Gérez vos moyens de paiement et abonnements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Plan Gratuit</p>
                    <p className="text-sm text-muted-foreground">Jusqu'à 5 événements par mois</p>
                  </div>
                  <Badge variant="secondary">Actuel</Badge>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Moyens de paiement</h4>
                  <div className="text-sm text-muted-foreground">Aucun moyen de paiement enregistré</div>
                  <Button variant="outline" size="sm">
                    Ajouter une carte
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

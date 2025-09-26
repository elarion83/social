import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Shield, Eye, Users, Globe, Lock, AlertTriangle } from "lucide-react"

export default async function PrivacySettingsPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Paramètres de confidentialité</h1>
            <p className="text-muted-foreground">Contrôlez qui peut voir vos informations et activités</p>
          </div>

          <div className="space-y-8">
            {/* Profile Visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Visibilité du profil
                </CardTitle>
                <CardDescription>Gérez qui peut voir votre profil et vos informations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Profil public</Label>
                      <p className="text-xs text-muted-foreground">Permettre à tous de voir votre profil</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Afficher l'email</Label>
                      <p className="text-xs text-muted-foreground">Rendre votre email visible sur votre profil</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Afficher la localisation</Label>
                      <p className="text-xs text-muted-foreground">Montrer votre ville sur votre profil</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Statistiques publiques</Label>
                      <p className="text-xs text-muted-foreground">Afficher vos statistiques d'événements</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Visibilité des activités
                </CardTitle>
                <CardDescription>Contrôlez qui peut voir vos activités et participations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Événements créés</Label>
                      <p className="text-xs text-muted-foreground">Afficher les événements que vous organisez</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Participations aux événements</Label>
                      <p className="text-xs text-muted-foreground">Montrer les événements auxquels vous participez</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Cercles sociaux</Label>
                      <p className="text-xs text-muted-foreground">Afficher vos cercles publics</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Activité récente</Label>
                      <p className="text-xs text-muted-foreground">Montrer votre dernière activité</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact & Discovery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Contact et découverte
                </CardTitle>
                <CardDescription>Gérez comment les autres peuvent vous trouver et vous contacter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Recherche par email</Label>
                      <p className="text-xs text-muted-foreground">Permettre aux autres de vous trouver par email</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Messages directs</Label>
                      <p className="text-xs text-muted-foreground">Autoriser les messages de tous les utilisateurs</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Invitations aux cercles</Label>
                      <p className="text-xs text-muted-foreground">Recevoir des invitations à rejoindre des cercles</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Suggestions d'amis</Label>
                      <p className="text-xs text-muted-foreground">
                        Apparaître dans les suggestions d'autres utilisateurs
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Données et sécurité
                </CardTitle>
                <CardDescription>Contrôlez l'utilisation de vos données</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Données analytiques</Label>
                      <p className="text-xs text-muted-foreground">
                        Partager des données anonymes pour améliorer le service
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Recommandations personnalisées</Label>
                      <p className="text-xs text-muted-foreground">
                        Utiliser vos données pour des suggestions d'événements
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Cookies de performance</Label>
                      <p className="text-xs text-muted-foreground">Améliorer les performances du site</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Actions sensibles
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button variant="outline" className="bg-transparent">
                      <Lock className="h-4 w-4 mr-2" />
                      Changer le mot de passe
                    </Button>
                    <Button variant="outline" className="bg-transparent">
                      <Shield className="h-4 w-4 mr-2" />
                      Activer 2FA
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Changes */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" className="bg-transparent">
                Réinitialiser
              </Button>
              <Button>Enregistrer les modifications</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

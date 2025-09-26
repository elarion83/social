import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CreateEventForm } from "@/components/create-event-form"

export default async function CreateEventPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Créer un Événement</h1>
            <p className="text-muted-foreground">
              Partagez votre passion et créez des expériences mémorables pour votre communauté
            </p>
          </div>
          <CreateEventForm />
        </div>
      </div>
    </div>
  )
}

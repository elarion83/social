import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EditProfileForm } from "@/components/edit-profile-form"

export default async function EditProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Modifier mon profil</h1>
            <p className="text-muted-foreground">Personnalisez votre profil public</p>
          </div>
          <EditProfileForm profile={profile} />
        </div>
      </div>
    </div>
  )
}

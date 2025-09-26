import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { CreateCircleForm } from "@/components/circles/create-circle-form"

export default async function CreateCirclePage() {
  const cookieStore = cookies()
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Créer un nouveau cercle</h1>
        <p className="text-muted-foreground mt-2">Rassemblez vos proches autour d'événements qui vous ressemblent</p>
      </div>

      <CreateCircleForm />
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Sparkles,
  Home,
  Calendar,
  Users,
  Settings,
  LogOut,
  Plus,
  Music,
  Briefcase,
  Wrench,
  PartyPopper,
  Trophy,
  Network,
  MoreHorizontal,
  Map,
  Search,
  MessageCircle,
} from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const eventCategories = [
  { value: "concert", label: "Concerts", icon: Music, color: "text-purple-600" },
  { value: "conference", label: "Conférences", icon: Briefcase, color: "text-blue-600" },
  { value: "workshop", label: "Ateliers", icon: Wrench, color: "text-orange-600" },
  { value: "party", label: "Soirées", icon: PartyPopper, color: "text-pink-600" },
  { value: "sports", label: "Sports", icon: Trophy, color: "text-green-600" },
  { value: "networking", label: "Networking", icon: Network, color: "text-indigo-600" },
  { value: "other", label: "Autres", icon: MoreHorizontal, color: "text-gray-600" },
]

export function Navigation() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(profile)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        setProfile(profile)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  // Don't show navigation on auth pages
  if (pathname?.startsWith("/auth")) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <span className="brand-text highlight-text">What2Do</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Home className="h-4 w-4" />
              Accueil
            </Link>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    <Calendar className="h-4 w-4 mr-2" />
                    Événements
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4">
                      <div className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            href="/events"
                          >
                            <Search className="h-6 w-6 text-primary" />
                            <div className="mb-2 mt-4 text-lg font-medium">Trouvez Votre Bonheur</div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Des milliers d'expériences vous attendent
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {eventCategories.map((category) => {
                          const Icon = category.icon
                          return (
                            <NavigationMenuLink key={category.value} asChild>
                              <Link
                                href={`/events?category=${category.value}`}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className={`h-4 w-4 ${category.color}`} />
                                  <div className="text-sm font-medium leading-none">{category.label}</div>
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          )
                        })}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link
              href="/events/map"
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/events/map" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Map className="h-4 w-4" />
              Carte
            </Link>

            {user && (
              <>
                <Link
                  href="/circles"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                    pathname?.startsWith("/circles") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Mes Cercles
                </Link>

                <Link
                  href="/messages"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                    pathname?.startsWith("/messages") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <MessageCircle className="h-4 w-4" />
                  Messages
                </Link>

                <Link
                  href="/feed"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/feed" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Mes Découvertes
                </Link>

                <Link
                  href="/participant-dashboard"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                    pathname === "/participant-dashboard" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Mon Univers
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button asChild size="sm" className="accent-button">
                  <Link href="/create-event">
                    <Plus className="h-4 w-4 mr-2" />
                    Lancer Mon Événement
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                      onClick={() => console.log("[v0] Avatar button clicked")}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {profile?.full_name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase() || user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56"
                    align="end"
                    forceMount
                    onOpenChange={(open) => console.log("[v0] Dropdown menu open state:", open)}
                  >
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{profile?.full_name || "Utilisateur"}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Mon Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        Mes Événements
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/circles" className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        Mes Cercles
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/messages" className="cursor-pointer">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Messages
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Mon Compte
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Quitter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost">
                  <Link href="/auth/login">Connexion</Link>
                </Button>
                <Button asChild className="accent-button">
                  <Link href="/auth/sign-up">Rejoindre Gratuitement</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

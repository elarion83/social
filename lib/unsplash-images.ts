export const getEventImage = (category?: string, seed?: string) => {
  const baseUrl = "https://images.unsplash.com"
  const size = "800x600"

  const categoryKeywords = {
    concert: "concert,music,stage,performance",
    conference: "conference,presentation,business,meeting",
    workshop: "workshop,learning,hands-on,creative",
    party: "party,celebration,nightlife,fun",
    sports: "sports,fitness,competition,athletic",
    networking: "networking,business,professional,meeting",
    other: "event,gathering,people,social",
  }

  const keywords = categoryKeywords[category as keyof typeof categoryKeywords] || categoryKeywords.other
  const seedParam = seed ? `&sig=${seed}` : ""

  return `${baseUrl}/${size}/?${keywords}${seedParam}`
}

export const getAvatarImage = (seed?: string) => {
  const seedParam = seed ? `&sig=${seed}` : ""
  return `https://images.unsplash.com/400x400/?face,portrait,person${seedParam}`
}

export const getDefaultEventImage = () => {
  return "https://images.unsplash.com/800x600/?event,gathering,people,social"
}

export const getDefaultAvatarImage = () => {
  return "https://images.unsplash.com/400x400/?face,portrait,person"
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Plus, Trash2, LinkIcon, ImageIcon, Video } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface EventDay {
  id: string
  date: string
  startTime: string
  endTime: string
  title: string
  description: string
}

interface EventSession {
  id: string
  dayId: string
  title: string
  description: string
  startTime: string
  endTime: string
  speakerName: string
  speakerBio: string
  sessionType: string
  maxAttendees: string
}

interface EventLocation {
  id: string
  type: "start" | "end" | "main" | "additional"
  venueName: string
  address: string
  city: string
  country: string
  description: string
}

interface EventMedia {
  id: string
  type: "image" | "video" | "audio"
  url: string
  title: string
  description: string
  isPrimary: boolean
}

interface EventLink {
  id: string
  title: string
  url: string
  description: string
  type: string
}

export function MultiDayEventForm() {
  const [eventDays, setEventDays] = useState<EventDay[]>([
    {
      id: "1",
      date: "",
      startTime: "",
      endTime: "",
      title: "",
      description: "",
    },
  ])

  const [eventSessions, setEventSessions] = useState<EventSession[]>([])
  const [eventLocations, setEventLocations] = useState<EventLocation[]>([
    {
      id: "1",
      type: "main",
      venueName: "",
      address: "",
      city: "",
      country: "",
      description: "",
    },
  ])
  const [eventMedia, setEventMedia] = useState<EventMedia[]>([])
  const [eventLinks, setEventLinks] = useState<EventLink[]>([])

  const addEventDay = () => {
    const newDay: EventDay = {
      id: Date.now().toString(),
      date: "",
      startTime: "",
      endTime: "",
      title: "",
      description: "",
    }
    setEventDays([...eventDays, newDay])
  }

  const removeEventDay = (id: string) => {
    setEventDays(eventDays.filter((day) => day.id !== id))
    // Supprimer aussi les sessions liées à ce jour
    setEventSessions(eventSessions.filter((session) => session.dayId !== id))
  }

  const updateEventDay = (id: string, field: keyof EventDay, value: string) => {
    setEventDays(eventDays.map((day) => (day.id === id ? { ...day, [field]: value } : day)))
  }

  const addSession = (dayId: string) => {
    const newSession: EventSession = {
      id: Date.now().toString(),
      dayId,
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      speakerName: "",
      speakerBio: "",
      sessionType: "presentation",
      maxAttendees: "",
    }
    setEventSessions([...eventSessions, newSession])
  }

  const removeSession = (id: string) => {
    setEventSessions(eventSessions.filter((session) => session.id !== id))
  }

  const updateSession = (id: string, field: keyof EventSession, value: string) => {
    setEventSessions(eventSessions.map((session) => (session.id === id ? { ...session, [field]: value } : session)))
  }

  const addLocation = (type: EventLocation["type"]) => {
    const newLocation: EventLocation = {
      id: Date.now().toString(),
      type,
      venueName: "",
      address: "",
      city: "",
      country: "",
      description: "",
    }
    setEventLocations([...eventLocations, newLocation])
  }

  const removeLocation = (id: string) => {
    setEventLocations(eventLocations.filter((location) => location.id !== id))
  }

  const updateLocation = (id: string, field: keyof EventLocation, value: string) => {
    setEventLocations(
      eventLocations.map((location) => (location.id === id ? { ...location, [field]: value } : location)),
    )
  }

  const addMedia = (type: EventMedia["type"]) => {
    const newMedia: EventMedia = {
      id: Date.now().toString(),
      type,
      url: "",
      title: "",
      description: "",
      isPrimary: eventMedia.length === 0,
    }
    setEventMedia([...eventMedia, newMedia])
  }

  const removeMedia = (id: string) => {
    setEventMedia(eventMedia.filter((media) => media.id !== id))
  }

  const updateMedia = (id: string, field: keyof EventMedia, value: string | boolean) => {
    setEventMedia(eventMedia.map((media) => (media.id === id ? { ...media, [field]: value } : media)))
  }

  const addLink = () => {
    const newLink: EventLink = {
      id: Date.now().toString(),
      title: "",
      url: "",
      description: "",
      type: "website",
    }
    setEventLinks([...eventLinks, newLink])
  }

  const removeLink = (id: string) => {
    setEventLinks(eventLinks.filter((link) => link.id !== id))
  }

  const updateLink = (id: string, field: keyof EventLink, value: string) => {
    setEventLinks(eventLinks.map((link) => (link.id === id ? { ...link, [field]: value } : link)))
  }

  return (
    <div className="space-y-8">
      {/* Jours d'événement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Jours d'événement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {eventDays.map((day, index) => (
            <div key={day.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Jour {index + 1}</h4>
                {eventDays.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeEventDay(day.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={day.date}
                    onChange={(e) => updateEventDay(day.id, "date", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heure de début</Label>
                  <Input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => updateEventDay(day.id, "startTime", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heure de fin</Label>
                  <Input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => updateEventDay(day.id, "endTime", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Titre du jour (optionnel)</Label>
                <Input
                  placeholder="Ex: Jour d'ouverture, Conférences principales..."
                  value={day.title}
                  onChange={(e) => updateEventDay(day.id, "title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Description du jour (optionnel)</Label>
                <Textarea
                  placeholder="Description spécifique pour ce jour..."
                  value={day.description}
                  onChange={(e) => updateEventDay(day.id, "description", e.target.value)}
                />
              </div>

              {/* Sessions pour ce jour */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">Programmation</h5>
                  <Button type="button" variant="outline" size="sm" onClick={() => addSession(day.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une session
                  </Button>
                </div>

                {eventSessions
                  .filter((session) => session.dayId === day.id)
                  .map((session) => (
                    <div key={session.id} className="p-3 bg-muted/50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{session.sessionType}</Badge>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeSession(session.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Titre de la session</Label>
                          <Input
                            placeholder="Ex: Conférence d'ouverture"
                            value={session.title}
                            onChange={(e) => updateSession(session.id, "title", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={session.sessionType}
                            onValueChange={(value) => updateSession(session.id, "sessionType", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="presentation">Présentation</SelectItem>
                              <SelectItem value="workshop">Atelier</SelectItem>
                              <SelectItem value="performance">Performance</SelectItem>
                              <SelectItem value="networking">Networking</SelectItem>
                              <SelectItem value="break">Pause</SelectItem>
                              <SelectItem value="meal">Repas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Heure de début</Label>
                          <Input
                            type="time"
                            value={session.startTime}
                            onChange={(e) => updateSession(session.id, "startTime", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Heure de fin</Label>
                          <Input
                            type="time"
                            value={session.endTime}
                            onChange={(e) => updateSession(session.id, "endTime", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Intervenant</Label>
                          <Input
                            placeholder="Nom de l'intervenant"
                            value={session.speakerName}
                            onChange={(e) => updateSession(session.id, "speakerName", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Limite participants</Label>
                          <Input
                            type="number"
                            placeholder="Optionnel"
                            value={session.maxAttendees}
                            onChange={(e) => updateSession(session.id, "maxAttendees", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="Description de la session..."
                          value={session.description}
                          onChange={(e) => updateSession(session.id, "description", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addEventDay}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un jour
          </Button>
        </CardContent>
      </Card>

      {/* Lieux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Lieux
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {eventLocations.map((location) => (
            <div key={location.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant={location.type === "main" ? "default" : "outline"}>
                  {location.type === "main" && "Lieu principal"}
                  {location.type === "start" && "Lieu de départ"}
                  {location.type === "end" && "Lieu d'arrivée"}
                  {location.type === "additional" && "Lieu supplémentaire"}
                </Badge>
                {location.type !== "main" && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeLocation(location.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom du lieu</Label>
                  <Input
                    placeholder="Ex: Palais des Congrès"
                    value={location.venueName}
                    onChange={(e) => updateLocation(location.id, "venueName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input
                    placeholder="Adresse complète"
                    value={location.address}
                    onChange={(e) => updateLocation(location.id, "address", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input
                    placeholder="Paris"
                    value={location.city}
                    onChange={(e) => updateLocation(location.id, "city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pays</Label>
                  <Input
                    placeholder="France"
                    value={location.country}
                    onChange={(e) => updateLocation(location.id, "country", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description du lieu</Label>
                <Textarea
                  placeholder="Informations complémentaires sur le lieu..."
                  value={location.description}
                  onChange={(e) => updateLocation(location.id, "description", e.target.value)}
                />
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => addLocation("start")}>
              <Plus className="h-4 w-4 mr-2" />
              Lieu de départ
            </Button>
            <Button type="button" variant="outline" onClick={() => addLocation("end")}>
              <Plus className="h-4 w-4 mr-2" />
              Lieu d'arrivée
            </Button>
            <Button type="button" variant="outline" onClick={() => addLocation("additional")}>
              <Plus className="h-4 w-4 mr-2" />
              Lieu supplémentaire
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Médias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Images et Vidéos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {eventMedia.map((media) => (
            <div key={media.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {media.type === "image" && <ImageIcon className="h-3 w-3 mr-1" />}
                    {media.type === "video" && <Video className="h-3 w-3 mr-1" />}
                    {media.type}
                  </Badge>
                  {media.isPrimary && <Badge>Principal</Badge>}
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeMedia(media.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={media.url}
                    onChange={(e) => updateMedia(media.id, "url", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input
                    placeholder="Titre du média"
                    value={media.title}
                    onChange={(e) => updateMedia(media.id, "title", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Description du média..."
                  value={media.description}
                  onChange={(e) => updateMedia(media.id, "description", e.target.value)}
                />
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => addMedia("image")}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Ajouter une image
            </Button>
            <Button type="button" variant="outline" onClick={() => addMedia("video")}>
              <Video className="h-4 w-4 mr-2" />
              Ajouter une vidéo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liens complémentaires */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Liens complémentaires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {eventLinks.map((link) => (
            <div key={link.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{link.type}</Badge>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeLink(link.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titre</Label>
                  <Input
                    placeholder="Ex: Site officiel"
                    value={link.title}
                    onChange={(e) => updateLink(link.id, "title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={link.type} onValueChange={(value) => updateLink(link.id, "type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Site web</SelectItem>
                      <SelectItem value="social">Réseau social</SelectItem>
                      <SelectItem value="booking">Réservation</SelectItem>
                      <SelectItem value="streaming">Streaming</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  placeholder="https://example.com"
                  value={link.url}
                  onChange={(e) => updateLink(link.id, "url", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Description du lien..."
                  value={link.description}
                  onChange={(e) => updateLink(link.id, "description", e.target.value)}
                />
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addLink}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un lien
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

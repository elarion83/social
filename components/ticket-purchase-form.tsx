"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Minus, Plus, CreditCard, Ticket } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TicketType {
  id: string
  name: string
  description: string | null
  price: number
  quantity_available: number
  quantity_sold: number
}

interface TicketPurchaseFormProps {
  eventId: string
  ticketTypes: TicketType[]
  userId: string
}

export function TicketPurchaseForm({ eventId, ticketTypes, userId }: TicketPurchaseFormProps) {
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({})
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  const updateTicketQuantity = (ticketTypeId: string, quantity: number) => {
    if (quantity <= 0) {
      const newSelected = { ...selectedTickets }
      delete newSelected[ticketTypeId]
      setSelectedTickets(newSelected)
    } else {
      setSelectedTickets((prev) => ({
        ...prev,
        [ticketTypeId]: quantity,
      }))
    }
  }

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketTypeId, quantity]) => {
      const ticketType = ticketTypes.find((t) => t.id === ticketTypeId)
      return total + (ticketType?.price || 0) * quantity
    }, 0)
  }

  const getTotalQuantity = () => {
    return Object.values(selectedTickets).reduce((total, quantity) => total + quantity, 0)
  }

  const handlePurchase = async () => {
    if (Object.keys(selectedTickets).length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un billet.",
        variant: "destructive",
      })
      return
    }

    if (!paymentMethod) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un moyen de paiement.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Create purchases for each ticket type
      for (const [ticketTypeId, quantity] of Object.entries(selectedTickets)) {
        const ticketType = ticketTypes.find((t) => t.id === ticketTypeId)
        if (!ticketType) continue

        const totalPrice = ticketType.price * quantity

        // Create purchase record
        const { data: purchase, error: purchaseError } = await supabase
          .from("ticket_purchases")
          .insert({
            user_id: userId,
            event_id: eventId,
            ticket_type_id: ticketTypeId,
            quantity,
            unit_price: ticketType.price,
            total_price: totalPrice,
            status: "confirmed", // In real app, this would be 'pending' until payment
            payment_method: paymentMethod,
            payment_reference: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          })
          .select()
          .single()

        if (purchaseError) throw purchaseError

        // Create individual tickets
        const tickets = Array.from({ length: quantity }, (_, index) => ({
          purchase_id: purchase.id,
          ticket_code: `${eventId.slice(0, 8).toUpperCase()}-${Date.now()}-${index + 1}`,
          qr_code_data: JSON.stringify({
            eventId,
            purchaseId: purchase.id,
            ticketCode: `${eventId.slice(0, 8).toUpperCase()}-${Date.now()}-${index + 1}`,
          }),
        }))

        const { error: ticketsError } = await supabase.from("tickets").insert(tickets)

        if (ticketsError) throw ticketsError

        // Update ticket type sold quantity
        const { error: updateError } = await supabase
          .from("ticket_types")
          .update({
            quantity_sold: ticketType.quantity_sold + quantity,
          })
          .eq("id", ticketTypeId)

        if (updateError) throw updateError
      }

      toast({
        title: "Achat confirmé !",
        description: "Vos billets ont été achetés avec succès.",
      })

      router.push("/profile/tickets")
    } catch (error) {
      console.error("Purchase error:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'achat. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Ticket Types */}
      <div className="space-y-4">
        {ticketTypes.map((ticketType) => {
          const availableQuantity = ticketType.quantity_available - ticketType.quantity_sold
          const selectedQuantity = selectedTickets[ticketType.id] || 0

          return (
            <Card key={ticketType.id} className="relative">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{ticketType.name}</h3>
                      <Badge variant={availableQuantity > 0 ? "secondary" : "destructive"}>
                        {availableQuantity > 0 ? `${availableQuantity} disponibles` : "Épuisé"}
                      </Badge>
                    </div>
                    {ticketType.description && (
                      <p className="text-muted-foreground text-sm mb-3">{ticketType.description}</p>
                    )}
                    <div className="text-2xl font-bold text-primary">
                      {ticketType.price === 0 ? "Gratuit" : `${ticketType.price.toFixed(2)} €`}
                    </div>
                  </div>

                  {availableQuantity > 0 && (
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateTicketQuantity(ticketType.id, selectedQuantity - 1)}
                        disabled={selectedQuantity <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{selectedQuantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateTicketQuantity(ticketType.id, selectedQuantity + 1)}
                        disabled={selectedQuantity >= Math.min(availableQuantity, 10)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Order Summary */}
      {Object.keys(selectedTickets).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Récapitulatif de commande
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => {
              const ticketType = ticketTypes.find((t) => t.id === ticketTypeId)
              if (!ticketType) return null

              return (
                <div key={ticketTypeId} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{ticketType.name}</span>
                    <span className="text-muted-foreground ml-2">× {quantity}</span>
                  </div>
                  <span className="font-medium">{(ticketType.price * quantity).toFixed(2)} €</span>
                </div>
              )
            })}

            <Separator />

            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total ({getTotalQuantity()} billets)</span>
              <span>{getTotalPrice().toFixed(2)} €</span>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="payment-method">Moyen de paiement</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un moyen de paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Carte bancaire
                    </div>
                  </SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="apple-pay">Apple Pay</SelectItem>
                  <SelectItem value="google-pay">Google Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handlePurchase} disabled={isProcessing} className="w-full" size="lg">
              {isProcessing ? "Traitement..." : `Acheter pour ${getTotalPrice().toFixed(2)} €`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

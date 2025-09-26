-- Create ticketing system tables
CREATE TABLE IF NOT EXISTS ticket_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity_available INTEGER NOT NULL DEFAULT 0,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  sale_start_date TIMESTAMPTZ,
  sale_end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  ticket_type_id UUID REFERENCES ticket_types(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID REFERENCES ticket_purchases(id) ON DELETE CASCADE,
  ticket_code VARCHAR(50) UNIQUE NOT NULL,
  qr_code_data TEXT,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ticket_types
CREATE POLICY "Anyone can view ticket types" ON ticket_types FOR SELECT USING (true);
CREATE POLICY "Event organizers can manage ticket types" ON ticket_types FOR ALL USING (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = ticket_types.event_id 
    AND events.organizer_id = auth.uid()
  )
);

-- RLS Policies for ticket_purchases
CREATE POLICY "Users can view their own purchases" ON ticket_purchases FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create purchases" ON ticket_purchases FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Event organizers can view purchases for their events" ON ticket_purchases FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = ticket_purchases.event_id 
    AND events.organizer_id = auth.uid()
  )
);

-- RLS Policies for tickets
CREATE POLICY "Users can view their own tickets" ON tickets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM ticket_purchases 
    WHERE ticket_purchases.id = tickets.purchase_id 
    AND ticket_purchases.user_id = auth.uid()
  )
);
CREATE POLICY "Event organizers can view tickets for their events" ON tickets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM ticket_purchases tp
    JOIN events e ON e.id = tp.event_id
    WHERE tp.id = tickets.purchase_id 
    AND e.organizer_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_ticket_types_event_id ON ticket_types(event_id);
CREATE INDEX idx_ticket_purchases_user_id ON ticket_purchases(user_id);
CREATE INDEX idx_ticket_purchases_event_id ON ticket_purchases(event_id);
CREATE INDEX idx_tickets_purchase_id ON tickets(purchase_id);
CREATE INDEX idx_tickets_ticket_code ON tickets(ticket_code);

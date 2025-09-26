-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('concert', 'conference', 'workshop', 'party', 'sports', 'networking', 'other')),
  type TEXT NOT NULL CHECK (type IN ('public', 'private', 'invite_only')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  
  -- Location details
  venue_name TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Date and time
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT DEFAULT 'UTC',
  
  -- Capacity and pricing
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  price DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  
  -- Organizer
  organizer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Metadata
  tags TEXT[],
  external_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create policies for events
CREATE POLICY "events_select_public" ON public.events 
  FOR SELECT USING (type = 'public' AND status = 'published');

CREATE POLICY "events_select_own" ON public.events 
  FOR SELECT USING (auth.uid() = organizer_id);

CREATE POLICY "events_insert_own" ON public.events 
  FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "events_update_own" ON public.events 
  FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "events_delete_own" ON public.events 
  FOR DELETE USING (auth.uid() = organizer_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS events_organizer_id_idx ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS events_start_date_idx ON public.events(start_date);
CREATE INDEX IF NOT EXISTS events_category_idx ON public.events(category);
CREATE INDEX IF NOT EXISTS events_location_idx ON public.events(city, country);

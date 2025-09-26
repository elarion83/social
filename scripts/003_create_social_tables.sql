-- Create event attendees table
CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'interested', 'not_going')),
  ticket_type TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- Create policies for event attendees
CREATE POLICY "attendees_select_own" ON public.event_attendees 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "attendees_select_event_organizer" ON public.event_attendees 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_attendees.event_id 
      AND events.organizer_id = auth.uid()
    )
  );

CREATE POLICY "attendees_insert_own" ON public.event_attendees 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "attendees_update_own" ON public.event_attendees 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "attendees_delete_own" ON public.event_attendees 
  FOR DELETE USING (auth.uid() = user_id);

-- Create follows table for social features
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Create policies for follows
CREATE POLICY "follows_select_own" ON public.follows 
  FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "follows_insert_own" ON public.follows 
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "follows_delete_own" ON public.follows 
  FOR DELETE USING (auth.uid() = follower_id);

-- Create event comments table
CREATE TABLE IF NOT EXISTS public.event_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.event_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.event_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "comments_select_public" ON public.event_comments 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE events.id = event_comments.event_id 
      AND (events.type = 'public' OR events.organizer_id = auth.uid())
    )
  );

CREATE POLICY "comments_insert_own" ON public.event_comments 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments_update_own" ON public.event_comments 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "comments_delete_own" ON public.event_comments 
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS event_attendees_event_id_idx ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS event_attendees_user_id_idx ON public.event_attendees(user_id);
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS event_comments_event_id_idx ON public.event_comments(event_id);
CREATE INDEX IF NOT EXISTS event_comments_user_id_idx ON public.event_comments(user_id);

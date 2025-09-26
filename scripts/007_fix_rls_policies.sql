-- Fix RLS policies for events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow users to view published events
CREATE POLICY "events_select_published" ON events 
FOR SELECT USING (status = 'published');

-- Allow users to view their own events (any status)
CREATE POLICY "events_select_own" ON events 
FOR SELECT USING (auth.uid() = organizer_id);

-- Allow authenticated users to create events
CREATE POLICY "events_insert_own" ON events 
FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- Allow users to update their own events
CREATE POLICY "events_update_own" ON events 
FOR UPDATE USING (auth.uid() = organizer_id);

-- Allow users to delete their own events
CREATE POLICY "events_delete_own" ON events 
FOR DELETE USING (auth.uid() = organizer_id);

-- Fix RLS policies for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view all profiles (for social features)
CREATE POLICY "profiles_select_all" ON profiles 
FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "profiles_insert_own" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own" ON profiles 
FOR UPDATE USING (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "profiles_delete_own" ON profiles 
FOR DELETE USING (auth.uid() = id);

-- Fix RLS policies for event_attendees table
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Allow users to view attendees of events they organize
CREATE POLICY "event_attendees_select_organizer" ON event_attendees 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_attendees.event_id 
    AND events.organizer_id = auth.uid()
  )
);

-- Allow users to view their own attendance
CREATE POLICY "event_attendees_select_own" ON event_attendees 
FOR SELECT USING (auth.uid() = user_id);

-- Allow users to register for events
CREATE POLICY "event_attendees_insert_own" ON event_attendees 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own attendance
CREATE POLICY "event_attendees_update_own" ON event_attendees 
FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to cancel their own attendance
CREATE POLICY "event_attendees_delete_own" ON event_attendees 
FOR DELETE USING (auth.uid() = user_id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Create trigger for auto-profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Adding circles/groups system for private events
-- Create circles table for private event groups
CREATE TABLE IF NOT EXISTS circles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT true,
  invite_code VARCHAR(20) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create circle members table
CREATE TABLE IF NOT EXISTS circle_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(circle_id, user_id)
);

-- Add circle_id to events table for private events
ALTER TABLE events ADD COLUMN IF NOT EXISTS circle_id UUID REFERENCES circles(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'circle', 'private'));

-- Enable RLS
ALTER TABLE circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for circles
CREATE POLICY "Users can view circles they belong to" ON circles
  FOR SELECT USING (
    auth.uid() = creator_id OR 
    EXISTS (
      SELECT 1 FROM circle_members 
      WHERE circle_id = circles.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create circles" ON circles
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Circle creators can update their circles" ON circles
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Circle creators can delete their circles" ON circles
  FOR DELETE USING (auth.uid() = creator_id);

-- RLS Policies for circle_members
CREATE POLICY "Users can view circle memberships" ON circle_members
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM circles 
      WHERE id = circle_id AND creator_id = auth.uid()
    )
  );

CREATE POLICY "Circle admins can manage members" ON circle_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM circles 
      WHERE id = circle_id AND creator_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM circle_members cm
      WHERE cm.circle_id = circle_members.circle_id 
      AND cm.user_id = auth.uid() 
      AND cm.role = 'admin'
    )
  );

-- Update events RLS to handle circle visibility
DROP POLICY IF EXISTS "Anyone can view public events" ON events;
CREATE POLICY "Users can view appropriate events" ON events
  FOR SELECT USING (
    visibility = 'public' OR
    (visibility = 'circle' AND (
      circle_id IS NULL OR
      EXISTS (
        SELECT 1 FROM circle_members 
        WHERE circle_id = events.circle_id AND user_id = auth.uid()
      )
    )) OR
    (visibility = 'private' AND creator_id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_circles_creator ON circles(creator_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_circle ON circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_user ON circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_events_circle ON events(circle_id);
CREATE INDEX IF NOT EXISTS idx_events_visibility ON events(visibility);

-- Function to generate invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invite codes
CREATE OR REPLACE FUNCTION set_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invite_code
  BEFORE INSERT ON circles
  FOR EACH ROW
  EXECUTE FUNCTION set_invite_code();

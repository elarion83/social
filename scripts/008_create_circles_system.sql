-- Create circles table
CREATE TABLE IF NOT EXISTS circles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create circle_members table
CREATE TABLE IF NOT EXISTS circle_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID REFERENCES circles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(circle_id, user_id)
);

-- Add circle_id to events table for circle-specific events
ALTER TABLE events ADD COLUMN IF NOT EXISTS circle_id UUID REFERENCES circles(id) ON DELETE SET NULL;
ALTER TABLE events ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'circle', 'private'));

-- Create RLS policies for circles
ALTER TABLE circles ENABLE ROW LEVEL SECURITY;

-- Users can see public circles and circles they're members of
CREATE POLICY "Users can view circles they have access to" ON circles
  FOR SELECT USING (
    NOT is_private OR 
    creator_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM circle_members 
      WHERE circle_id = circles.id AND user_id = auth.uid()
    )
  );

-- Users can create circles
CREATE POLICY "Users can create circles" ON circles
  FOR INSERT WITH CHECK (creator_id = auth.uid());

-- Only creators can update their circles
CREATE POLICY "Creators can update their circles" ON circles
  FOR UPDATE USING (creator_id = auth.uid());

-- Only creators can delete their circles
CREATE POLICY "Creators can delete their circles" ON circles
  FOR DELETE USING (creator_id = auth.uid());

-- Create RLS policies for circle_members
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;

-- Users can see members of circles they belong to
CREATE POLICY "Users can view circle members" ON circle_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM circles 
      WHERE id = circle_id AND (
        NOT is_private OR 
        creator_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM circle_members cm2 
          WHERE cm2.circle_id = circle_id AND cm2.user_id = auth.uid()
        )
      )
    )
  );

-- Circle creators and admins can add members
CREATE POLICY "Circle admins can manage members" ON circle_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM circles 
      WHERE id = circle_id AND creator_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM circle_members 
      WHERE circle_id = circle_members.circle_id AND user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Users can leave circles (delete their own membership)
CREATE POLICY "Users can leave circles" ON circle_members
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM circles 
      WHERE id = circle_id AND creator_id = auth.uid()
    )
  );

-- Update events RLS to respect circle visibility
DROP POLICY IF EXISTS "Users can view events" ON events;
CREATE POLICY "Users can view events based on visibility" ON events
  FOR SELECT USING (
    visibility = 'public' OR
    creator_id = auth.uid() OR
    (visibility = 'circle' AND circle_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM circle_members 
      WHERE circle_id = events.circle_id AND user_id = auth.uid()
    )) OR
    (visibility = 'private' AND creator_id = auth.uid())
  );

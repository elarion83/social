-- Création du système d'événements avancés avec multi-jours, programmation et médias

-- Table pour les jours d'événements (événements multi-jours)
CREATE TABLE IF NOT EXISTS event_days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  day_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  title VARCHAR(255), -- Titre spécifique pour ce jour (optionnel)
  description TEXT, -- Description spécifique pour ce jour (optionnel)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour la programmation détaillée (sessions/activités)
CREATE TABLE IF NOT EXISTS event_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  event_day_id UUID REFERENCES event_days(id) ON DELETE CASCADE, -- Lié à un jour spécifique
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  speaker_name VARCHAR(255), -- Nom de l'intervenant/artiste
  speaker_bio TEXT, -- Bio de l'intervenant
  location_details TEXT, -- Détails spécifiques du lieu pour cette session
  session_type VARCHAR(50) DEFAULT 'presentation', -- presentation, workshop, performance, break, etc.
  max_attendees INTEGER, -- Limite spécifique pour cette session
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les lieux multiples (début et fin)
CREATE TABLE IF NOT EXISTS event_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  location_type VARCHAR(20) NOT NULL CHECK (location_type IN ('start', 'end', 'main', 'additional')),
  venue_name VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT, -- Description du lieu
  contact_info TEXT, -- Infos de contact pour ce lieu
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les médias multiples (images, vidéos)
CREATE TABLE IF NOT EXISTS event_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video', 'audio')),
  url TEXT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  is_primary BOOLEAN DEFAULT FALSE, -- Image/vidéo principale
  display_order INTEGER DEFAULT 0, -- Ordre d'affichage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les liens complémentaires
CREATE TABLE IF NOT EXISTS event_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  link_type VARCHAR(50) DEFAULT 'website', -- website, social, booking, streaming, etc.
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_event_days_event_id ON event_days(event_id);
CREATE INDEX IF NOT EXISTS idx_event_days_date ON event_days(day_date);
CREATE INDEX IF NOT EXISTS idx_event_sessions_event_id ON event_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_event_sessions_day_id ON event_sessions(event_day_id);
CREATE INDEX IF NOT EXISTS idx_event_locations_event_id ON event_locations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_media_event_id ON event_media(event_id);
CREATE INDEX IF NOT EXISTS idx_event_links_event_id ON event_links(event_id);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_days_updated_at BEFORE UPDATE ON event_days FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_event_sessions_updated_at BEFORE UPDATE ON event_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

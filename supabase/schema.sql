-- Outpost - Supabase SQL Setup Script
-- Run this in: Supabase → SQL Editor

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  points INTEGER DEFAULT 0 NOT NULL
);

-- Spots (Core location data from Google Places)
CREATE TABLE spots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  google_place_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  place_type TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_spots_google_place_id ON spots(google_place_id);
CREATE INDEX idx_spots_location ON spots USING GIST (
  ST_Point(longitude, latitude)
);

-- Spot Metadata (Larp-specific data)
CREATE TABLE spot_metadata (
  spot_id UUID PRIMARY KEY REFERENCES spots(id) ON DELETE CASCADE,
  wifi_rating INTEGER DEFAULT 0 CHECK (wifi_rating >= 0 AND wifi_rating <= 5),
  noise_rating INTEGER DEFAULT 0 CHECK (noise_rating >= 0 AND noise_rating <= 5),
  outlet_rating INTEGER DEFAULT 0 CHECK (outlet_rating >= 0 AND outlet_rating <= 5),
  seat_rating INTEGER DEFAULT 0 CHECK (seat_rating >= 0 AND seat_rating <= 5),
  laptop_friendliness INTEGER DEFAULT 0 CHECK (laptop_friendliness >= 0 AND laptop_friendliness <= 5),
  recommended_stay_minutes INTEGER DEFAULT 60,
  larp_score INTEGER DEFAULT 0 CHECK (larp_score >= 0 AND larp_score <= 100),
  review_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  wifi_rating INTEGER DEFAULT 3 CHECK (wifi_rating >= 1 AND wifi_rating <= 5),
  noise_rating INTEGER DEFAULT 3 CHECK (noise_rating >= 1 AND noise_rating <= 5),
  outlet_rating INTEGER DEFAULT 3 CHECK (outlet_rating >= 1 AND outlet_rating <= 5),
  seat_rating INTEGER DEFAULT 3 CHECK (seat_rating >= 1 AND seat_rating <= 5),
  laptop_friendliness INTEGER DEFAULT 3 CHECK (laptop_friendliness >= 1 AND laptop_friendliness <= 5),
  stay_minutes INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(spot_id, user_id)
);

CREATE INDEX idx_reviews_spot_id ON reviews(spot_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- Review Helpful Votes
CREATE TABLE review_helpful_votes (
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (review_id, user_id)
);

-- Spot Photos
CREATE TABLE spot_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_spot_photos_spot_id ON spot_photos(spot_id);

-- Favorites
CREATE TABLE favorites (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, spot_id)
);

-- Check-ins
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  points_earned INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX idx_check_ins_spot_id ON check_ins(spot_id);
CREATE INDEX idx_check_ins_created_at ON check_ins(created_at DESC);

-- Point Transactions
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('checkin', 'first_visit', 'new_location', 'review', 'photo', 'helpful_review', 'streak_bonus')),
  points INTEGER NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_point_transactions_user_id ON point_transactions(user_id);

-- Badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement TEXT NOT NULL,
  points INTEGER DEFAULT 0 NOT NULL
);

-- User Badges
CREATE TABLE user_badges (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, badge_id)
);

-- Streaks
CREATE TABLE streaks (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  last_checkin_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Reports (for moderation)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('review', 'photo', 'spot')),
  content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMPTZ
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update spot metadata when a review is added
CREATE OR REPLACE FUNCTION update_spot_metadata()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO spot_metadata (spot_id, wifi_rating, noise_rating, outlet_rating, seat_rating, laptop_friendliness, review_count, larp_score, updated_at)
  SELECT
    NEW.spot_id,
    ROUND(AVG(wifi_rating))::INTEGER,
    ROUND(AVG(noise_rating))::INTEGER,
    ROUND(AVG(outlet_rating))::INTEGER,
    ROUND(AVG(seat_rating))::INTEGER,
    ROUND(AVG(laptop_friendliness))::INTEGER,
    COUNT(*)::INTEGER,
    CASE
      WHEN COUNT(*) < 3 THEN 0
      ELSE ROUND(
        (AVG(wifi_rating) / 5.0 * 25) +
        ((6 - AVG(noise_rating)) / 5.0 * 20) +
        (AVG(outlet_rating) / 5.0 * 15) +
        (AVG(laptop_friendliness) / 5.0 * 20) +
        (AVG(seat_rating) / 5.0 * 10) +
        (LEAST(COUNT(*)::FLOAT / 20, 1) * 10)
      )::INTEGER
    END,
    NOW()
  FROM reviews
  WHERE spot_id = NEW.spot_id
  GROUP BY NEW.spot_id
  ON CONFLICT (spot_id) DO UPDATE SET
    wifi_rating = EXCLUDED.wifi_rating,
    noise_rating = EXCLUDED.noise_rating,
    outlet_rating = EXCLUDED.outlet_rating,
    seat_rating = EXCLUDED.seat_rating,
    laptop_friendliness = EXCLUDED.laptop_friendliness,
    review_count = EXCLUDED.review_count,
    larp_score = EXCLUDED.larp_score,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_spot_metadata();

-- Function to perform check-in with anti-abuse
CREATE OR REPLACE FUNCTION perform_checkin(
  p_user_id UUID,
  p_spot_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_last_checkin TIMESTAMPTZ;
  v_same_spot_last TIMESTAMPTZ;
  v_points INTEGER := 25;
  v_is_first_visit BOOLEAN;
  v_is_new_location BOOLEAN;
  v_checkin_id UUID;
  v_city TEXT;
  v_result JSONB;
BEGIN
  -- Cooldown: 5 minutes between any check-ins
  SELECT created_at INTO v_last_checkin
  FROM check_ins
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_last_checkin IS NOT NULL AND v_last_checkin > NOW() - INTERVAL '5 minutes' THEN
    RETURN jsonb_build_object(
      'success', false,
      'points_earned', 0,
      'error', 'Please wait before checking in again'
    );
  END IF;

  -- Same spot cooldown: 1 hour
  SELECT created_at INTO v_same_spot_last
  FROM check_ins
  WHERE user_id = p_user_id AND spot_id = p_spot_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_same_spot_last IS NOT NULL AND v_same_spot_last > NOW() - INTERVAL '1 hour' THEN
    RETURN jsonb_build_object(
      'success', false,
      'points_earned', 0,
      'error', 'You already checked in here recently'
    );
  END IF;

  -- Check if first visit to this spot
  SELECT NOT EXISTS(
    SELECT 1 FROM check_ins WHERE user_id = p_user_id AND spot_id = p_spot_id
  ) INTO v_is_first_visit;

  -- Check if new location (city)
  SELECT city INTO v_city FROM spots WHERE id = p_spot_id;
  SELECT NOT EXISTS(
    SELECT 1 FROM check_ins ci
    JOIN spots s ON ci.spot_id = s.id
    WHERE ci.user_id = p_user_id AND s.city = v_city
  ) INTO v_is_new_location;

  -- Calculate points
  IF v_is_first_visit THEN
    v_points := v_points + 50;
  END IF;

  IF v_is_new_location THEN
    v_points := v_points + 100;
  END IF;

  -- Create check-in
  INSERT INTO check_ins (user_id, spot_id, points_earned)
  VALUES (p_user_id, p_spot_id, v_points)
  RETURNING id INTO v_checkin_id;

  -- Record point transaction
  INSERT INTO point_transactions (user_id, type, points, reference_id, reference_type)
  VALUES (p_user_id, 'checkin', v_points, p_spot_id, 'spot');

  -- Update user points
  UPDATE profiles SET points = points + v_points WHERE id = p_user_id;

  -- Update streak
  INSERT INTO streaks (user_id, current_streak, longest_streak, last_checkin_date)
  VALUES (p_user_id, 1, 1, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak = CASE
      WHEN streaks.last_checkin_date = CURRENT_DATE - 1 THEN streaks.current_streak + 1
      WHEN streaks.last_checkin_date = CURRENT_DATE THEN streaks.current_streak
      ELSE 1
    END,
    longest_streak = GREATEST(
      CASE
        WHEN streaks.last_checkin_date = CURRENT_DATE - 1 THEN streaks.current_streak + 1
        WHEN streaks.last_checkin_date = CURRENT_DATE THEN streaks.current_streak
        ELSE 1
      END,
      streaks.longest_streak
    ),
    last_checkin_date = CURRENT_DATE,
    updated_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'points_earned', v_points,
    'checkin_id', v_checkin_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get spots nearby
CREATE OR REPLACE FUNCTION get_spots_nearby(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_meters INTEGER DEFAULT 2000,
  p_min_larp_score INTEGER DEFAULT 0,
  p_min_wifi INTEGER DEFAULT 0,
  p_min_outlets INTEGER DEFAULT 0,
  p_min_laptop INTEGER DEFAULT 0,
  p_spot_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  google_place_id TEXT,
  name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  city TEXT,
  country TEXT,
  place_type TEXT,
  larp_score INTEGER,
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.google_place_id,
    s.name,
    s.latitude,
    s.longitude,
    s.address,
    s.city,
    s.country,
    s.place_type,
    COALESCE(sm.larp_score, 0) as larp_score,
    ST_Distance(
      ST_Point(s.longitude, s.latitude)::geography,
      ST_Point(p_lng, p_lat)::geography
    ) as distance_meters
  FROM spots s
  LEFT JOIN spot_metadata sm ON s.id = sm.spot_id
  WHERE ST_Distance(
    ST_Point(s.longitude, s.latitude)::geography,
    ST_Point(p_lng, p_lat)::geography
  ) <= p_radius_meters
  AND (p_min_larp_score = 0 OR COALESCE(sm.larp_score, 0) >= p_min_larp_score)
  AND (p_min_wifi = 0 OR COALESCE(sm.wifi_rating, 0) >= p_min_wifi)
  AND (p_min_outlets = 0 OR COALESCE(sm.outlet_rating, 0) >= p_min_outlets)
  AND (p_min_laptop = 0 OR COALESCE(sm.laptop_friendliness, 0) >= p_min_laptop)
  AND (p_spot_types IS NULL OR s.place_type = ANY(p_spot_types))
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_checkins JSONB;
  v_longest_streak INTEGER;
  v_current_streak INTEGER;
BEGIN
  SELECT jsonb_build_object(
    'spots_visited', COUNT(DISTINCT spot_id),
    'cities', COUNT(DISTINCT s.city),
    'countries', COUNT(DISTINCT s.country),
    'total_checkins', COUNT(*)
  ) INTO v_checkins
  FROM check_ins ci
  JOIN spots s ON ci.spot_id = s.id
  WHERE ci.user_id = p_user_id;

  SELECT current_streak, longest_streak
  INTO v_current_streak, v_longest_streak
  FROM streaks
  WHERE user_id = p_user_id;

  v_result := v_checkins || jsonb_build_object(
    'current_streak', COALESCE(v_current_streak, 0),
    'longest_streak', COALESCE(v_longest_streak, 0)
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- SEED BADGES
-- =====================================================

INSERT INTO badges (name, description, icon, requirement, points) VALUES
  ('First Larp', 'Complete your first check-in', '🎯', '1 checkin', 50),
  ('Coffee Larp', 'Visit 10 cafe spots', '☕', '10 cafe checkins', 100),
  ('Library Larp', 'Visit 5 libraries', '📚', '5 library checkins', 100),
  ('Road Warrior', 'Visit spots in 5 cities', '🗺️', '5 cities', 200),
  ('International Larper', 'Visit spots in 3 countries', '🌍', '3 countries', 500),
  ('Regular', 'Complete 10 check-ins', '📍', '10 checkins', 150),
  ('No Office Needed', 'Complete 50 check-ins', '🏠', '50 checkins', 500),
  ('Review Champion', 'Write 10 reviews', '✍️', '10 reviews', 200),
  ('Helpful Reviewer', 'Get 50 helpful votes', '👍', '50 helpful votes', 300),
  ('Streak Master', 'Maintain a 7-day streak', '🔥', '7 day streak', 250);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE spot_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Spots policies
CREATE POLICY "Spots are viewable by everyone"
  ON spots FOR SELECT
  USING (true);

CREATE POLICY "Spots can be created by authenticated users"
  ON spots FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Spots can be updated by authenticated users"
  ON spots FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Spot metadata policies
CREATE POLICY "Spot metadata is viewable by everyone"
  ON spot_metadata FOR SELECT
  USING (true);

CREATE POLICY "Spot metadata can be updated by authenticated users"
  ON spot_metadata FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Review helpful votes policies
CREATE POLICY "Authenticated users can vote"
  ON review_helpful_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can remove vote"
  ON review_helpful_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Spot photos policies
CREATE POLICY "Spot photos are viewable by everyone"
  ON spot_photos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload photos"
  ON spot_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON spot_photos FOR DELETE
  USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Check-ins policies
CREATE POLICY "Users can view own check-ins"
  ON check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create check-ins"
  ON check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Point transactions policies
CREATE POLICY "Users can view own transactions"
  ON point_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Badges policies
CREATE POLICY "Badges are viewable by everyone"
  ON badges FOR SELECT
  USING (true);

-- User badges policies
CREATE POLICY "User badges are viewable by everyone"
  ON user_badges FOR SELECT
  USING (true);

CREATE POLICY "System can award badges"
  ON user_badges FOR INSERT
  WITH CHECK (true);

-- Streaks policies
CREATE POLICY "Users can view own streaks"
  ON streaks FOR SELECT
  USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Authenticated users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('spot-photos', 'spot-photos', true);

CREATE POLICY "Anyone can view spot photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'spot-photos');

CREATE POLICY "Authenticated users can upload spot photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'spot-photos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own spot photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'spot-photos'
    AND auth.uid() = owner
  );

-- =====================================================
-- DONE!
-- =====================================================

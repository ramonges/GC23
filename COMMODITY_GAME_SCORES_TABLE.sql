-- ============================================
-- COMMODITY GAME SCORES TABLE
-- ============================================
-- Stores game results for the Commodity Game.
-- Used to compute "Top X%" percentile ranking when the clock reaches 0.
--
-- Run this in your Supabase SQL editor to create the table.

CREATE TABLE IF NOT EXISTS public.commodity_game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity TEXT NOT NULL,           -- e.g. 'Crude Oil', 'Gold', 'Coal'
  score INTEGER NOT NULL,           -- number of countries unlocked
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast percentile queries (filter by commodity, order by score)
CREATE INDEX IF NOT EXISTS idx_commodity_game_scores_commodity_score
  ON public.commodity_game_scores (commodity, score DESC);

-- Enable Row Level Security
ALTER TABLE public.commodity_game_scores ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (anonymous play)
CREATE POLICY "Anyone can insert scores" ON public.commodity_game_scores
  FOR INSERT WITH CHECK (true);

-- Anyone can read (needed for percentile calculation)
CREATE POLICY "Anyone can read scores" ON public.commodity_game_scores
  FOR SELECT USING (true);

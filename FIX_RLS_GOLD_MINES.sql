-- ============================================================
-- FIX RLS FOR GOLD_MINES — Allow public read
-- ============================================================
-- Run this if gold_mines exists but data doesn't show on the map.
-- RLS may be blocking unauthenticated reads.
-- ============================================================

ALTER TABLE public.gold_mines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read gold_mines" ON public.gold_mines;
DROP POLICY IF EXISTS "Authenticated users can read gold_mines" ON public.gold_mines;

CREATE POLICY "Anyone can read gold_mines" ON public.gold_mines
  FOR SELECT USING (true);

-- ============================================================
-- Gold Mines Table — RLS only (no sync to commodity_locations)
-- ============================================================
-- One table per commodity: gold_mines stays separate.
-- The map fetches directly from gold_mines.
-- Run this in Supabase SQL Editor.
-- ============================================================

ALTER TABLE public.gold_mines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read gold_mines" ON public.gold_mines;
CREATE POLICY "Anyone can read gold_mines" ON public.gold_mines
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage gold_mines" ON public.gold_mines;
CREATE POLICY "Service role can manage gold_mines" ON public.gold_mines
  FOR ALL USING (auth.role() = 'service_role');

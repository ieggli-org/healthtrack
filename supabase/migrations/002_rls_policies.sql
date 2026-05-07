-- Row Level Security policies
-- Ensures users can only access their own data

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- profiles: users read/write only their own row
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- weight_entries: users CRUD only their own rows
CREATE POLICY "entries_all" ON public.weight_entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- goals: users CRUD only their own rows
CREATE POLICY "goals_all" ON public.goals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

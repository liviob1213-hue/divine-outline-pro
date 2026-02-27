
CREATE TABLE public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  session_token text NOT NULL,
  ip_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX user_sessions_email_idx ON public.user_sessions (email);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sessions are publicly readable" ON public.user_sessions FOR SELECT USING (true);
CREATE POLICY "Sessions can be inserted" ON public.user_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Sessions can be updated" ON public.user_sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Sessions can be deleted" ON public.user_sessions FOR DELETE USING (true);

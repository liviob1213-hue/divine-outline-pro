
-- Pastor materials storage table
CREATE TABLE public.pastor_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'note' CHECK (type IN ('note', 'image', 'video')),
  content TEXT,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pastor_materials ENABLE ROW LEVEL SECURITY;

-- Public access for now (no auth yet)
CREATE POLICY "Allow all access to pastor_materials"
  ON public.pastor_materials FOR ALL
  USING (true)
  WITH CHECK (true);

-- Storage bucket for pastor uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('pastor-files', 'pastor-files', true);

CREATE POLICY "Allow public read on pastor-files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pastor-files');

CREATE POLICY "Allow public upload on pastor-files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pastor-files');

CREATE POLICY "Allow public update on pastor-files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'pastor-files');

CREATE POLICY "Allow public delete on pastor-files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'pastor-files');

-- Update trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_pastor_materials_updated_at
  BEFORE UPDATE ON public.pastor_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

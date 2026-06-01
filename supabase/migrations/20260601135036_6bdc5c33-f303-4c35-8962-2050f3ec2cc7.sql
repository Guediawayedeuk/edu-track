-- Storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Attachments table
CREATE TABLE public.message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  uploader_id uuid NOT NULL,
  storage_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.message_attachments TO authenticated;
GRANT ALL ON public.message_attachments TO service_role;

ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_message_attachments_message_id ON public.message_attachments(message_id);

-- Helper: can current user access this message?
CREATE OR REPLACE FUNCTION public.can_access_message(_message_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.id = _message_id
      AND (m.sender_id = auth.uid() OR m.recipient_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  )
$$;

CREATE POLICY "Read attachments of own messages"
ON public.message_attachments FOR SELECT TO authenticated
USING (public.can_access_message(message_id));

CREATE POLICY "Sender uploads attachments"
ON public.message_attachments FOR INSERT TO authenticated
WITH CHECK (
  uploader_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.id = message_id AND m.sender_id = auth.uid()
  )
);

CREATE POLICY "Uploader or admin deletes attachments"
ON public.message_attachments FOR DELETE TO authenticated
USING (uploader_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

-- Storage RLS (storage.objects). Path convention: {message_id}/{filename}
CREATE POLICY "Read message attachment files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'message-attachments'
  AND EXISTS (
    SELECT 1 FROM public.message_attachments a
    WHERE a.storage_path = storage.objects.name
      AND public.can_access_message(a.message_id)
  )
);

CREATE POLICY "Sender uploads message attachment files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'message-attachments'
  AND EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.id::text = (storage.foldername(storage.objects.name))[1]
      AND m.sender_id = auth.uid()
  )
);

CREATE POLICY "Uploader or admin deletes message attachment files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'message-attachments'
  AND EXISTS (
    SELECT 1 FROM public.message_attachments a
    WHERE a.storage_path = storage.objects.name
      AND (a.uploader_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Tabla de solicitudes de amigo pendientes
CREATE TABLE IF NOT EXISTS public.pending_friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  epic_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.pending_friend_requests ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can see their own pending requests" ON public.pending_friend_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert pending requests" ON public.pending_friend_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can manage pending requests" ON public.pending_friend_requests
  FOR ALL USING (true);

-- Tabla de chats
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  admin_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'closed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas para chats
CREATE POLICY "Users can see their own chats" ON public.chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create chats" ON public.chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can see all chats" ON public.chats
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email IN ('nleonelli0@gmail.com', 'juancruzgc10@gmail.com'))
  );

-- Políticas para mensajes
CREATE POLICY "Users can see messages from their chats" ON public.messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chats WHERE id = messages.chat_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email IN ('nleonelli0@gmail.com', 'juancruzgc10@gmail.com'))
  );

CREATE POLICY "Users can insert messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Function para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chats_updated_at
  BEFORE UPDATE ON public.chats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

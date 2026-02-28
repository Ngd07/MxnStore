-- Tabla de compras
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  skin_name VARCHAR(255) NOT NULL,
  skin_price INTEGER NOT NULL,
  fortnite_username VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes del chat de compra
CREATE TABLE IF NOT EXISTS public.purchase_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_messages ENABLE ROW LEVEL SECURITY;

-- Políticas purchases
CREATE POLICY "Users can see their purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases" ON public.purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can see all purchases" ON public.purchases
  FOR SELECT USING (true);

CREATE POLICY "Admins can update purchases" ON public.purchases
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email IN ('nleonelli0@gmail.com', 'juancruzgc10@gmail.com'))
  );

-- Políticas messages
CREATE POLICY "Users can see their purchase messages" ON public.purchase_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.purchases WHERE id = purchase_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email IN ('nleonelli0@gmail.com', 'juancruzgc10@gmail.com'))
  );

CREATE POLICY "Users can insert purchase messages" ON public.purchase_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Function para actualizar updated_at
CREATE OR REPLACE FUNCTION update_purchase_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_purchase_updated_at();

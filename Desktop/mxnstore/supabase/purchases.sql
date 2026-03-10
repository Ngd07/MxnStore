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
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_messages ENABLE ROW LEVEL SECURITY;

-- Allow all operations
CREATE POLICY "Allow all for purchases"
  ON public.purchases FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas messages
CREATE POLICY "Allow all for purchase_messages"
  ON public.purchase_messages FOR ALL
  USING (true)
  WITH CHECK (true);

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

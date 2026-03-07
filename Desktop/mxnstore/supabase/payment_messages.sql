-- Messages for manual payments chat
CREATE TABLE IF NOT EXISTS payment_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES manual_payments(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_messages_payment_id ON payment_messages(payment_id);

ALTER TABLE payment_messages ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access to payment_messages"
  ON payment_messages FOR ALL
  USING (auth.role() = 'service_role');

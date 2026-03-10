-- Messages for manual payments chat
CREATE TABLE IF NOT EXISTS payment_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES manual_payments(id) ON DELETE CASCADE,
  sender_id TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_messages_payment_id ON payment_messages(payment_id);

ALTER TABLE payment_messages ENABLE ROW LEVEL SECURITY;

-- Allow all operations (API uses service role)
CREATE POLICY "Allow all for payment_messages"
  ON payment_messages FOR ALL
  USING (true)
  WITH CHECK (true);

-- Manual payments table for users to upload payment receipts
CREATE TABLE IF NOT EXISTS manual_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mxn_amount INTEGER NOT NULL,
  usd_amount DECIMAL(10,2) NOT NULL,
  receipt_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_manual_payments_user_id ON manual_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_payments_status ON manual_payments(status);

-- Enable RLS
ALTER TABLE manual_payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own manual payments"
  ON manual_payments FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything
CREATE POLICY "Service role full access to manual payments"
  ON manual_payments FOR ALL
  USING (auth.role() = 'service_role');

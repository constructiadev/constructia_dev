/*
  # Create subscriptions table

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to clients)
      - `plan` (text) - Subscription plan
      - `status` (text) - Subscription status
      - `current_period_start` (timestamp) - Current period start
      - `current_period_end` (timestamp) - Current period end
      - `stripe_subscription_id` (text) - Stripe subscription ID
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `subscriptions` table
    - Add policies for client and admin access
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('basic', 'professional', 'enterprise', 'custom')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Clients can read their own subscriptions
CREATE POLICY "Clients can read own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE user_id = auth.uid()
    )
  );

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can manage subscriptions
CREATE POLICY "System can manage subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  WITH CHECK (true);

-- Trigger to update updated_at
CREATE OR REPLACE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
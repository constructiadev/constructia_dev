/*
  # Add commission periods to payment gateways

  1. Schema Changes
    - Add `commission_periods` JSONB column to `payment_gateways` table
    - This allows configurable commission rates with date ranges
    - Each period can have different percentage and fixed rates
    - Supports intelligent calculation based on transaction dates

  2. Structure
    - commission_periods: Array of objects with start_date, end_date, percentage, fixed
    - Allows overlapping periods for complex commission structures
    - Backward compatible with existing commission_percentage and commission_fixed

  3. Example Structure
    ```json
    [
      {
        "start_date": "2025-01-01",
        "end_date": "2025-01-15", 
        "percentage": 1.0,
        "fixed": 0.30
      },
      {
        "start_date": "2025-01-16",
        "end_date": "2025-01-31",
        "percentage": 1.6,
        "fixed": 0.30
      }
    ]
    ```
*/

-- Add commission_periods column to payment_gateways table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payment_gateways' AND column_name = 'commission_periods'
  ) THEN
    ALTER TABLE payment_gateways 
    ADD COLUMN commission_periods JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add some sample commission periods for existing gateways
UPDATE payment_gateways 
SET commission_periods = '[
  {
    "start_date": "2025-01-01",
    "end_date": "2025-01-15",
    "percentage": 1.0,
    "fixed": 0.30,
    "description": "Promoción inicio de año"
  },
  {
    "start_date": "2025-01-16", 
    "end_date": "2025-12-31",
    "percentage": 1.6,
    "fixed": 0.30,
    "description": "Tarifa estándar"
  }
]'::jsonb
WHERE type = 'stripe' AND commission_periods = '[]'::jsonb;

UPDATE payment_gateways 
SET commission_periods = '[
  {
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "percentage": 0.5,
    "fixed": 0.25,
    "description": "Tarifa SEPA estándar"
  }
]'::jsonb
WHERE type = 'sepa' AND commission_periods = '[]'::jsonb;
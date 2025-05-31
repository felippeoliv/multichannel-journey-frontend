-- Remove owner_id column from businesses table
ALTER TABLE businesses DROP COLUMN IF EXISTS owner_id;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can create their own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can view their own businesses" ON businesses;
DROP POLICY IF EXISTS "Users can update their own businesses" ON businesses;

-- Enable RLS on businesses table
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies
CREATE POLICY "Authenticated users can create businesses"
ON businesses
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their associated businesses"
ON businesses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM business_users
    WHERE business_users.business_id = businesses.id
    AND business_users.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can update their businesses"
ON businesses
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM business_users
    WHERE business_users.business_id = businesses.id
    AND business_users.user_id = auth.uid()
    AND business_users.role = 'admin'
  )
); 
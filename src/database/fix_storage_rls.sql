-- =====================================================
-- FIX STORAGE RLS POLICY
-- =====================================================

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on objects (standard practice, though often on by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy to allow public access to site-assets
-- This allows ANYONE to SELECT, INSERT, UPDATE, DELETE in this bucket.
-- Adjust "TO public" to "TO authenticated" if you only want logged-in users to upload.
-- given the error "violates row-level security policy", we need at least an INSERT policy.

DROP POLICY IF EXISTS "Public Access to Site Assets" ON storage.objects;

CREATE POLICY "Public Access to Site Assets"
ON storage.objects
FOR ALL
TO public
USING ( bucket_id = 'site-assets' )
WITH CHECK ( bucket_id = 'site-assets' );

-- 4. Verify
DO $$
BEGIN
  RAISE NOTICE '✅ Storage policy updated for site-assets bucket';
END $$;

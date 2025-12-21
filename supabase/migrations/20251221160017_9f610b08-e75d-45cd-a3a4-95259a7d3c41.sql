-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view chat attachments" ON storage.objects;

-- Create a new SELECT policy that validates group membership
-- File path structure: {group_id}/{user_id}/{filename}
CREATE POLICY "Users can view chat attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND is_group_member(auth.uid(), (storage.foldername(name))[1]::uuid)
);
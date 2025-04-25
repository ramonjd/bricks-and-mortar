-- Drop existing policies for property images
DROP POLICY IF EXISTS "Property images are accessible to property owners and shared users" ON storage.objects;
DROP POLICY IF EXISTS "Property owners can upload property images" ON storage.objects;

-- Create new policies for property images
CREATE POLICY "Property images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'properties');

CREATE POLICY "Users can upload property images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'properties' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own property images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'properties' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own property images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'properties' AND 
  (storage.foldername(name))[1] = auth.uid()::text
); 
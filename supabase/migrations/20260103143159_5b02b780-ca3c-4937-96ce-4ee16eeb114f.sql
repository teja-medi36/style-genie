-- Add image_url column to wardrobe_items table
ALTER TABLE public.wardrobe_items 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for wardrobe images
INSERT INTO storage.buckets (id, name, public)
VALUES ('wardrobe-images', 'wardrobe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload wardrobe images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'wardrobe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update their wardrobe images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'wardrobe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their wardrobe images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'wardrobe-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to wardrobe images
CREATE POLICY "Wardrobe images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wardrobe-images');
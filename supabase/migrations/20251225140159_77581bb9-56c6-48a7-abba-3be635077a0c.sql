-- Create profiles table for user style preferences
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  body_type TEXT, -- slim, athletic, average, curvy, plus
  skin_tone TEXT, -- fair, light, medium, olive, tan, dark
  hair_color TEXT, -- blonde, brown, black, red, gray, other
  hair_style TEXT, -- short, medium, long, bald
  preferred_colors TEXT[], -- array of preferred colors
  style_preference TEXT, -- casual, formal, streetwear, bohemian, minimalist, classic
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wardrobe_items table for user's clothing collection
CREATE TABLE public.wardrobe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- shirt, pants, jacket, shoes, accessories, cap, dress
  color TEXT NOT NULL,
  image_url TEXT,
  brand TEXT,
  size TEXT,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create outfit_suggestions table for AI suggestions
CREATE TABLE public.outfit_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  occasion TEXT, -- casual, work, date, party, sport
  suggestion_data JSONB NOT NULL, -- stores the outfit combination
  is_saved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_suggestions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Wardrobe items policies
CREATE POLICY "Users can view their own wardrobe items" 
ON public.wardrobe_items FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wardrobe items" 
ON public.wardrobe_items FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wardrobe items" 
ON public.wardrobe_items FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wardrobe items" 
ON public.wardrobe_items FOR DELETE 
USING (auth.uid() = user_id);

-- Outfit suggestions policies
CREATE POLICY "Users can view their own outfit suggestions" 
ON public.outfit_suggestions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outfit suggestions" 
ON public.outfit_suggestions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfit suggestions" 
ON public.outfit_suggestions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfit suggestions" 
ON public.outfit_suggestions FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
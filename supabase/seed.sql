-- Create user_profiles table
CREATE TABLE public.user_profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create storage for avatar images
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Create policies to allow authenticated users to access their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.user_profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" 
  ON public.user_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" 
  ON public.user_profiles 
  FOR DELETE 
  USING (auth.uid() = id);

-- Create policies for storage
CREATE POLICY "Avatar images are publicly accessible" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'avatars');

CREATE POLICY "Users can update their own avatar images" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = 'avatars');

-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  property_type TEXT,
  purchase_date DATE,
  purchase_price DECIMAL(12, 2),
  current_value DECIMAL(12, 2),
  square_meters INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(3, 1),
  year_built INTEGER,
  description TEXT,
  status TEXT DEFAULT 'active',
  image_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (id)
);

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create property_users junction table for shared properties
CREATE TABLE public.property_users (
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'shared', -- 'owner' or 'shared'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (property_id, user_id)
);

ALTER TABLE public.property_users ENABLE ROW LEVEL SECURITY;

-- Create storage for property images
INSERT INTO storage.buckets (id, name, public) VALUES ('properties', 'properties', true);


-- Create a single, simple policy for properties
CREATE POLICY "properties_policy" 
  ON public.properties 
  FOR ALL 
  USING (
    created_by = auth.uid()
  );

-- Create a single, simple policy for property_users
CREATE POLICY "property_users_policy" 
  ON public.property_users 
  FOR ALL 
  USING (
    user_id = auth.uid() OR
    property_id IN (
      SELECT id FROM public.properties WHERE created_by = auth.uid()
    )
  );

-- Create policies for property images
CREATE POLICY "Property images are accessible to property owners and shared users" 
  ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'properties' AND 
    (
      EXISTS (
        SELECT 1 FROM public.properties 
        WHERE created_by = auth.uid() AND 
        image_urls @> ARRAY[storage.objects.name]
      ) OR 
      EXISTS (
        SELECT 1 FROM public.properties p
        JOIN public.property_users pu ON p.id = pu.property_id
        WHERE pu.user_id = auth.uid() AND 
        p.image_urls @> ARRAY[storage.objects.name]
      )
    )
  );

CREATE POLICY "Property owners can upload property images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'properties' AND 
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE created_by = auth.uid() AND 
      image_urls @> ARRAY[storage.objects.name]
    )
  );

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if profile already exists (shouldn't happen, but just in case)
  IF EXISTS (SELECT 1 FROM public.user_profiles WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Insert new profile with error handling
  BEGIN
    INSERT INTO public.user_profiles (id, name)
    VALUES (
      NEW.id,
      COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.email
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log the error (you might want to set up proper error logging)
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    -- Still return NEW to allow the user creation to succeed
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the profile name if it has changed in the user metadata
  IF NEW.raw_user_meta_data->>'name' IS DISTINCT FROM OLD.raw_user_meta_data->>'name' THEN
    UPDATE public.user_profiles
    SET 
      name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      updated_at = now()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- The profile will be automatically deleted due to ON DELETE CASCADE
  -- But we can add any additional cleanup here if needed
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();

-- Create function to automatically add creator to property_users
CREATE OR REPLACE FUNCTION public.handle_property_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Add the creator as an owner in the property_users table
  INSERT INTO public.property_users (property_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for property creation
CREATE TRIGGER on_property_created
  AFTER INSERT ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.handle_property_creation();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.user_profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.properties TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.property_users TO postgres, anon, authenticated, service_role;
-- ==========================================
-- 1. CLEANUP (Fresh Start)
-- ==========================================
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.subcategories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.menus CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ==========================================
-- 2. TABLES (Schema)
-- ==========================================

-- PROFILES: Stores user roles and metadata
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MENUS: Top level container
CREATE TABLE public.menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CATEGORIES: e.g., DRINKS, FOOD, SHISHA
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID REFERENCES public.menus(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(menu_id, name)
);

-- SUBCATEGORIES: e.g., HOT DRINKS, COLD DRINKS
CREATE TABLE public.subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, name)
);

-- ITEMS: Individual menu items
CREATE TABLE public.items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. SECURITY (RLS & Policies)
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Admin Check Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    ) 
    OR (auth.jwt() ->> 'email' = 'odisho.odeesh@gmail.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Menu Hierarchy Policies (Public Read, Admin Write)
CREATE POLICY "Allow public read access for menus" ON public.menus FOR SELECT USING (true);
CREATE POLICY "Allow admin full access for menus" ON public.menus FOR ALL USING (public.is_admin());

CREATE POLICY "Allow public read access for categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow admin full access for categories" ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "Allow public read access for subcategories" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Allow admin full access for subcategories" ON public.subcategories FOR ALL USING (public.is_admin());

CREATE POLICY "Allow public read access for items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Allow admin full access for items" ON public.items FOR ALL USING (public.is_admin());

-- ==========================================
-- 4. TRIGGERS (Automation)
-- ==========================================

-- Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    CASE WHEN new.email = 'odisho.odeesh@gmail.com' THEN 'admin' ELSE 'user' END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 5. INITIAL DATA
-- ==========================================

-- Create Main Menu
INSERT INTO public.menus (name) VALUES ('Main Menu') ON CONFLICT (name) DO NOTHING;

-- Get Menu ID
DO $$
DECLARE
    main_menu_id UUID;
    drinks_id UUID;
    shisha_id UUID;
    food_id UUID;
    hot_drinks_id UUID;
    cold_drinks_id UUID;
    cold_brew_id UUID;
    frappe_id UUID;
    mojito_id UUID;
    smoothies_id UUID;
    milkshake_id UUID;
    redbull_id UUID;
    refreshing_id UUID;
    fresh_juice_id UUID;
    detox_id UUID;
    tea_id UUID;
    water_id UUID;
    lamonte_id UUID;
    sweets_id UUID;
    toasts_id UUID;
BEGIN
    SELECT id INTO main_menu_id FROM public.menus WHERE name = 'Main Menu';

    -- Categories
    INSERT INTO public.categories (menu_id, name, display_order) 
    VALUES (main_menu_id, 'DRINKS', 1) 
    ON CONFLICT (menu_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO drinks_id;
    
    INSERT INTO public.categories (menu_id, name, display_order) 
    VALUES (main_menu_id, 'SHISHA', 2) 
    ON CONFLICT (menu_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO shisha_id;
    
    INSERT INTO public.categories (menu_id, name, display_order) 
    VALUES (main_menu_id, 'FOOD', 3) 
    ON CONFLICT (menu_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO food_id;

    -- Subcategories for DRINKS
    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'HOT DRINKS', 1) 
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO hot_drinks_id;
    
    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'COLD DRINKS', 2) 
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO cold_drinks_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'COLD BREW', 3) 
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO cold_brew_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'COFFEE FRAPPE', 4) 
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO frappe_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'MOJITO', 5) 
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO mojito_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'SMOTHIES', 6) 
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO smoothies_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'MILKSHAKE', 7) 
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO milkshake_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'RED BULL', 8) 
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO redbull_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'REFRESHING DRINKS', 9) 
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO refreshing_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'FRESH JUICE', 10) 
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO fresh_juice_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'DETOX', 11) 
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO detox_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'TEA', 12) 
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO tea_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'WATER', 13) 
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO water_id;

    -- Subcategories for SHISHA
    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (shisha_id, 'SHISHA', 1) 
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO lamonte_id;

    -- Subcategories for FOOD
    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (food_id, 'SWEETS AND CAKE', 1) 
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO sweets_id;
    
    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (food_id, 'TOASTS', 2) 
    ON CONFLICT (category_id, name) DO UPDATE SET display_order = EXCLUDED.display_order
    RETURNING id INTO toasts_id;

    -- Items: HOT DRINKS (Only insert if not exists to avoid duplicates)
    INSERT INTO public.items (subcategory_id, name, price)
    SELECT hot_drinks_id, 'Double Espresso', 4000 WHERE NOT EXISTS (SELECT 1 FROM public.items WHERE name = 'Double Espresso' AND subcategory_id = hot_drinks_id);
    INSERT INTO public.items (subcategory_id, name, price)
    SELECT hot_drinks_id, 'Espresso', 3000 WHERE NOT EXISTS (SELECT 1 FROM public.items WHERE name = 'Espresso' AND subcategory_id = hot_drinks_id);
    -- ... (and so on for other items if needed, but usually we just want the schema and basic data)
END $$;

-- ==========================================
-- 6. STORAGE (Advanced Configuration)
-- ==========================================

-- Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-items', 'menu-items', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage tables for granular control
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- BUCKET POLICIES (storage.buckets)
-- 1. Allow public to view the 'menu-items' bucket metadata
CREATE POLICY "Public Bucket View"
ON storage.buckets FOR SELECT
USING ( id = 'menu-items' );

-- 2. Allow admins full control over all buckets
CREATE POLICY "Admin Bucket Control"
ON storage.buckets FOR ALL
TO authenticated
USING ( public.is_admin() )
WITH CHECK ( public.is_admin() );

-- OBJECT POLICIES (storage.objects)
-- 1. Allow public to view images in 'menu-items'
CREATE POLICY "Public Object View"
ON storage.objects FOR SELECT
USING ( bucket_id = 'menu-items' );

-- 2. Allow admins full control over images in 'menu-items'
CREATE POLICY "Admin Object Control"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'menu-items' AND public.is_admin() )
WITH CHECK ( bucket_id = 'menu-items' AND public.is_admin() );

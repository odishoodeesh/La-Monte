-- ==========================================
-- 1. CLEANUP (Fresh Start)
-- ==========================================
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.sub_items CASCADE;
DROP TABLE IF EXISTS public.items CASCADE;
DROP TABLE IF EXISTS public.subcategories CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.menus CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Cleanup storage (optional, be careful with this in production)
-- DELETE FROM storage.objects WHERE bucket_id = 'uploads';
-- DELETE FROM storage.buckets WHERE id = 'uploads';

-- ==========================================
-- 2. STORAGE (Buckets)
-- ==========================================

-- Create the uploads bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Set up access policies for the bucket
-- Allow public to read objects
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');

-- Allow authenticated users (or specifically admins) to upload/delete
-- Since we use S3 with service keys, these policies might be bypassed by S3,
-- but they are good for the Supabase client/dashboard.
CREATE POLICY "Admin Insert Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Admin Update Access" ON storage.objects FOR UPDATE USING (bucket_id = 'uploads');
CREATE POLICY "Admin Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'uploads');

-- ==========================================
-- 3. TABLES (Schema)
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
  extras JSONB DEFAULT '[]'::jsonb,
  is_available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUB_ITEMS: The "sub-item" table for extra items (e.g., Extra Shot, Oat Milk)
CREATE TABLE public.sub_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ORDERS: Customer orders
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  items JSONB NOT NULL, -- Storing snapshot of items for history
  total_price NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
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
ALTER TABLE public.sub_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Admin Check Function (SECURITY DEFINER to bypass RLS for checks)
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

-- Sub-items Policies
CREATE POLICY "Allow public read access for sub_items" ON public.sub_items FOR SELECT USING (true);
CREATE POLICY "Allow admin full access for sub_items" ON public.sub_items FOR ALL USING (public.is_admin());

-- Orders Policies
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can create an order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view and manage all orders" ON public.orders FOR ALL USING (public.is_admin());

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

-- Get Menu ID and Seed Data
DO $$
DECLARE
    main_menu_id UUID;
    drinks_id UUID;
    shisha_id UUID;
    food_id UUID;
    hot_drinks_id UUID;
    espresso_id UUID;
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
    RETURNING id INTO espresso_id; -- Reusing variable for cold drinks subcat id

    -- Sample Items
    INSERT INTO public.items (subcategory_id, name, price, description, image_url)
    VALUES (hot_drinks_id, 'Espresso', 3000, 'Pure concentrated coffee essence.', 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=1000')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.items (subcategory_id, name, price, description, image_url)
    VALUES (hot_drinks_id, 'Americano', 3500, 'Classic black coffee with hot water and espresso.', 'https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&q=80&w=1000')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.items (subcategory_id, name, price, description, image_url)
    VALUES (espresso_id, 'Iced Caramel Latte', 4500, 'Chilled espresso with milk and rich caramel syrup.', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=1000')
    ON CONFLICT DO NOTHING;
END $$;

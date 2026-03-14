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
INSERT INTO public.menus (name) VALUES ('Main Menu');

-- Get Menu ID
DO $$
DECLARE
    main_menu_id UUID;
    drinks_id UUID;
    shisha_id UUID;
    food_id UUID;
    hot_drinks_id UUID;
    cold_drinks_id UUID;
    lamonte_id UUID;
    sweets_id UUID;
    toasts_id UUID;
BEGIN
    SELECT id INTO main_menu_id FROM public.menus WHERE name = 'Main Menu';

    -- Categories
    INSERT INTO public.categories (menu_id, name, display_order) 
    VALUES (main_menu_id, 'DRINKS', 1) RETURNING id INTO drinks_id;
    
    INSERT INTO public.categories (menu_id, name, display_order) 
    VALUES (main_menu_id, 'SHISHA', 2) RETURNING id INTO shisha_id;
    
    INSERT INTO public.categories (menu_id, name, display_order) 
    VALUES (main_menu_id, 'FOOD', 3) RETURNING id INTO food_id;

    -- Subcategories for DRINKS
    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'HOT DRINKS', 1) RETURNING id INTO hot_drinks_id;
    
    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'COLD DRINKS', 2) RETURNING id INTO cold_drinks_id;

    -- Subcategories for SHISHA
    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (shisha_id, 'Lamonte', 1) RETURNING id INTO lamonte_id;

    -- Subcategories for FOOD
    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (food_id, 'SWEETS AND CAKE', 1) RETURNING id INTO sweets_id;
    
    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (food_id, 'TOASTS', 2) RETURNING id INTO toasts_id;

    -- Sample Items: HOT DRINKS
    INSERT INTO public.items (subcategory_id, name, price, description) VALUES 
    (hot_drinks_id, 'Double Espresso', 4000, 'Rich and bold double shot'),
    (hot_drinks_id, 'Cappuccino', 5000, 'Classic Italian coffee'),
    (hot_drinks_id, 'Turkish Coffee', 3500, 'Traditional strong coffee');

    -- Sample Items: COLD DRINKS
    INSERT INTO public.items (subcategory_id, name, price, description) VALUES 
    (cold_drinks_id, 'ICED AMERICANO', 5000, 'Refreshing cold coffee'),
    (cold_drinks_id, 'Fresh Orange Juice', 6000, '100% natural');

    -- Sample Items: SHISHA
    INSERT INTO public.items (subcategory_id, name, price, description) VALUES 
    (lamonte_id, 'Double Apple', 10000, 'Classic flavor'),
    (lamonte_id, 'Mint', 10000, 'Cool and refreshing');

    -- Sample Items: SWEETS
    INSERT INTO public.items (subcategory_id, name, price, description) VALUES 
    (sweets_id, 'CHOCOLATE CAKE', 6500, 'Decadent chocolate layers'),
    (sweets_id, 'Cheesecake', 7000, 'Creamy New York style');

    -- Sample Items: TOASTS
    INSERT INTO public.items (subcategory_id, name, price, description) VALUES 
    (toasts_id, 'Cheese Toast', 4500, 'Melted cheese on sourdough'),
    (toasts_id, 'Turkey & Cheese', 5500, 'Classic combination');

END $$;

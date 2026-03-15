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
  user_role TEXT DEFAULT 'user' CHECK (user_role IN ('admin', 'user')),
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
      WHERE id = auth.uid() AND user_role = 'admin'
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
  INSERT INTO public.profiles (id, full_name, avatar_url, user_role)
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

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'COLD BREW', 3) RETURNING id INTO cold_brew_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'COFFEE FRAPPE', 4) RETURNING id INTO frappe_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'MOJITO', 5) RETURNING id INTO mojito_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'SMOTHIES', 6) RETURNING id INTO smoothies_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'MILKSHAKE', 7) RETURNING id INTO milkshake_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'RED BULL', 8) RETURNING id INTO redbull_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'REFRESHING DRINKS', 9) RETURNING id INTO refreshing_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'FRESH JUICE', 10) RETURNING id INTO fresh_juice_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'DETOX', 11) RETURNING id INTO detox_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'TEA', 12) RETURNING id INTO tea_id;

    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (drinks_id, 'WATER', 13) RETURNING id INTO water_id;

    -- Subcategories for SHISHA
    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (shisha_id, 'SHISHA', 1) RETURNING id INTO lamonte_id;

    -- Subcategories for FOOD
    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (food_id, 'SWEETS AND CAKE', 1) RETURNING id INTO sweets_id;
    
    INSERT INTO public.subcategories (category_id, name, display_order) 
    VALUES (food_id, 'TOASTS', 2) RETURNING id INTO toasts_id;

    -- Items: HOT DRINKS
    INSERT INTO public.items (subcategory_id, name, price) VALUES 
    (hot_drinks_id, 'Double Espresso', 4000),
    (hot_drinks_id, 'Espresso', 3000),
    (hot_drinks_id, 'Americano', 4500),
    (hot_drinks_id, 'Cappuccino', 5000),
    (hot_drinks_id, 'Café Mocha', 6000),
    (hot_drinks_id, 'Hot Chocolate', 4500),
    (hot_drinks_id, 'Matcha Latte', 6000),
    (hot_drinks_id, 'Café Latte', 5000),
    (hot_drinks_id, 'Vanila Latte', 5500),
    (hot_drinks_id, 'IRISH CARAMEL LATTE', 5500),
    (hot_drinks_id, 'ESPPRESO MACCHIATO', 3500),
    (hot_drinks_id, 'milk', 2000),
    (hot_drinks_id, 'CRAMEL LATTE', 5500),
    (hot_drinks_id, 'SPANISH LATTE', 6000),
    (hot_drinks_id, 'CORTADO', 5000),
    (hot_drinks_id, 'COCONUT LATTE', 5500),
    (hot_drinks_id, 'PASSION HOT LEMONADAE', 5000),
    (hot_drinks_id, 'CANNELA LATTE', 5500),
    (hot_drinks_id, 'LAMONTE', 6000),
    (hot_drinks_id, 'Turkish Coffee', 3000),
    (hot_drinks_id, 'PISTACHIO COFFEE', 3000),
    (hot_drinks_id, 'MENENGIÇ COFFEE', 3000),
    (hot_drinks_id, 'V60', 6000),
    (hot_drinks_id, 'HIBISCUS TEA', 3000),
    (hot_drinks_id, 'HOT CHOCOLATE MARSHMALLOW', 6000),
    (hot_drinks_id, 'ESPRESSO AFFOGATO', 5000),
    (hot_drinks_id, 'TEA', 5000);

    -- Items: COLD DRINKS
    INSERT INTO public.items (subcategory_id, name, price) VALUES 
    (cold_drinks_id, 'ICED AMERICANO', 5000),
    (cold_drinks_id, 'COOKIES ICED LATTE', 6000),
    (cold_drinks_id, 'ROSA ICED LATTE', 6000),
    (cold_drinks_id, 'IRISH CRAMEL ICED', 6000),
    (cold_drinks_id, 'HAZELNUT ICED COFFEE', 6000),
    (cold_drinks_id, 'ICED LATTE CLASSIC', 5000),
    (cold_drinks_id, 'WHITE MOCHA ICED LATTE', 6000),
    (cold_drinks_id, 'ICED SPANSH LATTE', 6000),
    (cold_drinks_id, 'ICED LATTE MACRON', 6000),
    (cold_drinks_id, 'ICED MOCHA', 6000),
    (cold_drinks_id, 'ICED CINAMON LATTE', 6000),
    (cold_drinks_id, 'ICED VANILA LATTE', 6000),
    (cold_drinks_id, 'ICED COCONUT LATTE', 6000),
    (cold_drinks_id, 'ICED LATTE STRAWBERRY', 6000),
    (cold_drinks_id, 'ROSA MORANGO ICED LATTE', 6000),
    (cold_drinks_id, 'BUTTER POP CORN ICED LATTE', 6000),
    (cold_drinks_id, 'LAMONTE', 6000),
    (cold_drinks_id, 'ICED CARAMEL LATTE', 6000),
    (cold_drinks_id, 'V60', 6000);

    -- Items: COLD BREW
    INSERT INTO public.items (subcategory_id, name, price) VALUES 
    (cold_brew_id, 'ORANGE COLD BREW', 6000),
    (cold_brew_id, 'COLD BREW', 5000);

    -- Items: COFFEE FRAPPE
    INSERT INTO public.items (subcategory_id, name, price) VALUES 
    (frappe_id, 'FRAPPE MOCHA DARK', 6000),
    (frappe_id, 'FRAPPE CRAMEL', 6000),
    (frappe_id, 'FRAPPE CHOCOLATE', 6000),
    (frappe_id, 'LAMONTE', 6000),
    (frappe_id, 'FRAPPE CHOCO COCONUT', 6000),
    (frappe_id, 'POP CORN CARAMEL', 6000);

    -- Items: MOJITO
    INSERT INTO public.items (subcategory_id, name, price) VALUES 
    (mojito_id, 'MOJITO STRAWBERRY', 6000),
    (mojito_id, 'CLASSIC MOJITO', 5500),
    (mojito_id, 'MOHITO GRENADINE', 6000),
    (mojito_id, 'MOJITO BLUEBERRY', 6000),
    (mojito_id, 'MOJITO MONGO', 6000),
    (mojito_id, 'MOJITO CHERRY', 6000),
    (mojito_id, 'MOJITO TANGRENA CINNAMON', 6000),
    (mojito_id, 'MOJITO PEACH APRICOT', 6000),
    (mojito_id, 'MOJITO LA MONTE', 6000);

    -- Items: SMOTHIES
    INSERT INTO public.items (subcategory_id, name, price) VALUES 
    (smoothies_id, 'SMOOTHIE STRAWBERRY', 6000),
    (smoothies_id, 'SMOOTHIE PASSION FRUIT', 6000),
    (smoothies_id, 'SMOOTHIE MANGO', 6000),
    (smoothies_id, 'SMOOTHIE PINEAPPLE', 6000),
    (smoothies_id, 'SMOOTHIE GREEN APPLE', 6000),
    (smoothies_id, 'SMOOTHIE BLUEBERRY', 6000),
    (smoothies_id, 'JABUTICABA', 6000),
    (smoothies_id, 'SMOOTHIE BLUEBERRY POMEGRANET', 6000),
    (smoothies_id, 'SMOOTHIE JABUTICABA PEACH', 6000),
    (smoothies_id, 'SMOOTHIE LA MONTE', 6000);

    -- Items: MILKSHAKE
    INSERT INTO public.items (subcategory_id, name, price) VALUES 
    (milkshake_id, 'MILKSHAKE CHOCILAT', 6000),
    (milkshake_id, 'milkshake lotus', 6000),
    (milkshake_id, 'milkshake kindar chocolate', 6000),
    (milkshake_id, 'milkshake caramel', 6000),
    (milkshake_id, 'MILKSHAKE VANILA SCOTCH', 6000),
    (milkshake_id, 'MILKSHAKE PISSION VANILA SHAKE', 6000),
    (milkshake_id, 'MILKSHAKE LA MONTE', 6000),
    (milkshake_id, 'MILKSHAKE STRAWBERRY', 6000);

    -- Items: RED BULL
    INSERT INTO public.items (subcategory_id, name, price) VALUES 
    (redbull_id, 'RED BULL PEACH CURACAO', 6000),
    (redbull_id, 'RED BULL STRAWBERRY', 6000),
    (redbull_id, 'RED BULL LA MONTE', 6000),
    (redbull_id, 'RED BULL BLUEBERRY', 6000),
    (redbull_id, 'CLASSIC REDBULL', 4000);

    -- Items: REFRESHING DRINKS
    INSERT INTO public.items (subcategory_id, name, price) VALUES 
    (refreshing_id, 'PESCA FRAGOLA', 6000),
    (refreshing_id, 'VERDE FRIZZANTE MATCHA', 6000),
    (refreshing_id, 'MARGETA LARANGA', 6000),
    (refreshing_id, 'RUBER AESTIVUS', 6000),
    (refreshing_id, 'TROPSIK', 6000),
    (refreshing_id, 'WATERMELON STRAWBERRY LEMONADA', 6000),
    (refreshing_id, 'MABELLA', 6000);

    -- Items: FRESH JUICE
    INSERT INTO public.items (subcategory_id, name, price) VALUES 
    (fresh_juice_id, 'LEMON & MINT', 5000),
    (fresh_juice_id, 'ORANGE', 5000),
    (fresh_juice_id, 'ORANGE AND MANGO', 6000),
    (fresh_juice_id, 'AVOCADO JUICE', 6000),
    (fresh_juice_id, 'COCTAIL', 6000);

    -- Items: DETOX
    INSERT INTO public.items (subcategory_id, name, price) VALUES 
    (detox_id, 'CLEAR SKIN DETOX', 5000),
    (detox_id, 'BLOOD FLOW DETOX', 6000),
    (detox_id, 'Bloom cleanse', 6000);

    -- Items: TEA
    INSERT INTO public.items (subcategory_id, name, price) VALUES 
    (tea_id, 'ROUGE ICED TEA', 5000),
    (tea_id, 'RASPBERRY ICED TEA', 5000),
    (tea_id, 'PEACH ICED TEA', 5000);

    -- Items: WATER
    INSERT INTO public.items (subcategory_id, name, price) VALUES 
    (water_id, 'water', 1000),
    (water_id, 'TONIC', 2000);

    -- Items: SHISHA
    INSERT INTO public.items (subcategory_id, name, price) VALUES 
    (lamonte_id, 'SHISHA', 10000),
    (lamonte_id, 'limen shisha', 10000),
    (lamonte_id, 'LAMONTE', 10000),
    (lamonte_id, 'APPLE', 10000),
    (lamonte_id, 'mint', 10000),
    (lamonte_id, 'natural', 15000),
    (lamonte_id, 'SHESHA', 5000),
    (lamonte_id, 'FRESH', 15000);

    -- Items: SWEETS AND CAKE
    INSERT INTO public.items (subcategory_id, name, price) VALUES 
    (sweets_id, 'CLASSIC CROISSANT', 5000),
    (sweets_id, 'PISTACHIO CROISSANT', 6000),
    (sweets_id, 'NUTELLA CROISSANT', 6000),
    (sweets_id, 'CINNAMON CROISSANT', 6000),
    (sweets_id, 'CHOCOLATE CAKE', 6500),
    (sweets_id, 'PISTACHIO CAKE', 6500),
    (sweets_id, 'CHEESE CAKE', 6500),
    (sweets_id, 'Cookis', 2000);

    -- Items: TOASTS
    INSERT INTO public.items (subcategory_id, name, price) VALUES 
    (toasts_id, 'CHEESE TOAST', 6000),
    (toasts_id, 'AVOCADO TOAST', 6000),
    (toasts_id, 'TUNA TOAST', 6000),
    (toasts_id, 'SMOKED TURKEY SANDWICH', 7000);

END $$;

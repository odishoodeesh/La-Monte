-- 1. INSERT CATEGORIES
INSERT INTO public.categories (name, display_order) VALUES
('Drinks', 1),
('SHISHA', 2),
('FOOD', 3);

-- 2. INSERT SUBCATEGORIES
-- Drinks
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'HOT DRINKS', 1 FROM public.categories WHERE name = 'Drinks';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'COLD DRINKS', 2 FROM public.categories WHERE name = 'Drinks';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'COLD BREW', 3 FROM public.categories WHERE name = 'Drinks';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'COFFEE FRAPPE', 4 FROM public.categories WHERE name = 'Drinks';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'MOJITO', 5 FROM public.categories WHERE name = 'Drinks';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'SMOTHIES', 6 FROM public.categories WHERE name = 'Drinks';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'MILKSHAKE', 7 FROM public.categories WHERE name = 'Drinks';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'RED BULL', 8 FROM public.categories WHERE name = 'Drinks';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'REFRESHING DRINKS', 9 FROM public.categories WHERE name = 'Drinks';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'FRESH JUICE', 10 FROM public.categories WHERE name = 'Drinks';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'DETOX', 11 FROM public.categories WHERE name = 'Drinks';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'TEA', 12 FROM public.categories WHERE name = 'Drinks';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'WATER', 13 FROM public.categories WHERE name = 'Drinks';

-- SHISHA
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'SHISHA', 1 FROM public.categories WHERE name = 'SHISHA';

-- FOOD
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'SWEETS AND CAKE', 1 FROM public.categories WHERE name = 'FOOD';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'TOASTS', 2 FROM public.categories WHERE name = 'FOOD';


-- 3. INSERT MENU ITEMS
-- HOT DRINKS
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'Double Espresso', 4000 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'Espresso', 3000 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'Americano', 4500 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'Cappuccino', 5000 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'Café Mocha', 6000 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'Hot Chocolate', 4500 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'Matcha Latte', 6000 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'Café Latte', 5000 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'Vanila Latte', 5500 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'IRISH CARAMEL LATTE', 5500 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'ESPPRESO MACCHIATO', 3500 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'milk', 2000 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'CRAMEL LATTE', 5500 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'SPANISH LATTE', 6000 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'CORTADO', 5000 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'COCONUT LATTE', 5500 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'PASSION HOT LEMONADAE', 5000 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'CANNELA LATTE', 5500 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'LAMONTE', 6000 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'Turkish Coffee', 3000 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'PISTACHIO COFFEE', 3000 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'MENENGIÇ COFFEE', 3000 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'V60', 6000 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'HIBISCUS TEA', 3000 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'HOT CHOCOLATE MARSHMALLOW', 6000 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'ESPRESSO AFFOGATO', 5000 FROM public.subcategories WHERE name = 'HOT DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'TEA', 5000 FROM public.subcategories WHERE name = 'HOT DRINKS';

-- COLD DRINKS
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'ICED AMERICANO', 5000 FROM public.subcategories WHERE name = 'COLD DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'COOKIES ICED LATTE', 6000 FROM public.subcategories WHERE name = 'COLD DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'ROSA ICED LATTE', 6000 FROM public.subcategories WHERE name = 'COLD DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'IRISH CRAMEL ICED', 6000 FROM public.subcategories WHERE name = 'COLD DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'HAZELNUT ICED COFFEE', 6000 FROM public.subcategories WHERE name = 'COLD DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'ICED LATTE CLASSIC', 5000 FROM public.subcategories WHERE name = 'COLD DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'WHITE MOCHA ICED LATTE', 6000 FROM public.subcategories WHERE name = 'COLD DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'ICED SPANSH', 6000 FROM public.subcategories WHERE name = 'COLD DRINKS';

-- SHISHA
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'SHISHA', 10000 FROM public.subcategories WHERE name = 'SHISHA';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'SHISHA SPECIAL', 15000 FROM public.subcategories WHERE name = 'SHISHA';

-- SWEETS AND CAKE
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'CLASSIC CROISSANT', 5000 FROM public.subcategories WHERE name = 'SWEETS AND CAKE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'PISTACHIO CROISSANT', 6000 FROM public.subcategories WHERE name = 'SWEETS AND CAKE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'NUTELLA CROISSANT', 6000 FROM public.subcategories WHERE name = 'SWEETS AND CAKE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'CINNAMON CROISSANT', 6000 FROM public.subcategories WHERE name = 'SWEETS AND CAKE';

-- TOASTS
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'CHEESE TOAST', 6000 FROM public.subcategories WHERE name = 'TOASTS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'AVOCADO TOAST', 6000 FROM public.subcategories WHERE name = 'TOASTS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'TUNA TOAST', 6000 FROM public.subcategories WHERE name = 'TOASTS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'SMOKED TURKEY SANDWICH', 7000 FROM public.subcategories WHERE name = 'TOASTS';

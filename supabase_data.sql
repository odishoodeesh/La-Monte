-- 1. INSERT CATEGORIES
INSERT INTO public.categories (name, display_order) VALUES
('DRINKS', 1),
('SHISHA', 2),
('FOOD', 3);

-- 2. INSERT SUBCATEGORIES
-- DRINKS
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'HOT DRINKS', 1 FROM public.categories WHERE name = 'DRINKS';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'COLD DRINKS', 2 FROM public.categories WHERE name = 'DRINKS';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'COLD BREW', 3 FROM public.categories WHERE name = 'DRINKS';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'COFFEE FRAPPE', 4 FROM public.categories WHERE name = 'DRINKS';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'MOJITO', 5 FROM public.categories WHERE name = 'DRINKS';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'SMOTHIES', 6 FROM public.categories WHERE name = 'DRINKS';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'MILKSHAKE', 7 FROM public.categories WHERE name = 'DRINKS';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'RED BULL', 8 FROM public.categories WHERE name = 'DRINKS';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'REFRESHING DRINKS', 9 FROM public.categories WHERE name = 'DRINKS';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'FRESH JUICE', 10 FROM public.categories WHERE name = 'DRINKS';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'DETOX', 11 FROM public.categories WHERE name = 'DRINKS';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'TEA', 12 FROM public.categories WHERE name = 'DRINKS';
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'WATER', 13 FROM public.categories WHERE name = 'DRINKS';

-- SHISHA
INSERT INTO public.subcategories (category_id, name, display_order)
SELECT id, 'Lamonte', 1 FROM public.categories WHERE name = 'SHISHA';

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
SELECT id, 'ICED SPANSH LATTE', 6000 FROM public.subcategories WHERE name = 'COLD DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'ICED LATTE MACRON', 6000 FROM public.subcategories WHERE name = 'COLD DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'ICED MOCHA', 6000 FROM public.subcategories WHERE name = 'COLD DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'ICED CINAMON LATTE', 6000 FROM public.subcategories WHERE name = 'COLD DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'ICED VANILA LATTE', 6000 FROM public.subcategories WHERE name = 'COLD DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'ICED COCONUT LATTE', 6000 FROM public.subcategories WHERE name = 'COLD DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'ICED LATTE STRAWBERRY', 6000 FROM public.subcategories WHERE name = 'COLD DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'ROSA MORANGO ICED LATTE', 6000 FROM public.subcategories WHERE name = 'COLD DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'BUTTER POP CORN ICED LATTE', 6000 FROM public.subcategories WHERE name = 'COLD DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'LAMONTE', 6000 FROM public.subcategories WHERE name = 'COLD DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'ICED CARAMEL LATTE', 6000 FROM public.subcategories WHERE name = 'COLD DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'V60', 6000 FROM public.subcategories WHERE name = 'COLD DRINKS';

-- COLD BREW
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'ORANGE COLD BREW', 6000 FROM public.subcategories WHERE name = 'COLD BREW';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'COLD BREW', 5000 FROM public.subcategories WHERE name = 'COLD BREW';

-- COFFEE FRAPPE
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'FRAPPE MOCHA DARK', 6000 FROM public.subcategories WHERE name = 'COFFEE FRAPPE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'FRAPPE CRAMEL', 6000 FROM public.subcategories WHERE name = 'COFFEE FRAPPE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'FRAPPE CHOCOLATE', 6000 FROM public.subcategories WHERE name = 'COFFEE FRAPPE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'LAMONTE', 6000 FROM public.subcategories WHERE name = 'COFFEE FRAPPE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'FRAPPE CHOCO COCONUT', 6000 FROM public.subcategories WHERE name = 'COFFEE FRAPPE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'POP CORN CARAMEL', 6000 FROM public.subcategories WHERE name = 'COFFEE FRAPPE';

-- MOJITO
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'MOJITO STRAWBERRY', 6000 FROM public.subcategories WHERE name = 'MOJITO';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'CLASSIC MOJITO', 5500 FROM public.subcategories WHERE name = 'MOJITO';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'MOHITO GRENADINE', 6000 FROM public.subcategories WHERE name = 'MOJITO';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'MOJITO BLUEBERRY', 6000 FROM public.subcategories WHERE name = 'MOJITO';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'MOJITO MONGO', 6000 FROM public.subcategories WHERE name = 'MOJITO';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'MOJITO CHERRY', 6000 FROM public.subcategories WHERE name = 'MOJITO';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'MOJITO TANGRENA CINNAMON', 6000 FROM public.subcategories WHERE name = 'MOJITO';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'MOJITO PEACH APRICOT', 6000 FROM public.subcategories WHERE name = 'MOJITO';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'MOJITO LA MONTE', 6000 FROM public.subcategories WHERE name = 'MOJITO';

-- SMOTHIES
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'SMOOTHIE STRAWBERRY', 6000 FROM public.subcategories WHERE name = 'SMOTHIES';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'SMOOTHIE PASSION FRUIT', 6000 FROM public.subcategories WHERE name = 'SMOTHIES';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'SMOOTHIE MANGO', 6000 FROM public.subcategories WHERE name = 'SMOTHIES';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'SMOOTHIE PINEAPPLE', 6000 FROM public.subcategories WHERE name = 'SMOTHIES';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'SMOOTHIE GREEN APPLE', 6000 FROM public.subcategories WHERE name = 'SMOTHIES';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'SMOOTHIE BLUEBERRY', 6000 FROM public.subcategories WHERE name = 'SMOTHIES';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'JABUTICABA', 6000 FROM public.subcategories WHERE name = 'SMOTHIES';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'SMOOTHIE BLUEBERRY POMEGRANET', 6000 FROM public.subcategories WHERE name = 'SMOTHIES';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'SMOOTHIE JABUTICABA PEACH', 6000 FROM public.subcategories WHERE name = 'SMOTHIES';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'SMOOTHIE LA MONTE', 6000 FROM public.subcategories WHERE name = 'SMOTHIES';

-- MILKSHAKE
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'MILKSHAKE CHOCILAT', 6000 FROM public.subcategories WHERE name = 'MILKSHAKE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'milkshake lotus', 6000 FROM public.subcategories WHERE name = 'MILKSHAKE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'milkshake kindar chocolate', 6000 FROM public.subcategories WHERE name = 'MILKSHAKE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'milkshake caramel', 6000 FROM public.subcategories WHERE name = 'MILKSHAKE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'MILKSHAKE VANILA SCOTCH', 6000 FROM public.subcategories WHERE name = 'MILKSHAKE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'MILKSHAKE PISSION VANILA SHAKE', 6000 FROM public.subcategories WHERE name = 'MILKSHAKE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'MILKSHAKE LA MONTE', 6000 FROM public.subcategories WHERE name = 'MILKSHAKE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'MILKSHAKE STRAWBERRY', 6000 FROM public.subcategories WHERE name = 'MILKSHAKE';

-- RED BULL
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'RED BULL PEACH CURACAO', 6000 FROM public.subcategories WHERE name = 'RED BULL';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'RED BULL STRAWBERRY', 6000 FROM public.subcategories WHERE name = 'RED BULL';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'RED BULL LA MONTE', 6000 FROM public.subcategories WHERE name = 'RED BULL';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'RED BULL BLUEBERRY', 6000 FROM public.subcategories WHERE name = 'RED BULL';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'CLASSIC REDBULL', 4000 FROM public.subcategories WHERE name = 'RED BULL';

-- REFRESHING DRINKS
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'PESCA FRAGOLA', 6000 FROM public.subcategories WHERE name = 'REFRESHING DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'VERDE FRIZZANTE MATCHA', 6000 FROM public.subcategories WHERE name = 'REFRESHING DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'MARGETA LARANGA', 6000 FROM public.subcategories WHERE name = 'REFRESHING DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'RUBER AESTIVUS', 6000 FROM public.subcategories WHERE name = 'REFRESHING DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'TROPSIK', 6000 FROM public.subcategories WHERE name = 'REFRESHING DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'WATERMELON STRAWBERRY LEMONADA', 6000 FROM public.subcategories WHERE name = 'REFRESHING DRINKS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'MABELLA', 6000 FROM public.subcategories WHERE name = 'REFRESHING DRINKS';

-- FRESH JUICE
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'LEMON & MINT', 5000 FROM public.subcategories WHERE name = 'FRESH JUICE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'ORANGE', 5000 FROM public.subcategories WHERE name = 'FRESH JUICE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'ORANGE AND MANGO', 6000 FROM public.subcategories WHERE name = 'FRESH JUICE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'AVOCADO JUICE', 6000 FROM public.subcategories WHERE name = 'FRESH JUICE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'COCTAIL', 6000 FROM public.subcategories WHERE name = 'FRESH JUICE';

-- DETOX
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'CLEAR SKIN DETOX', 5000 FROM public.subcategories WHERE name = 'DETOX';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'BLOOD FLOW DETOX', 6000 FROM public.subcategories WHERE name = 'DETOX';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'Bloom cleanse', 6000 FROM public.subcategories WHERE name = 'DETOX';

-- TEA
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'ROUGE ICED TEA', 5000 FROM public.subcategories WHERE name = 'TEA';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'RASPBERRY ICED TEA', 5000 FROM public.subcategories WHERE name = 'TEA';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'PEACH ICED TEA', 5000 FROM public.subcategories WHERE name = 'TEA';

-- WATER
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'water', 1000 FROM public.subcategories WHERE name = 'WATER';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'TONIC', 2000 FROM public.subcategories WHERE name = 'WATER';

-- SHISHA
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'SHISHA', 10000 FROM public.subcategories WHERE name = 'Lamonte';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'limen shisha', 10000 FROM public.subcategories WHERE name = 'Lamonte';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'LAMONTE', 10000 FROM public.subcategories WHERE name = 'Lamonte';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'APPLE', 10000 FROM public.subcategories WHERE name = 'Lamonte';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'mint', 10000 FROM public.subcategories WHERE name = 'Lamonte';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'natural', 15000 FROM public.subcategories WHERE name = 'Lamonte';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'SHESHA', 5000 FROM public.subcategories WHERE name = 'Lamonte';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'FRESH', 15000 FROM public.subcategories WHERE name = 'Lamonte';

-- SWEETS AND CAKE
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'CLASSIC CROISSANT', 5000 FROM public.subcategories WHERE name = 'SWEETS AND CAKE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'PISTACHIO CROISSANT', 6000 FROM public.subcategories WHERE name = 'SWEETS AND CAKE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'NUTELLA CROISSANT', 6000 FROM public.subcategories WHERE name = 'SWEETS AND CAKE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'CINNAMON CROISSANT', 6000 FROM public.subcategories WHERE name = 'SWEETS AND CAKE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'CHOCOLATE CAKE', 6500 FROM public.subcategories WHERE name = 'SWEETS AND CAKE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'PISTACHIO CAKE', 6500 FROM public.subcategories WHERE name = 'SWEETS AND CAKE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'CHEESE CAKE', 6500 FROM public.subcategories WHERE name = 'SWEETS AND CAKE';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'Cookis', 2000 FROM public.subcategories WHERE name = 'SWEETS AND CAKE';

-- TOASTS
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'CHEESE TOAST', 6000 FROM public.subcategories WHERE name = 'TOASTS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'AVOCADO TOAST', 6000 FROM public.subcategories WHERE name = 'TOASTS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'TUNA TOAST', 6000 FROM public.subcategories WHERE name = 'TOASTS';
INSERT INTO public.menu_items (subcategory_id, name, price)
SELECT id, 'SMOKED TURKEY SANDWICH', 7000 FROM public.subcategories WHERE name = 'TOASTS';

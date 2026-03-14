-- Clear existing menu items
TRUNCATE public.menu_items;

-- HOT DRINKS
INSERT INTO public.menu_items (name, price, category, subcategory) VALUES
('Double Espresso', 4000, 'Drinks', 'HOT DRINKS'),
('Espresso', 3000, 'Drinks', 'HOT DRINKS'),
('Americano', 4500, 'Drinks', 'HOT DRINKS'),
('Cappuccino', 5000, 'Drinks', 'HOT DRINKS'),
('Café Mocha', 6000, 'Drinks', 'HOT DRINKS'),
('Hot Chocolate', 4500, 'Drinks', 'HOT DRINKS'),
('Matcha Latte', 6000, 'Drinks', 'HOT DRINKS'),
('Café Latte', 5000, 'Drinks', 'HOT DRINKS'),
('Vanila Latte', 5500, 'Drinks', 'HOT DRINKS'),
('IRISH CARAMEL LATTE', 5500, 'Drinks', 'HOT DRINKS'),
('ESPPRESO MACCHIATO', 3500, 'Drinks', 'HOT DRINKS'),
('milk', 2000, 'Drinks', 'HOT DRINKS'),
('CRAMEL LATTE', 5500, 'Drinks', 'HOT DRINKS'),
('SPANISH LATTE', 6000, 'Drinks', 'HOT DRINKS'),
('CORTADO', 5000, 'Drinks', 'HOT DRINKS'),
('COCONUT LATTE', 5500, 'Drinks', 'HOT DRINKS'),
('PASSION HOT LEMONADAE', 5000, 'Drinks', 'HOT DRINKS'),
('CANNELA LATTE', 5500, 'Drinks', 'HOT DRINKS'),
('LAMONTE', 6000, 'Drinks', 'HOT DRINKS'),
('Turkish Coffee', 3000, 'Drinks', 'HOT DRINKS'),
('PISTACHIO COFFEE', 3000, 'Drinks', 'HOT DRINKS'),
('MENENGIÇ COFFEE', 3000, 'Drinks', 'HOT DRINKS'),
('V60', 6000, 'Drinks', 'HOT DRINKS'),
('HIBISCUS TEA', 3000, 'Drinks', 'HOT DRINKS'),
('HOT CHOCOLATE MARSHMALLOW', 6000, 'Drinks', 'HOT DRINKS'),
('ESPRESSO AFFOGATO', 5000, 'Drinks', 'HOT DRINKS'),
('TEA', 5000, 'Drinks', 'HOT DRINKS');

-- COLD DRINKS
INSERT INTO public.menu_items (name, price, category, subcategory) VALUES
('ICED AMERICANO', 5000, 'Drinks', 'COLD DRINKS'),
('COOKIES ICED LATTE', 6000, 'Drinks', 'COLD DRINKS'),
('ROSA ICED LATTE', 6000, 'Drinks', 'COLD DRINKS'),
('IRISH CRAMEL ICED', 6000, 'Drinks', 'COLD DRINKS'),
('HAZELNUT ICED COFFEE', 6000, 'Drinks', 'COLD DRINKS'),
('ICED LATTE CLASSIC', 5000, 'Drinks', 'COLD DRINKS'),
('WHITE MOCHA ICED LATTE', 6000, 'Drinks', 'COLD DRINKS'),
('ICED SPANSH LATTE', 6000, 'Drinks', 'COLD DRINKS'),
('ICED LATTE MACRON', 6000, 'Drinks', 'COLD DRINKS'),
('ICED MOCHA', 6000, 'Drinks', 'COLD DRINKS'),
('ICED CINAMON LATTE', 6000, 'Drinks', 'COLD DRINKS'),
('ICED VANILA LATTE', 6000, 'Drinks', 'COLD DRINKS'),
('ICED COCONUT LATTE', 6000, 'Drinks', 'COLD DRINKS'),
('ICED LATTE STRAWBERRY', 6000, 'Drinks', 'COLD DRINKS'),
('ROSA MORANGO ICED LATTE', 6000, 'Drinks', 'COLD DRINKS'),
('BUTTER POP CORN ICED LATTE', 6000, 'Drinks', 'COLD DRINKS'),
('LAMONTE', 6000, 'Drinks', 'COLD DRINKS'),
('ICED CARAMEL LATTE', 6000, 'Drinks', 'COLD DRINKS'),
('V60', 6000, 'Drinks', 'COLD DRINKS');

-- COLD BREW
INSERT INTO public.menu_items (name, price, category, subcategory) VALUES
('ORANGE COLD BREW', 6000, 'Drinks', 'COLD BREW'),
('COLD BREW', 5000, 'Drinks', 'COLD BREW');

-- COFFEE FRAPPE
INSERT INTO public.menu_items (name, price, category, subcategory) VALUES
('FRAPPE MOCHA DARK', 6000, 'Drinks', 'COFFEE FRAPPE'),
('FRAPPE CRAMEL', 6000, 'Drinks', 'COFFEE FRAPPE'),
('FRAPPE CHOCOLATE', 6000, 'Drinks', 'COFFEE FRAPPE'),
('LAMONTE', 6000, 'Drinks', 'COFFEE FRAPPE'),
('FRAPPE CHOCO COCONUT', 6000, 'Drinks', 'COFFEE FRAPPE'),
('POP CORN CARAMEL', 6000, 'Drinks', 'COFFEE FRAPPE');

-- MOJITO
INSERT INTO public.menu_items (name, price, category, subcategory) VALUES
('MOJITO STRAWBERRY', 6000, 'Drinks', 'MOJITO'),
('CLASSIC MOJITO', 5500, 'Drinks', 'MOJITO'),
('MOHITO GRENADINE', 6000, 'Drinks', 'MOJITO'),
('MOJITO BLUEBERRY', 6000, 'Drinks', 'MOJITO'),
('MOJITO MONGO', 6000, 'Drinks', 'MOJITO'),
('MOJITO CHERRY', 6000, 'Drinks', 'MOJITO'),
('MOJITO TANGRENA CINNAMON', 6000, 'Drinks', 'MOJITO'),
('MOJITO PEACH APRICOT', 6000, 'Drinks', 'MOJITO'),
('MOJITO LA MONTE', 6000, 'Drinks', 'MOJITO');

-- SMOTHIES
INSERT INTO public.menu_items (name, price, category, subcategory) VALUES
('SMOOTHIE STRAWBERRY', 6000, 'Drinks', 'SMOTHIES'),
('SMOOTHIE PASSION FRUIT', 6000, 'Drinks', 'SMOTHIES'),
('SMOOTHIE MANGO', 6000, 'Drinks', 'SMOTHIES'),
('SMOOTHIE PINEAPPLE', 6000, 'Drinks', 'SMOTHIES'),
('SMOOTHIE GREEN APPLE', 6000, 'Drinks', 'SMOTHIES'),
('SMOOTHIE BLUEBERRY', 6000, 'Drinks', 'SMOTHIES'),
('JABUTICABA', 6000, 'Drinks', 'SMOTHIES'),
('SMOOTHIE BLUEBERRY POMEGRANET', 6000, 'Drinks', 'SMOTHIES'),
('SMOOTHIE JABUTICABA PEACH', 6000, 'Drinks', 'SMOTHIES'),
('SMOOTHIE LA MONTE', 6000, 'Drinks', 'SMOTHIES');

-- MILKSHAKE
INSERT INTO public.menu_items (name, price, category, subcategory) VALUES
('MILKSHAKE CHOCILAT', 6000, 'Drinks', 'MILKSHAKE'),
('milkshake lotus', 6000, 'Drinks', 'MILKSHAKE'),
('milkshake kindar chocolate', 6000, 'Drinks', 'MILKSHAKE'),
('milkshake caramel', 6000, 'Drinks', 'MILKSHAKE'),
('MILKSHAKE VANILA SCOTCH', 6000, 'Drinks', 'MILKSHAKE'),
('MILKSHAKE PISSION VANILA SHAKE', 6000, 'Drinks', 'MILKSHAKE'),
('MILKSHAKE LA MONTE', 6000, 'Drinks', 'MILKSHAKE'),
('MILKSHAKE STRAWBERRY', 6000, 'Drinks', 'MILKSHAKE');

-- RED BULL
INSERT INTO public.menu_items (name, price, category, subcategory) VALUES
('RED BULL PEACH CURACAO', 6000, 'Drinks', 'RED BULL'),
('RED BULL STRAWBERRY', 6000, 'Drinks', 'RED BULL'),
('RED BULL LA MONTE', 6000, 'Drinks', 'RED BULL'),
('RED BULL BLUEBERRY', 6000, 'Drinks', 'RED BULL'),
('CLASSIC REDBULL', 4000, 'Drinks', 'RED BULL');

-- REFRESHING DRINKS
INSERT INTO public.menu_items (name, price, category, subcategory) VALUES
('PESCA FRAGOLA', 6000, 'Drinks', 'REFRESHING DRINKS'),
('VERDE FRIZZANTE MATCHA', 6000, 'Drinks', 'REFRESHING DRINKS'),
('MARGETA LARANGA', 6000, 'Drinks', 'REFRESHING DRINKS'),
('RUBER AESTIVUS', 6000, 'Drinks', 'REFRESHING DRINKS'),
('TROPSIK', 6000, 'Drinks', 'REFRESHING DRINKS'),
('WATERMELON STRAWBERRY LEMONADA', 6000, 'Drinks', 'REFRESHING DRINKS'),
('MABELLA', 6000, 'Drinks', 'REFRESHING DRINKS');

-- FRESH JUICE
INSERT INTO public.menu_items (name, price, category, subcategory) VALUES
('LEMON & MINT', 5000, 'Drinks', 'FRESH JUICE'),
('ORANGE', 5000, 'Drinks', 'FRESH JUICE'),
('ORANGE AND MANGO', 6000, 'Drinks', 'FRESH JUICE'),
('AVOCADO JUICE', 6000, 'Drinks', 'FRESH JUICE'),
('COCTAIL', 6000, 'Drinks', 'FRESH JUICE');

-- DETOX
INSERT INTO public.menu_items (name, price, category, subcategory) VALUES
('CLEAR SKIN DETOX', 5000, 'Drinks', 'DETOX'),
('BLOOD FLOW DETOX', 6000, 'Drinks', 'DETOX'),
('Bloom cleanse', 6000, 'Drinks', 'DETOX');

-- TEA
INSERT INTO public.menu_items (name, price, category, subcategory) VALUES
('ROUGE ICED TEA', 5000, 'Drinks', 'TEA'),
('RASPBERRY ICED TEA', 5000, 'Drinks', 'TEA'),
('PEACH ICED TEA', 5000, 'Drinks', 'TEA');

-- WATER
INSERT INTO public.menu_items (name, price, category, subcategory) VALUES
('water', 1000, 'Drinks', 'WATER'),
('TONIC', 2000, 'Drinks', 'WATER');

-- SHISHA
INSERT INTO public.menu_items (name, price, category, subcategory) VALUES
('SHISHA', 10000, 'SHISHA', 'SHISHA'),
('limen shisha', 10000, 'SHISHA', 'SHISHA'),
('LAMONTE', 10000, 'SHISHA', 'SHISHA'),
('APPLE', 10000, 'SHISHA', 'SHISHA'),
('mint', 10000, 'SHISHA', 'SHISHA'),
('natural', 15000, 'SHISHA', 'SHISHA'),
('SHESHA', 5000, 'SHISHA', 'SHISHA'),
('FRESH', 15000, 'SHISHA', 'SHISHA');

-- SWEETS AND CAKE
INSERT INTO public.menu_items (name, price, category, subcategory) VALUES
('CLASSIC CROISSANT', 5000, 'FOOD', 'SWEETS AND CAKE'),
('PISTACHIO CROISSANT', 6000, 'FOOD', 'SWEETS AND CAKE'),
('NUTELLA CROISSANT', 6000, 'FOOD', 'SWEETS AND CAKE'),
('CINNAMON CROISSANT', 6000, 'FOOD', 'SWEETS AND CAKE'),
('CHOCOLATE CAKE', 6500, 'FOOD', 'SWEETS AND CAKE'),
('PISTACHIO CAKE', 6500, 'FOOD', 'SWEETS AND CAKE'),
('CHEESE CAKE', 6500, 'FOOD', 'SWEETS AND CAKE'),
('Cookis', 2000, 'FOOD', 'SWEETS AND CAKE');

-- TOASTS
INSERT INTO public.menu_items (name, price, category, subcategory) VALUES
('CHEESE TOAST', 6000, 'FOOD', 'TOASTS'),
('AVOCADO TOAST', 6000, 'FOOD', 'TOASTS'),
('TUNA TOAST', 6000, 'FOOD', 'TOASTS'),
('SMOKED TURKEY SANDWICH', 7000, 'FOOD', 'TOASTS');

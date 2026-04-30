USE recipe_budgeter;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE recipe_item;
TRUNCATE TABLE recipe;
TRUNCATE TABLE inventory;
TRUNCATE TABLE mass_unit;
TRUNCATE TABLE volume_unit;
TRUNCATE TABLE unit;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- Users
INSERT INTO users (userID, username, password) VALUES
(1, 'testuser', 'password123');

-- Units
INSERT INTO unit (id, unitName, unitType) VALUES
(1, 'kg', 'mass'),
(2, 'g', 'mass'),
(3, 'L', 'volume'),
(4, 'ml', 'volume'),
(5, 'ea', 'ea');

-- Unit conversions
INSERT INTO mass_unit (unitID, kgConversion) VALUES
(1, 1.000000),
(2, 0.001000);

INSERT INTO volume_unit (unitID, literConversion) VALUES
(3, 1.000000),
(4, 0.001000);

-- Inventory
INSERT INTO inventory (itemID, itemName, stock, price, size, unitID) VALUES
(1, 'Flour', 20, 3.50, 1.00, 1),
(2, 'Sugar', 15, 2.99, 1.00, 1),
(3, 'Salt', 30, 1.25, 1.00, 1),
(4, 'Milk', 12, 3.49, 1.00, 3),
(5, 'Olive Oil', 8, 8.99, 1.00, 3),
(6, 'Butter', 10, 4.50, 500.00, 2),
(7, 'Eggs', 24, 3.99, 12.00, 5),
(8, 'Chicken Breast', 10, 9.99, 1.00, 1),
(9, 'Rice', 18, 4.99, 2.00, 1),
(10, 'Pasta', 20, 1.99, 500.00, 2),
(11, 'Tomatoes', 25, 2.99, 1.00, 1),
(12, 'Onions', 20, 1.99, 1.00, 1),
(13, 'Garlic', 15, 0.99, 1.00, 5),
(14, 'Cheese', 10, 5.49, 500.00, 2);

-- Recipes
INSERT INTO recipe (recipeID, recipeName, description, userID) VALUES
(1, 'Pasta Alfredo', 'Creamy pasta with butter and cheese.', 1),
(2, 'Chicken Rice Bowl', 'Chicken with rice, tomatoes, and onions.', 1);

-- Recipe ingredients
INSERT INTO recipe_item (recipeID, itemID, quantity, unitID) VALUES
(1, 10, 200.00, 2),
(1, 6, 100.00, 2),
(1, 14, 100.00, 2),

(2, 8, 0.50, 1),
(2, 9, 0.25, 1),
(2, 11, 0.20, 1),
(2, 12, 0.10, 1);
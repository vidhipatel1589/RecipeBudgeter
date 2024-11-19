const express = require('express')
const app = express()
const cors = require('cors')
const mysql = require('mysql2')

require('dotenv').config()
app.use(cors())
app.use(express.json())

///////////////////////////////////////////////////////////////////////////////////////

//                              SQL Server Connection  

///////////////////////////////////////////////////////////////////////////////////////

const connection = mysql.createConnection({
  host: process.env.mysqlHost,
  user: process.env.mysqlUser,  
  password: process.env.mysqlPassword,
  database: process.env.mysqlDatabase, 
  port: 3306                
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database as ID', connection.threadId);
});



///////////////////////////////////////////////////////////////////////////////////////

//                              API END POINTS  

///////////////////////////////////////////////////////////////////////////////////////

// Create New User
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
    connection.query(query, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to register user' });
        } else {
            res.status(201).json({ message: 'User registered successfully' });
        }
    });
});

// Check Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    connection.query(query, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to login' });
        } else if (results.length === 0) {
            res.status(401).json({ message: 'Invalid credentials' });
        } else {
            const user = results[0];
            res.send({ 
                message: 'Login successful', 
                userID: user.userID 
            });
        }
    });
});

// Delete User
app.post('/api/deleteUser', (req, res) => {
    const { username } = req.body
    const query = `DELETE FROM users WHERE username = ?`
    connection.query(query, [username], (err, results) => {
        if (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to delete user' })
        } else {
        res.status(200).json({ message: 'User deleted successfully' })
        }
    })
})

// Get All Recipes
app.get('/api/getAllRecipes', (req, res) => {
    const query = `SELECT * FROM recipe`
    connection.query(query, (err, results) => {
        if (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to get recipes' })
        } else {
        res.status(200).json(results)
        }
    })
})

// Fetch Recipes
app.post('/api/userRecipe', (req, res) => {
    const userID = req.body.userID;
    
    const query = `
        SELECT 
            r.recipeID, 
            r.recipeName, 
            r.description
        FROM recipe r
    `;
    
    connection.query(query, (err, recipes) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Failed to fetch recipes' });
        }

        // If no recipes found, return an empty array
        if (recipes.length === 0) {
            return res.status(200).json([]);
        }

        // Fetch ingredients for each recipe
        const recipeIDs = recipes.map(recipe => recipe.recipeID);
        const ingredientQuery = `
            SELECT 
                ri.recipeID,
                ri.itemID AS ingredientID,
                i.itemName AS ingredientName,
                ri.quantity,
                ri.unitID,
                u.unitName,
                i.price,
                i.size,
                i.stock,
                CASE 
                    WHEN u.unitType = 'ea' THEN 1
                    WHEN u.unitType = 'mass' THEN mu.kgConversion
                    WHEN u.unitType = 'volume' THEN vu.literConversion
                    ELSE 1
                END AS unitConversion
            FROM recipe_item ri
            JOIN inventory i ON ri.itemID = i.itemID
            JOIN unit u ON ri.unitID = u.id
            LEFT JOIN mass_unit mu ON u.id = mu.unitID AND u.unitType = 'mass'
            LEFT JOIN volume_unit vu ON u.id = vu.unitID AND u.unitType = 'volume'
            WHERE ri.recipeID IN (?)
        `;


        connection.query(ingredientQuery, [recipeIDs], (err, ingredients) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Failed to fetch ingredients' });
            }

            // Map ingredients to their corresponding recipes and calculate totalPrice
            const recipeMap = recipes.map(recipe => {
                const recipeIngredients = ingredients.filter(ing => ing.recipeID === recipe.recipeID);
                const totalPrice = 0.00;

                return {
                    recipeID: recipe.recipeID,
                    recipeName: recipe.recipeName,
                    description: recipe.description,
                    totalPrice: totalPrice.toFixed(2),
                    ingredients: recipeIngredients.map(ing => ({
                        ingredientID: ing.ingredientID,
                        ingredientName: ing.ingredientName,
                        quantity: ing.quantity,
                        unitID: ing.unitID,
                        unitName: ing.unitName,
                        price: ing.price,
                        size: ing.size,
                        stock: ing.stock,
                        unitConversion: ing.unitConversion
                    }))
                };
            });

            res.status(200).json(recipeMap);
        });
    });
});


// Add New Recipe
app.post('/api/addRecipe', (req, res) => {
    const { name, description, userID } = req.body
    const query = `INSERT INTO recipe (recipeName, description, userID) VALUES (?, ?, ?)`
    connection.query(query, [name, description, userID], (err, results) => {
        if (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to add recipe' })
        } else {
            res.status(201).json({ 
                message: 'Recipe added successfully', 
                recipeID: results.insertId 
            });
        }
    })
})

// Update Recipe
app.post('/api/updateRecipe', (req, res) => {
    const { recipeID } = req.body
    const query = `UPDATE recipe SET recipeName = ?, description = ? WHERE recipeID = ?`
    connection.query(query, [recipeName, description, recipeID], (err, results) => {
        if (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to update recipe' })
        } else {
        res.status(200).json({ message: 'Recipe updated successfully' })
        }
    })
})

// Delete Recipe
app.post('/api/deleteRecipe', (req, res) => {
  const { recipeID } = req.body
  const query = `DELETE FROM recipe WHERE recipeID = ?`
  connection.query(query, [recipeID], (err, results) => {
      if (err) {
      console.error(err)
      res.status(500).json({ message: 'Failed to delete recipe' })
      } else {
      res.status(200).json({ message: 'Recipe deleted successfully' })
      }
  })
})

// Add Item to Recipe
app.post('/api/addRecipeItem', (req, res) => {
    const { recipeID, itemID, quantity, unitID } = req.body
    const query = `INSERT INTO recipe_item (recipeID, itemID, quantity, unitID) VALUES (?, ?, ?)`
    connection.query(query, [recipeID, itemID, quantity, unitID], (err, results) => {
        if (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to add recipe item' })
        } else {
        res.status(201).json({ message: 'Recipe item added successfully' })
        }
    })
})

// Delete Item from Recipe
app.post('/api/deleteRecipeItem', (req, res) => {
    const { recipeID, itemID } = req.body
    const query = `DELETE FROM recipe_item WHERE recipeID = ? AND itemID = ?`
    connection.query(query, [recipeID, itemID], (err, results) => {
        if (err) {
        console.error(err)
        res.status(500).json({ message: 'Failed to delete recipe item' })
        } 
        else {
        res.status(200).json({ message: 'Recipe item deleted successfully' })
        }
    })
})

// Get Conversion for Specific Unit
app.get('/api/getConversion', (req, res) => {
    let type = '';
    const { unitID } = req.query;
    const query = `SELECT unitType FROM unit WHERE unitID = ?`
    connection.query(query, [unitID], (err, results) => {
        if (err) {
            console.error(err)
            res.status(500).json({ message: 'Failed to get conversion' })
        } 
        else {
            type = results.length > 0 ? results[0].unitType : null;
        }
    })
    
    if (type === 'mass') {
        const query = 'SELECT kgConversion from mass_unit WHERE unitID = ?'
        connection.query(query, [unitID], (err, results) => {
            if (err) {
                console.error(err)
                res.status(500).json({ message: 'Failed to get conversion' })
            } 
            else {
                res.status(200).json(results)
            }
        })
    }
    else if (type === 'volume') {
        const query = 'SELECT literConversion from volume_unit WHERE unitID = ?'
        connection.query(query, [unitID], (err, results) => {
            if (err) {
                console.error(err)
                res.status(500).json({ message: 'Failed to get conversion' })
            } 
            else {
                res.status(200).json(results)
            }
        })
    }
    else {
        res.status(500).json({ message: 'Failed to get conversion' })
    }
})

//get units
app.get ('/api/getItemUnit', (req, res) => {
    res.status(200).json({ message: 'Get Item Unit' })
})

app.listen(1337, () => {
    console.log('Server started on 1337')
})
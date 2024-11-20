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
                ri.unitID AS RecipeUnitID,
                u.unitName AS RecipeUnit,
                i.price,
                i.size,
                i.stock,
                i.unitID AS InventoryUnitID,
                inv_u.unitName AS InventoryUnit,
                CASE 
                    WHEN u.unitType = 'ea' THEN 1
                    WHEN u.unitType = 'mass' THEN mu.kgConversion
                    WHEN u.unitType = 'volume' THEN vu.literConversion
                    ELSE 1
                END AS unitConversion
            FROM recipe_item ri
            JOIN inventory i ON ri.itemID = i.itemID
            JOIN unit u ON ri.unitID = u.id
            JOIN unit inv_u ON i.unitID = inv_u.id
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
                const totalPrice = recipeIngredients.reduce((sum, ing) => sum + (ing.price * ing.quantity), 0);
    
                return {
                    recipeID: recipe.recipeID,
                    recipeName: recipe.recipeName,
                    description: recipe.description,
                    totalPrice: totalPrice.toFixed(2),
                    ingredients: recipeIngredients.map(ing => ({
                        ingredientID: ing.ingredientID,
                        ingredientName: ing.ingredientName,
                        quantity: ing.quantity,
                        RecipeUnitID: ing.RecipeUnitID,
                        RecipeUnit: ing.RecipeUnit,
                        InventoryUnitID: ing.InventoryUnitID,
                        InventoryUnit: ing.InventoryUnit,
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
    const { recipeID, recipeName, description, ingredients } = req.body
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

//Delete Recipe with DELETE Rest request
app.delete('/api-v2/deleteRecipe', (req, res) => {
    const { recipeID, userID } = req.body;
    const query1 = `SELECT userID FROM recipe WHERE recipeID = ?`;
    connection.query(query1, [recipeID], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to delete recipe' });
        } else if (results.length === 0) {
            res.status(204).json({ message: 'Recipe not found' });
        } else if (results[0].userID !== userID) {
            res.status(403).json({ message: 'Unauthorized to delete recipe' });
        } else {
            const query2 = `DELETE FROM recipe WHERE recipeID = ?`;
            connection.query(query2, [recipeID], (err, results) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ message: 'Failed to delete recipe' });
                } else {
                    res.status(200).json({ message: 'Recipe deleted successfully' });
                }
            });
        }
    });
})

// Add Item to Recipe
app.post('/api/addRecipeItem', (req, res) => {
    const { recipeID, itemID, quantity, unitID } = req.body
    const query = `INSERT INTO recipe_item (recipeID, itemID, quantity, unitID) VALUES (?, ?, ?, ?)`
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

// Get All Items
app.get('/api/getAllItems', (req, res) => {
    const query = `SELECT itemID, itemName FROM inventory`;
    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to get items' });
        } else {
            const transformedResults = results.reduce((acc, item) => {
                acc[item.itemName] = item.itemID;
                return acc;
            }, {});

            res.status(200).json(transformedResults);
        }
    });
});

// Get All Items
app.get('/api-v2/getAllItems', (req, res) => {
    const query = `SELECT itemID, itemName, unitID FROM inventory`;
    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to get items' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Get All Unit Conversions
app.get('/api/getAllConversions', (req, res) => {
    const query = `
        SELECT 
            unit.id AS unitID, 
            unit.unitName AS unitName, 
            COALESCE(mass_unit.kgConversion, volume_unit.literConversion) AS conversion
        FROM unit
        LEFT JOIN mass_unit ON unit.id = mass_unit.unitID
        LEFT JOIN volume_unit ON unit.id = volume_unit.unitID;
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to get conversions' });
        } else {
            const conversions = {};
            results.forEach(row => {
                conversions[row.unitName] = {
                    unitID: row.unitID,
                    conversion: row.conversion
                };
            });
            res.status(200).json(conversions);
        }
    });
});

//Get All Units
app.get('/api/getAllUnits', (req, res) => {
    const query = `SELECT * FROM unit`
    connection.query(query, (err, results) => {
        if (err) {
            console.error(err)
            res.status(500).json({ message: 'Failed to get units' })
        }
        else {
            res.status(200).json({
                units: results
            })
        }
    })
})

// Get Units by Type
app.get('/api/getUnitsByType', (req, res) => {
    const query = `SELECT * FROM unit`
    connection.query(query, (err, results) => {
        if (err) {
            console.error(err)
            res.status(500).json({ message: 'Failed to get units' })
        }
        else {
            const unitsByType = results.reduce ((acc, unit) => {
                const { id, unitType, unitName } = unit;
                if (!acc[unitType]) {
                    acc[unitType] = []
                }
                acc[unitType].push({id, unitName})
                return acc
            }, {})
            res.status(200).json({
                units: unitsByType 
            })
        }
    })
})

app.get('/api-v2/user/recipes', (req, res) => {
    const query = `SELECT recipeID, recipeName FROM recipe WHERE userID = ?`;
    const userID = Number(req.query.userID);
    connection.query(query, [userID], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to get user recipes' });
        } else {
            res.status(200).json(results);
        }
    });
})
app.get('/api-v2/recipe/items', (req, res) => {
    const recipeID = Number(req.query.recipeID);
    const query = `SELECT itemID, quantity, unitID FROM recipe_item WHERE recipeID = ?`;
    connection.query(query, [recipeID], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to get recipe items' });
        } else {
            res.status(200).json(results);
        }
    });
})

app.get('/api-v2/recipe', (req, res) => {
    const recipeID = Number(req.query.recipeID);
    const query = `SELECT recipeID, recipeName, description, userID FROM recipe WHERE recipeID = ?`;
    connection.query(query, [recipeID], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to get recipe' });
        } else {
            res.status(200).json(results);
        }
    });
});

function validateUnits(oldUnits, newUnits) {
    const query = `SELECT id, unitType FROM unit WHERE id IN (?)`;
    const oldUnitIDs = oldUnits.map(unit => unit.unitID);
    oldUnitIDs.sort();
    const newUnitIDs = newUnits.map(unit => unit.unitID);
    newUnitIDs.sort();
    const allUnitIDs = [... new Set([...oldUnitIDs, ...newUnitIDs])];
    if (allUnitIDs.length === 0) {
        return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
        connection.query(query, [allUnitIDs], (err, results) => {
            if(err) {
                console.error(err);
                reject('Failed to validate units');
                return;
            }

            const unitTypeMap = results.reduce((map, row) => {
                map[row.unitID] = row.unitType;
                return map;
            }, {});

            for (let i = 0; i < oldUnits.length; i++) {
                const oldUnitID = oldUnits[i].unitID;
                const newUnitID = newUnits[i].unitID;

                if (unitTypeMap[oldUnitID] !== unitTypeMap[newUnitID]) {
                    resolve(false);
                    return;
                }
            }
            resolve(true);
        });
    });

}

function recipeItemDiff(oldItems, newItems) {
    const oldMap = new Map(oldItems.map(item => [item.itemID, item]));
    const newMap = new Map(newItems.map(item => [item.itemID, item]));
    const toAdd = [];
    const toModify = [];
    const toDelete = [];

    for (const [itemID, oldItem] of oldMap.entries()) {
        if (!newMap.has(itemID)) {
            toDelete.push(oldItem);
        } else {
            const newItem = newMap.get(itemID);
            if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
                toModify.push(newItem);
            }
        }
    }
    for (const [itemID, newItem] of newMap.entries()) {
        if (!oldMap.has(itemID)) {
            toAdd.push(newItem);
        }
    }
    return { toAdd, toModify, toDelete };
}

function buildRecipeItemUpdateQuery(recipeID, items) {
    const oldItemQuery = `SELECT recipeID, itemID, quantity, unitID FROM recipe_item WHERE recipeID = ?`;
    return new Promise((resolve, reject) => {
        connection.query(oldItemQuery, [recipeID], (err, results) => {
            if (err) {
                console.error(err);
                reject('Failed to update recipe items');
                return;
            }

            const oldItems = results.map(row => ({
                recipeID: row.recipeID,
                itemID: row.itemID,
                quantity: row.quantity,
                unitID: row.unitID
            }));
            const { toAdd, toModify, toDelete } = recipeItemDiff(oldItems, items);
            const queries = [];
            if (toAdd.length > 0) {
                const values = toAdd.map(
                    item => `(${recipeID}, ${item.itemID}, ${item.quantity}, ${item.unitID})`
                ).join(', ');
                queries.push(`INSERT INTO recipe_item (recipeID, itemID, quantity, unitID) VALUES ${values}`);
            }
            if (toModify.length > 0) {
                toModify.forEach(item => {
                    queries.push(`
                        UPDATE recipe_item
                        SET quantity = ${item.quantity}, unitID = ${item.unitID}
                        WHERE recipeID = ${recipeID} AND itemID = ${item.itemID}
                    `);
                });
            }
            if (toDelete.length > 0) {
                const deleteIDs = toDelete.map(item => item.itemID).join(', ');
                queries.push(`DELETE FROM recipe_item WHERE recipeID = ${recipeID} AND itemID IN (${deleteIDs})`);
            }
            resolve(queries);
        });
    });
}

app.patch('/api-v2/recipe', async (req, res) => {
    const {recipeName, description, recipeItems, userID} = req.body;
    const recipeID = Number(req.query.recipeID);
    const query1 = `SELECT userID FROM recipe WHERE recipeID = ?`;
    connection.query(query1, [recipeID], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to update recipe' });
            return;
        } else if (results.length === 0) {
            res.status(404).json({ message: 'Recipe not found' });
            return;

        } else if (results[0].userID !== Number(userID)) {
            res.status(403).json({ message: 'Unauthorized to update recipe' });
            return;
        } else {
            const query2 = `UPDATE recipe SET recipeName = ?, description = ? WHERE recipeID = ?`;
            connection.query(query2, [recipeName, description, recipeID], (err, results) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ message: 'Failed to update recipe' });
                    return;
                }
                try {
                    const oldItemsQuery = `SELECT itemID, quantity, unitID FROM recipe_item WHERE recipeID = ?`;
                    connection.query(oldItemsQuery, [recipeID], async (err, oldItems) => {
                        if (err) {
                            console.error(err);
                            res.status(500).json({ message: 'Failed to update recipe items' });
                            return;
                        }
                    const {toAdd, toModify, toDelete} = recipeItemDiff(oldItems, recipeItems);
                    const oldUnits = oldItems
                        .filter(oldItem => toModify.some(modified => modified.itemID === oldItem.itemID))
                        .map(oldItem => ({unitID: oldItem.unitID}));
                    const newUnits = toModify.map(item => ({unitID: item.unitID}));
                    const areUnitsValid = await validateUnits(oldUnits, newUnits);
                    if (!areUnitsValid) {
                        res.status(400).json({ message: 'Unit type mismatch' });
                        return;
                    }
                    const updateQueries = await buildRecipeItemUpdateQuery(recipeID, recipeItems);
                    for (const query of updateQueries) {
                        connection.query(query, (err, results) => {
                            if (err) {
                                console.error(err);
                                res.status(500).json({ message: 'Failed to update recipe items' });
                                return;
                            }
                        });
                    }
                    res.status(200).json({ message: 'Recipe updated successfully' });
                });
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Failed to update recipe items' });
            }
            });

        }
    });
});

app.listen(1337, () => {
    console.log('Server started on 1337')
})
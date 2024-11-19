export function convertRecipes() {
    const recipesStorage = JSON.parse(localStorage.getItem('recipes'));
    if (!recipesStorage) {
        console.error("No recipes found in localStorage");
        return;
    }

    const formattedRecipes = recipesStorage.reduce((acc, recipe) => {
        const { recipeName, ingredients, description } = recipe;

        acc[recipeName] = {
            name: recipeName,
            ingredients: ingredients.map(ingredient => ({
                ingredient: ingredient.ingredientName,
                quantity: ingredient.quantity,
                unit: ingredient.RecipeUnit,
                unitID: ingredient.RecipeUnitID, 
                price: ingredient.price || 0,
                available: parseInt(ingredient.stock, 10) > 0
            })),
            description: description,
            inventory: ingredients.map(ingredient => ({
                itemID: ingredient.ingredientID,
                size: ingredient.size,
                unit: ingredient.InventoryUnit,
                unitID: ingredient.InventoryUnitID,
                price: ingredient.price || 0
            }))
        };

        return acc;
    }, {});

    return formattedRecipes;
}

export function getItem() {
    localStorage.getItem('recipes')
}




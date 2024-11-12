function convertRecipes() {
    const recipesStorage = JSON.parse(localStorage.getItem('recipes'));
    if (!recipesStorage) {
        console.error("No recipes found in localStorage");
        return;
    }

    const formattedRecipes = recipesStorage.reduce((acc, recipe) => {
        const { recipeName, ingredients } = recipe;
        acc[recipeName] = {
            name: recipeName,
            ingredients: ingredients.map(ingredient => ({
                ingredient: ingredient.ingredientName,
                quantity: ingredient.quantity,
                unit: ingredient.unitName,
                price: ingredient.price || 0,
                available: parseInt(ingredient.stock, 10) > 0
            })),
            description: recipe.description
        };
        return acc;
    }, {});

    return formattedRecipes;
}




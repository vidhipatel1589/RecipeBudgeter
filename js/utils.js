
//hide other pages when switching through pages on nav bar
export function showSection(sectionId) {
    //get sections
    const sections = document.querySelectorAll('.section');

    //hide other sections
    sections.forEach(section => {
        section.style.display = 'none';
    });

    //show selected section
    document.getElementById(sectionId).style.display = 'block';
}

function showRecipeDetailsOnHome(chosenRecipeName, recipes) {
    const recipeDetailsDiv = document.getElementById('recipeCostDetailsHome');
    const ingredientCostList = document.getElementById('ingredientCostListHome');
    const totalCostElement = document.getElementById('totalCostHome');

    if (chosenRecipeName && recipes[chosenRecipeName]) {
        const recipe = recipes[chosenRecipeName];
        document.getElementById('chosenRecipeNameHome').textContent = recipe.name;
        const recipeDescription = document.getElementById('recipeDescriptionBox');

        ingredientCostList.innerHTML = '';
        recipeDescription.value = recipe.description;

        let totalCost = 0;


        recipe.ingredients.forEach((ingredient) => {
            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${ingredient.ingredient}</td>
        <td>${ingredient.quantity}</td>
        <td>${ingredient.unit}</td>
        <td>$${(ingredient.price * ingredient.quantity).toFixed(2)}</td>
        <td>${ingredient.available ? "In Stock" : "Out of Stock"}</td>
    `;
            ingredientCostList.appendChild(row);
            totalCost += ingredient.price * ingredient.quantity;
        });


        totalCostElement.textContent = `$${totalCost.toFixed(2)}`;
        recipeDetailsDiv.style.display = 'block';
    } else {
        recipeDetailsDiv.style.display = 'none';
    }
}


//list of clickable recipes on the home page
export function populateRecipeList(recipes) {
    const recipeList = document.getElementById('recipeList');

    recipeList.innerHTML = '';

    for (const recipeName in recipes) {
        const recipeItem = document.createElement('div');
        recipeItem.className = 'recipe-item';
        recipeItem.textContent = recipeName;
        recipeItem.onclick = () => showRecipeDetailsOnHome(recipeName, recipes);
        recipeList.appendChild(recipeItem);
        
    }
}


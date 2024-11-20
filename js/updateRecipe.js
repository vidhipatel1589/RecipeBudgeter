function updateRecipe() {

    const recipeID = localStorage.getItem('recipeID');
    const recipeName = document.querySelector('#updateRecipeForm #recipeName').value;
    const description = document.querySelector('#updateRecipeForm .description-box textarea').value;
    console.log(recipeID)
    console.log(recipeName)
    console.log(description)
    // Get ingredients list
    const ingredientElements = document.querySelectorAll('#updateRecipeForm #ingredient-list .ingredient');
    console.log(ingredientElements)
    const ingredientsList = Array.from(ingredientElements).map((ingredient) => {
        return {
            quantity: ingredient.querySelector('input[type="number"]').value,
            unit: ingredient.querySelector('select').value,
        };
    });

    fetch('http://localhost:1337/api/updateRecipe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            recipeID: localStorage.getItem('recipeID'),
            recipeName: document.querySelector('#updateRecipeForm #recipeName').value,
            description: document.querySelector('#updateRecipeForm .description-box').textarea,
            ingredientsList: document.querySelector('#updateRecipeForm .ingredient').value,
        })
    })
}



function deleteRecipe() {

    console.log('Delete recipe');

    const recipeDel = document.getElementById('chooseRecipeUpdate');
    const selectedRecipeName = recipeDel.options[recipeDel.selectedIndex].textContent;

    const allRecipes = JSON.parse(localStorage.getItem('recipes'));
    const selectedRecipe = allRecipes.find(recipe => recipe.recipeName === selectedRecipeName);

    if (selectedRecipe && selectedRecipe.recipeID) {
        const recipeID = selectedRecipe.recipeID;
        const userID = localStorage.getItem('userID');

        fetch('http://localhost:1337/api/deleteUserRecipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ recipeID, userID }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Recipe deleted successfully') {
                    alert('Recipe deleted successfully');
                    
                    
                    fetch('http://localhost:1337/api/userRecipe', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ userID })
                    })
                    .then(response => response.json())
                    .then(data => {
                        localStorage.setItem('recipes', JSON.stringify(data));
                        
                        const recipesNew = convertRecipes();
                        const recipeList = document.getElementById('recipeList');
                        recipeList.innerHTML = '';

                        for (const recipeName in recipesNew) {
                            const recipeItem = document.createElement('div');
                            recipeItem.className = 'recipe-item';
                            recipeItem.textContent = recipeName;
                            recipeItem.onclick = () => showRecipeDetailsOnHome(recipeName);
                            recipeList.appendChild(recipeItem);
                        }


                        document.getElementById('navbar').style.display = 'block';
                        showSection('home');
                        document.querySelector('.wrapper').style.display = 'none';
                    });

                } else {
                    alert('Failed to delete recipe');
                }
            })
            .catch(err => {
                console.error('Error deleting recipe:', err);
                alert('Error deleting recipe');
            });
    } else {
        alert('Recipe not found!');
    }
    

}
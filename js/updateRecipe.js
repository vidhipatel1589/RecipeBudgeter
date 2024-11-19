function updateRecipe() {

    const recipeID = localStorage.getItem('recipeID');

    fetch('http://localhost:1337/api/updateRecipe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            recipeID: localStorage.getItem('recipeID'),
            recipeName: document.querySelector('#updateRecipeForm #recipeName').value,
            description: document.querySelector('#updateRecipeForm #description').value
        })
    })
}
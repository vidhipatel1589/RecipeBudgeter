import { login } from './login.js';
import { convertRecipes, getItem } from './home.js';
import { showSection } from './utils.js';
login();
getItem();


export function showLogin() {
    document.getElementById('signupWrapper').style.display = 'none';
    document.querySelector('.wrapper').style.display = 'block';
    document.getElementById('navbar').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

export function showSignup() {
    document.querySelector('.wrapper').style.display = 'none';
    document.getElementById('signupWrapper').style.display = 'block';
}

    

////////////////////////////////////////////////////////////////////////////////////////

// temporary list of ingredients, get from database instead later
// const ingredients = [
//     "Salt",
//     "Pepper",
//     "Eggs",
//     "Butter",
//     "Rice",
//     "Spinach",
//     "Onion",
//     "Tomato",
//     "Olive oil",
//     "Chicken"
// ];

// temporary list of recipes, get from database later
// const recipes = {
//     "Omelet": { name: "Omelet", ingredients: [{ ingredient: "Eggs", quantity: 2, unit: "Units", price: 0.50, available: true }, { ingredient: "spinach", quantity: 10, unit: "Ounces", price: 0.20, available: true }] },
//     "Chicken and Rice": { name: "Chicken and Rice", ingredients: [{ ingredient: "chicken", quantity: 1, unit: "Pounds",available: false }, { ingredient: "rice", quantity: 1, unit: "Cups", price: 1.20, available: true }] }, 
// };

const recipes = convertRecipes();

////////////////////////////////////////////////////////////////////////////////////////

document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', function (event) {
        event.preventDefault();
        const targetSection = this.getAttribute('href').substring(1);
        showSection(targetSection);
    });
});

////////////////////////////////////////////////////////////////////////////////////////

//list of clickable recipes on the home page
export function populateRecipeList() {
    const recipeList = document.getElementById('recipeList');

    recipeList.innerHTML = '';

    for (const recipeName in recipes) {
        const recipeItem = document.createElement('div');
        recipeItem.className = 'recipe-item';
        recipeItem.textContent = recipeName;
        recipeItem.onclick = () => showRecipeDetailsOnHome(recipeName);
        recipeList.appendChild(recipeItem);
        
    }
}
populateRecipeList();

function showRecipeDetailsOnHome(chosenRecipeName) {
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

///////////////////////////////////////////////////////////////////////////////////////

//when user types, it'll find the ingredient in the list
function filterIngredients() {
    const input = document.getElementById('ingredientInput');
    const filter = input.value.toLowerCase();
    const dropdown = document.getElementById('dropdownContent');
    dropdown.innerHTML = ''; // Clear previous results

    if (filter) {
        const filteredIngredients = ingredients.filter(ingredient => ingredient.toLowerCase().includes(filter));

        filteredIngredients.forEach(ingredient => {
            const div = document.createElement('div');
            div.textContent = ingredient;
            div.onclick = () => selectIngredient(ingredient);
            dropdown.appendChild(div);
        });

        //show list
        dropdown.style.display = filteredIngredients.length > 0 ? 'block' : 'none';
    } else {
        dropdown.style.display = 'none'; //if none match
    }
}

//choose from dropdown list
function selectIngredient(ingredient) {
    document.getElementById('ingredientInput').value = ingredient;
    document.getElementById('dropdownContent').style.display = 'none';
}

//to add another ingredient when listing ingredients for new recipe
function addIngredient() {
    const ingredientsList = document.getElementById('ingredients-list');

    const ingredientDiv = document.createElement('div');
    ingredientDiv.className = 'ingredient';

    //fields for new ingredient
    ingredientDiv.innerHTML = `
        <select id="ingredientDropdown" required>
        <option value="">Select Ingredient</option>
    </select>
    <input type="number" placeholder="Quantity" required min = "0">
    <select>
        <option value="Units">Units</option>
        <option value="Cups">Cups</option>
        <option value="Pounds">Pounds</option>
        <option value="Ounces">Ounces</option>
    </select>
    <button type="button" class="X-button"  onclick="deleteIngredient(this)">X</button>
`;

    ingredientsList.appendChild(ingredientDiv);

    // Prevent negative values in the new quantity field
    const quantityInput = ingredientDiv.querySelector('input[type="number"]');
    quantityInput.addEventListener('input', () => {
        if (quantityInput.value < 0) {
            quantityInput.value = 0; // Reset to 0 if negative number is entered
        }
    });
}

function deleteIngredient(button) {
    const ingredientDiv = button.parentElement; // Get the parent div of the delete button
    ingredientDiv.remove(); // Remove the ingredient row from the DOM
}


////////////////////////////////////////////////////////////////////////////////////////

//dropdown for recipes
function populateDropdown() {
    const dropdown = document.getElementById('chooseRecipeUpdate');
    dropdown.innerHTML = ''; // Clear the previous options
    const uniqueRecipes = new Set(); // Use a Set to track unique recipe names

    for (let recipeName in recipes) {
        if (!uniqueRecipes.has(recipeName)) { // Check for duplicates
            uniqueRecipes.add(recipeName);
            const option = document.createElement('option');
            option.value = recipeName;
            option.textContent = recipeName;
            dropdown.appendChild(option);
        }
    }
}
populateDropdown();

//get list of recipes to choose from
export function loadRecipeData() {
    const chosenRecipeName = document.getElementById('chooseRecipeUpdate').value;
    if (chosenRecipeName) {
        const recipe = recipes[chosenRecipeName];
        localStorage.setItem('recipeID', recipe.recipeID);
        document.getElementById('recipeName').value = recipe.name;

        document.querySelector('#updateRecipeForm textarea').value = recipe.description;

        //clear out previous
        const ingredientsList = document.getElementById('ingredient-list');
        ingredientsList.innerHTML = '';

        //list out the ingredients
        recipe.ingredients.forEach((ingredient, index) => {
            const ingredientDiv = document.createElement('div');
            ingredientDiv.className = 'ingredient-entry';
            ingredientDiv.innerHTML = `
                                <input type="text" value="${ingredient.ingredient}" class="ingredient-name">
                                <input type="number" value="${ingredient.quantity}" class="ingredient-quantity" min = "0">
                                <input type="text" value="${ingredient.unit}" class="ingredient-unit">
                                <button type="button" class="X-button" onclick="deleteIngredient(this)">X</button>
                            `;
            ingredientsList.appendChild(ingredientDiv);
        });

        //Prevent users from manually entering a negative number
        document.querySelectorAll('.ingredient-quantity').forEach(input => {
        input.addEventListener('input', () => {
            if (input.value < 0) {
                input.value = 0; // Reset to 0 if negative number is entered
            }
            });
        });

        //show form to update recipe
        document.getElementById('updateRecipeForm').style.display = 'block';
    } else {
        //clear if no recipe chosen
        document.getElementById('updateRecipeForm').style.display = 'none';
    }
}

//add another ingredient to recipe
function addAnotherIngredient() {
    const ingredientsList = document.getElementById('ingredient-list');

    const ingredientDiv = document.createElement('div');
    ingredientDiv.className = 'ingredient-entry';
    ingredientDiv.innerHTML = `
        <select id="ingredientDropdown" required>
            <option value="">Select Ingredient</option>
        </select>
        <input type="number" class="ingredient-quantity" placeholder="Quantity" required min = "0">
        <select class="ingredient-unit">
                <option value="Units">Units</option>
                <option value="Cups">Cups</option>
                <option value="Pounds">Pounds</option>
                <option value="Ounces">Ounces</option>
        </select>
        <button type="button" class="X-button" onclick="deleteIngredient(this)">X</button>
        `;

        ingredientsList.appendChild(ingredientDiv);

        const quantityInput = ingredientDiv.querySelector('.ingredient-quantity');
        quantityInput.addEventListener('input', () => {
            if (quantityInput.value < script) {
                quantityInput.value = 0; // Reset to 0 if negative number is entered
            }
        });

function saveNewRecipe() {
    const recipeName = document.querySelector('.add-recipe-entry input[type="text"]').value; // Recipe Name input
    const recipeDescription = document.querySelector('.add-recipe-entry textarea').value; // Recipe Description input
    const ingredientsList = document.querySelectorAll('#ingredients-list .ingredient'); // All ingredients added

    const newIngredients = Array.from(ingredientsList).map(ingredientDiv => ({
        ingredient: ingredientDiv.querySelector('input[type="text"]').value,
        quantity: parseFloat(ingredientDiv.querySelector('input[type="number"]').value),
        unit: ingredientDiv.querySelector('select').value
    }));

    fetch('http://localhost:1337/api/addRecipe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: recipeName,
            description: recipeDescription,
            userID: localStorage.getItem('userID'),
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.recipeID) {
            console.log('Recipe added successfully with ID:', data.recipeID);
            // Now use the recipeID in the subsequent fetch requests
            const recipeID = data.recipeID;

            for (const ingredient of newIngredients) {
                fetch('http://localhost:1337/api/addRecipeItem', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        recipeID: recipeID, // Use the recipeID here
                        ingredient: ingredient.ingredient, // Include the ingredient name
                        quantity: ingredient.quantity,
                        unit: ingredient.unit
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                })
                .catch(error => {
                    console.error('Error adding ingredient:', error);
                });
            }
        } else {
            console.log('Response:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function saveRecipe() {
    const recipeName = document.getElementById('recipeName').value;
    const ingredientsList = document.getElementById('ingredient-list').children;

    const updatedIngredients = Array.from(ingredientsList).map(ingredientDiv => ({
        ingredient: ingredientDiv.querySelector('.ingredient-name').value,
        quantity: parseFloat(ingredientDiv.querySelector('.ingredient-quantity').value),
        unit: ingredientDiv.querySelector('.ingredient-unit').value
    }));

    //update the recipe (change later to connect to database)
    recipes[recipeName] = { name: recipeName, ingredients: updatedIngredients };

    alert('Recipe updated successfully!');
}

function deleteRecipe() {
    const recipeName = document.getElementById('recipeName').value;
    const ingredientsList = document.getElementById('ingredient-list').children;
    //update the recipe (change later to connect to database)
    //recipes[recipeName] = { name: recipeName, ingredients: updatedIngredients };
    if (recipes.hasOwnProperty(recipeName)) {
        delete recipes[recipeName];
        alert('Recipe deleted successfully');
    }
    else {
        alert('error cannot delete');
    }
}

////////////////////////////////////////////////////////////////////////////////////////

//shows dropdown for the recipes to select from to show cost
function populateRecipeCostDropdown() {
    const dropdown = document.getElementById('chooseRecipeCost');
    dropdown.innerHTML = '<option value="">Select a recipe</option>'; //to reset

    for (const recipeName in recipes) {
        const option = document.createElement('option');
        option.value = recipeName;
        option.textContent = recipeName;
        dropdown.appendChild(option);
    }
}
populateRecipeCostDropdown();

//show recipe cost details
function viewRecipeCost() {
    const chosenRecipeName = document.getElementById('chooseRecipeCost').value;
    const recipeDetailsDiv = document.getElementById('recipeCostDetails');
    const ingredientCostList = document.getElementById('ingredientCostList');
    const totalCostElement = document.getElementById('totalCost');

    if (chosenRecipeName && recipes[chosenRecipeName]) {
        const recipe = recipes[chosenRecipeName];
        document.getElementById('chosenRecipeName').textContent = recipe.name;

        const recipeDescription = document.getElementById('recipeDescriptionCostBox');
        recipeDescription.value = recipe.description;
        ingredientCostList.innerHTML = '';
        let totalCost = 0;  //to start with then add the costs
        

        //show the list of recipe details with cost
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
        alert('Select a recipe.');
    }
    }

} 

document.addEventListener('DOMContentLoaded', () =>{
        
    loadRecipeData();
    document.getElementById('chooseRecipeUpdate').addEventListener('change', () => {
        console.log('Recipe changed');
        loadRecipeData();
    });
});
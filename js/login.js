import { showSection } from './showSection.js';
export function login() {
    // Login
    console.log('login.js loaded');
    document.getElementById('loginForm').addEventListener('submit', function (event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Login API request
        fetch('http://localhost:1337/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Login successful') {
                // Store the userID in localStorage
                localStorage.setItem('userID', data.userID);
                fetchUserRecipes(data.userID);
            } else {
                alert('Invalid username or password');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error logging in');
        });
    });
}


// Function to fetch user recipes and store in localStorage
function fetchUserRecipes(userID) {
    fetch('http://localhost:1337/api/userRecipe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userID })
    })
    .then(response => response.json())
    .then(data => {
        // Store recipes in localStorage
        localStorage.setItem('recipes', JSON.stringify(data));
        
        // Switch to home navbar
        document.getElementById('navbar').style.display = 'block';
        showSection('home');
        document.querySelector('.wrapper').style.display = 'none';
    })
    .catch(error => {
        console.error('Error fetching recipes:', error);
        alert('Error fetching recipes');
    });
}

// Sign Up
document.getElementById('signupForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;

    fetch('http://localhost:1337/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'User registered successfully') {
            alert('Account created successfully! You can now log in.');
            showLogin(); // Show login form
        } else {
            alert('Error registering user');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error registering user');
    });
});
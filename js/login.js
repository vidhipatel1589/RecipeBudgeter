// Login 
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

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
            localStorage.setItem('userID', data.userID);
            document.getElementById('navbar').style.display = 'block';
            showSection('home');
            document.querySelector('.wrapper').style.display = 'none';
        } else {
            alert('Invalid username or password');
        }


    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error logging in');
    });
});

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
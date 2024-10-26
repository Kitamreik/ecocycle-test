// document.addEventListener('DOMContentLoaded', function() {
//     const loginForm = document.getElementById('loginForm');
//     const errorMessage = document.getElementById('errorMessage');
//
//     loginForm.addEventListener('submit', function(event) {
//         event.preventDefault();
//
//         const username = document.getElementById('username').value.trim();
//         const password = document.getElementById('password').value.trim();
//
//         if (username === '' || password === '') {
//             errorMessage.textContent = 'Please enter both username and password.';
//             return;
//         }
//
//         if (username.length < 3) {
//             errorMessage.textContent = 'Username must be at least 3 characters long.';
//             return;
//         }
//
//         if (password.length < 6) {
//             errorMessage.textContent = 'Password must be at least 6 characters long.';
//             return;
//         }
//
//         // If validation passes, submit the form
//         errorMessage.textContent = '';
//         loginForm.submit();
//     });
// });
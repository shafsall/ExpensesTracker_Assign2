$(document).ready(function () {
    const usersKey = 'users';

    function getUsers() {
        return JSON.parse(localStorage.getItem(usersKey)) || [];
    }

    function saveUsers(users) {
        localStorage.setItem(usersKey, JSON.stringify(users));
    }

    function userExists(username) {
        return getUsers().some(user => user.username === username);
    }

    function emailExists(email) {
        return getUsers().some(user => user.email === email);
    }

    $('#register-form').submit(function (e) {
        e.preventDefault();
        
        let username = $('#register-username').val();
        let email = $('#register-email').val();
        let password = $('#register-password').val();
        let confirmPassword = $('#confirm-password').val();

        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Registration Error',
                text: 'Passwords do not match!'
            });
            return;
        }

        if (userExists(username)) {
            Swal.fire({
                icon: 'error',
                title: 'Registration Error',
                text: 'Username already exists!'
            });
            return;
        }

        if (emailExists(email)) {
            Swal.fire({
                icon: 'error',
                title: 'Registration Error',
                text: 'Email already registered!'
            });
            return;
        }

        let users = getUsers();
        users.push({ username, email, password, expenses: [] });
        saveUsers(users);

        Swal.fire({
            icon: 'success',
            title: 'Your account has been created successfully',
            text: 'You can now log in'
        }).then(() => {
            window.location.href = 'login.html';
        });
    });
});
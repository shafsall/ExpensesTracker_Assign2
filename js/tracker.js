$(document).ready(function () {
    const usersKey = 'users';
    let chartInstance; // Variable to hold the chart instance

    function getUsers() {
        return JSON.parse(localStorage.getItem(usersKey)) || [];
    }

    function saveUsers(users) {
        localStorage.setItem(usersKey, JSON.stringify(users));
    }

    function getCurrentUser() {
        return localStorage.getItem('currentUser');
    }

    function getUser(username) {
        return getUsers().find(user => user.username === username);
    }

    function saveUser(user) {
        let users = getUsers();
        let index = users.findIndex(u => u.username === user.username);
        if (index !== -1) {
            users[index] = user;
            saveUsers(users);
        }
    }

    function addExpense(expense) {
        let currentUser = getCurrentUser();
        let user = getUser(currentUser);
        user.expenses.push(expense);
        saveUser(user);
    }

    function deleteExpense(index) {
        let currentUser = getCurrentUser();
        let user = getUser(currentUser);
        user.expenses.splice(index, 1);
        saveUser(user);
    }

    function getExpenses() {
        let currentUser = getCurrentUser();
        let user = getUser(currentUser);
        return user.expenses;
    }

    function updateSummary() {
        let total = getExpenses().reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        $('#total-expenses').text(total.toFixed(2));
    }

    function refreshExpenses() {
        $('#expense-list').empty();
        getExpenses().forEach((expense, index) => {
            $('#expense-list').append(`
                <tr>
                    <td>${expense.name}</td>
                    <td>${expense.category}</td>
                    <td>${parseFloat(expense.amount).toFixed(2)}</td>
                    <td>${expense.date}</td>
                    <td>
                        <button class="btn btn-primary btn-sm edit-expense" data-index="${index}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-expense" data-index="${index}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `);
        });
        updateSummary();
        updateChart(); // Update the chart after refreshing expenses
    }

    $('#expense-form').submit(function (e) {
        e.preventDefault();
        let name = $('#expense-name').val();
        let category = $('#expense-category').val();
        let amount = parseFloat($('#expense-amount').val());
        let date = $('#expense-date').val();
        
        addExpense({ name, category, amount, date });
        
        $('#expense-form')[0].reset(); // Reset the form
        refreshExpenses(); // Refresh the expenses list
    });

    $(document).on('click', '.delete-expense', function () {
        let index = $(this).data('index');
        
        Swal.fire({
            title: 'Are you sure?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteExpense(index);
                refreshExpenses();
                Swal.fire('Deleted!', 'The expense entry has been successfully removed.', 'success');
            }
        });
    });

    $(document).on('click', '.edit-expense', function () {
        let index = $(this).data('index');
        let expense = getExpenses()[index];
        
        $('#expense-name').val(expense.name);
        $('#expense-category').val(expense.category);
        $('#expense-amount').val(expense.amount);
        $('#expense-date').val(expense.date);
        
        deleteExpense(index); // Remove the old entry
        refreshExpenses(); // Refresh the list
    });

    function updateChart() {
        let ctx = document.getElementById('expense-chart').getContext('2d');
        
        // Aggregate expenses by category
        let categoryExpenses = {};
        
        getExpenses().forEach(expense => {
            if (!categoryExpenses[expense.category]) {
                categoryExpenses[expense.category] = 0;
            }
            categoryExpenses[expense.category] += parseFloat(expense.amount);
        });

        // Prepare data for the pie chart
        let labels = Object.keys(categoryExpenses);
        let data = Object.values(categoryExpenses);

        // Destroy existing chart if it exists before creating a new one
        if (chartInstance) {
            chartInstance.destroy();
        }

        // Create new pie chart instance
        chartInstance = new Chart(ctx, {
            type: 'pie', // Change to 'pie' for pie chart
            data: {
                labels: labels,
                datasets: [{
                    label: 'Expenses by Category',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)',
                        'rgba(201, 203, 207, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(201, 203, 207, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Expenses by Category'
                    }
                }
            }
        });
    }

    // Initial loading of expenses and chart
    if (!getCurrentUser()) {
        window.location.href = 'login.html';
    } else {
        refreshExpenses(); // Load and display expenses and chart
    }
});

// Function to exit the application
function exitApp() {
    localStorage.removeItem('currentUser');
    window.location.href = "login.html";
}
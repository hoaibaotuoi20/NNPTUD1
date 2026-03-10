// Configuration
const API_URL = 'http://localhost:3000';

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const currentUsernameSpan = document.getElementById('current-username');
const roleList = document.getElementById('role-list');
const userTableBody = document.getElementById('user-table-body');

// State
let token = localStorage.getItem('token') || null;
let currentUser = JSON.parse(localStorage.getItem('user')) || null;

// Initialize App
function init() {
    if (token) {
        showDashboard();
    } else {
        showLogin();
    }
}

// UI Controllers
function showLogin() {
    loginSection.style.display = 'flex';
    dashboard.style.display = 'none';
}

function showDashboard() {
    loginSection.style.display = 'none';
    dashboard.style.display = 'block';
    currentUsernameSpan.innerText = currentUser.username + (currentUser.role ? ` (${currentUser.role.name})` : '');

    // Fetch initial data
    fetchRoles();
    fetchUsers();
}

// Event Listeners
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('d-none');

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(currentUser));
            showDashboard();
        } else {
            loginError.innerText = data.error;
            loginError.classList.remove('d-none');
        }
    } catch (err) {
        loginError.innerText = "Error connecting to server";
        loginError.classList.remove('d-none');
    }
});

logoutBtn.addEventListener('click', () => {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showLogin();
});

// API Calls - Auth configuration
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

async function fetchRoles() {
    try {
        const res = await fetch(`${API_URL}/roles`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Unauthorized or Error");
        const roles = await res.json();

        roleList.innerHTML = '';

        // Nút xem tất cả Users
        const liAll = document.createElement('li');
        liAll.className = 'list-group-item d-flex justify-content-between align-items-center active';
        liAll.innerHTML = `All Users`;
        liAll.style.cursor = 'pointer';
        liAll.onclick = (e) => {
            document.querySelectorAll('#role-list .list-group-item').forEach(el => el.classList.remove('active'));
            e.target.classList.add('active');
            fetchUsers();
        };
        roleList.appendChild(liAll);

        roles.forEach(role => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                ${role.name}
            `;
            // Thêm nút click để xem user theo Role (Yêu cầu 4)
            li.style.cursor = 'pointer';
            li.onclick = (e) => {
                document.querySelectorAll('#role-list .list-group-item').forEach(el => el.classList.remove('active'));
                e.target.classList.add('active');
                fetchUsersByRole(role._id);
            }
            roleList.appendChild(li);
        });
    } catch (err) {
        console.error(err);
    }
}

async function fetchUsers() {
    try {
        const res = await fetch(`${API_URL}/users`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Error fetching users");
        const users = await res.json();
        renderUsersTable(users);
    } catch (err) {
        console.error(err);
    }
}

async function fetchUsersByRole(roleId) {
    try {
        const res = await fetch(`${API_URL}/roles/${roleId}/users`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Error fetching users by role");
        const users = await res.json();
        renderUsersTable(users);
    } catch (err) {
        console.error(err);
    }
}

function renderUsersTable(users) {
    userTableBody.innerHTML = '';
    users.forEach(user => {
        const tr = document.createElement('tr');
        const roleName = user.role ? user.role.name : 'No Role';
        const statusBadge = user.status
            ? '<span class="badge bg-success">Active</span>'
            : '<span class="badge bg-danger">Disabled</span>';

        tr.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${roleName}</td>
            <td>${statusBadge}</td>
            <td>
                <button onclick="toggleUserStatus('${user.email}', '${user.username}', ${user.status})" class="btn btn-sm ${user.status ? 'btn-warning' : 'btn-success'}">
                    ${user.status ? 'Disable' : 'Enable'}
                </button>
            </td>
        `;
        userTableBody.appendChild(tr);
    });
}

// Function cho POST /enable và /disable
async function toggleUserStatus(email, username, currentStatus) {
    const endpoint = currentStatus ? '/disable' : '/enable';

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ email, username })
        });

        const data = await res.json();
        if (res.ok) {
            alert(data.message);
            fetchUsers(); // Refresh table
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert("Action failed!");
    }
}

// Run app
init();

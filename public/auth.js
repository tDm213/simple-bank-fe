const API_BASE = 'http://localhost:3001/api'; // Backend API URL

// ====== LOGIN / SIGNUP PAGE ======
const token = localStorage.getItem('token');

const isLoginPage = window.location.pathname === '/' || window.location.pathname.endsWith('index.html');

if (!isLoginPage && !token) {
  // Only redirect to login page if trying to access a protected page
  location.href = '/';
}

// ====== Tab switching on login/signup page ======
const tabLoginBtn = document.getElementById('tabLogin');
const tabSignupBtn = document.getElementById('tabSignup');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');

if (tabLoginBtn && tabSignupBtn && loginTab && signupTab) {
  tabLoginBtn.addEventListener('click', () => {
    loginTab.classList.remove('hidden');
    signupTab.classList.add('hidden');
    tabLoginBtn.classList.add('active');
    tabSignupBtn.classList.remove('active');
  });

  tabSignupBtn.addEventListener('click', () => {
    signupTab.classList.remove('hidden');
    loginTab.classList.add('hidden');
    tabSignupBtn.classList.add('active');
    tabLoginBtn.classList.remove('active');
  });
}


// ====== Login Form ======
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        location.href = '/dashboard.html'; // redirect after login
      } else {
        document.getElementById('loginPassError').textContent = data.error;
        document.getElementById('loginPassError').classList.remove('hidden');
      }
    } catch (err) {
      console.error(err);
    }
  });
}

// ====== Signup Form ======
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        location.href = '/dashboard.html'; // redirect after signup
      } else {
        document.getElementById('signupPassError').textContent = data.error;
        document.getElementById('signupPassError').classList.remove('hidden');
      }
    } catch (err) {
      console.error(err);
    }
  });
}

// ====== DASHBOARD / PROTECTED PAGE ======
if (token) {
  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      location.href = '/index.html';
    });
  }

  // Toast helper
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }

  // Fetch user info
async function loadUser() {
  if (!token) return;
  try {
    const res = await fetch(`${API_BASE}/user/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      const userInfo = document.getElementById('userInfo');
      if (userInfo) userInfo.textContent = `👤 ${data.username} | 💰 $${data.balance}`;
    } else {
      localStorage.removeItem('token');
      location.href = '/index.html';
    }
  } catch (err) {
    console.error(err);
    localStorage.removeItem('token');
    location.href = '/index.html';
  }
}


  // Tab switching
  const tabSend = document.getElementById('tabSend');
  const tabRequest = document.getElementById('tabRequest');
  if (tabSend && tabRequest) {
    tabSend.addEventListener('click', () => {
      document.getElementById('sendTab').classList.remove('hidden');
      document.getElementById('requestTab').classList.add('hidden');
      tabSend.classList.add('active');
      tabRequest.classList.remove('active');
    });
    tabRequest.addEventListener('click', () => {
      document.getElementById('sendTab').classList.add('hidden');
      document.getElementById('requestTab').classList.remove('hidden');
      tabSend.classList.remove('active');
      tabRequest.classList.add('active');
    });
  }

  // Load pending requests
  async function loadPending() {
    try {
      const res = await fetch(`${API_BASE}/transactions/requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const list = document.getElementById('pendingRequests');
      const noPending = document.getElementById('noPending');
      if (!list) return;
      list.innerHTML = '';
      if (data.length === 0 && noPending) noPending.classList.remove('hidden');
      else if (noPending) noPending.classList.add('hidden');
      data.forEach(req => {
        const li = document.createElement('li');
        li.textContent = `${req.fromUser.username} → You: $${req.amount}`;

        const approveBtn = document.createElement('button');
        approveBtn.textContent = 'Approve';
        approveBtn.onclick = () => handleApprove(req.id);

        const rejectBtn = document.createElement('button');
        rejectBtn.textContent = 'Reject';
        rejectBtn.onclick = () => handleReject(req.id);

        li.appendChild(approveBtn);
        li.appendChild(rejectBtn);
        list.appendChild(li);
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Load history
  async function loadHistory() {
    try {
      const res = await fetch(`${API_BASE}/transactions/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const list = document.getElementById('history');
      if (!list) return;
      list.innerHTML = '';
      data.forEach(tx => {
        const li = document.createElement('li');
        const status = tx.status === 'pending' ? '⏳ Pending' : '✅ Completed';
        li.textContent = `${new Date(tx.date || tx.timestamp).toLocaleString()}: ${tx.from} → ${tx.to} $${tx.amount} (${status})`;
        list.appendChild(li);
      });
    } catch (err) {
      console.error(err);
    }
  }

  // Actions: send/request/approve/reject
  async function handleSend(recipient, amount) { /* same as before */ }
  async function handleRequest(recipient, amount) { /* same as before */ }
  async function handleApprove(id) { /* same as before */ }
  async function handleReject(id) { /* same as before */ }

  // Form submissions
  const sendForm = document.getElementById('sendForm');
  if (sendForm) {
    sendForm.addEventListener('submit', e => {
      e.preventDefault();
      handleSend(
        document.getElementById('sendTo').value,
        parseFloat(document.getElementById('sendAmount').value)
      );
    });
  }
  const requestForm = document.getElementById('requestForm');
  if (requestForm) {
    requestForm.addEventListener('submit', e => {
      e.preventDefault();
      handleRequest(
        document.getElementById('requestFrom').value,
        parseFloat(document.getElementById('requestAmount').value)
      );
    });
  }

  // Initialize dashboard
  loadUser();
  loadPending();
  loadHistory();
}

const API_BASE = 'http://localhost:3001/api'; // Backend API URL

// ====== Check token ======
const token = localStorage.getItem('token');
// Only redirect if token is missing AND not already on login page
if (!token && !location.pathname.endsWith('index.html')) {
  location.href = '/index.html';
}

// ====== Logout ======
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    location.href = '/index.html';
  });
}

// ====== Toast helper ======
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ====== Fetch user info ======
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

// ====== Tab switching ======
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

// ====== Fetch pending requests ======
async function loadPending() {
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/transactions/requests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const list = document.getElementById('pendingRequests');
    const noPending = document.getElementById('noPending');
    if (!list) return;

    list.innerHTML = '';

    if (data.length === 0) {
      noPending.classList.remove('hidden');
    } else {
      noPending.classList.add('hidden');
      data.forEach((req) => {
        const li = document.createElement('li');
        const text = document.createElement('span');
        text.textContent = `${req.fromUser.username} → You: $${req.amount}`;
        li.appendChild(text);

        const approveBtn = document.createElement('button');
        approveBtn.textContent = 'Approve';
        approveBtn.style.marginLeft = '10px';
        approveBtn.onclick = async () => await handleApprove(req.id);

        const rejectBtn = document.createElement('button');
        rejectBtn.textContent = 'Reject';
        rejectBtn.style.marginLeft = '5px';
        rejectBtn.onclick = async () => await handleReject(req.id);

        li.appendChild(approveBtn);
        li.appendChild(rejectBtn);
        list.appendChild(li);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

// ====== Fetch transaction history ======
async function loadHistory() {
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/transactions/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const list = document.getElementById('history');
    if (!list) return;
    list.innerHTML = '';

    data.forEach(tx => {
      const li = document.createElement('li');
      const status = tx.status === 'pending'
        ? '⏳ Pending request'
        : tx.status === 'rejected'
          ? '❌ Rejected'
          : '✅ Completed';
      li.textContent = `${new Date(tx.date || tx.timestamp).toLocaleString()}: ${tx.from} → ${tx.to} $${tx.amount} (${status})`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

// ====== Action handlers ======
async function handleSend(recipientUsername, amount) {
  try {
    const res = await fetch(`${API_BASE}/transactions/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ recipientUsername, amount })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message, 'success');
      loadHistory();
      loadUser();
    } else {
      showToast(data.error, 'error');
    }
  } catch (err) {
    console.error(err);
  }
}

async function handleRequest(recipientUsername, amount) {
  try {
    const res = await fetch(`${API_BASE}/transactions/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ recipientUsername, amount })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message, 'success');
      loadPending();
      loadHistory(); // ✅ ensure history updates
    } else {
      showToast(data.error, 'error');
    }
  } catch (err) {
    console.error(err);
  }
}

async function handleApprove(requestId) {
  try {
    const res = await fetch(`${API_BASE}/transactions/request/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ requestId })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message, 'success');
      loadPending();
      loadHistory();
      loadUser();
    } else {
      showToast(data.error, 'error');
    }
  } catch (err) {
    console.error(err);
  }
}

async function handleReject(requestId) {
  try {
    const res = await fetch(`${API_BASE}/transactions/request/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ requestId })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message, 'success');
      loadPending();
      loadHistory(); // ✅ update history after rejection
    } else {
      showToast(data.error, 'error');
    }
  } catch (err) {
    console.error(err);
  }
}

// ====== Form submissions ======
const sendForm = document.getElementById('sendForm');
if (sendForm) {
  sendForm.addEventListener('submit', e => {
    e.preventDefault();
    const recipient = document.getElementById('sendTo').value;
    const amount = parseFloat(document.getElementById('sendAmount').value);
    handleSend(recipient, amount);
  });
}

const requestForm = document.getElementById('requestForm');
if (requestForm) {
  requestForm.addEventListener('submit', e => {
    e.preventDefault();
    const recipient = document.getElementById('requestFrom').value;
    const amount = parseFloat(document.getElementById('requestAmount').value);
    handleRequest(recipient, amount);
  });
}

// ====== Auto-refresh ======
function startAutoRefresh() {
  setInterval(() => {
    loadPending();
    loadHistory();
  }, 5000);
}

// ====== Init ======
if (token) {
  loadUser();
  loadPending();
  loadHistory();
  startAutoRefresh();
}

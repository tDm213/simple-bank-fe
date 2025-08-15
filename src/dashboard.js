// src/dashboard.js
import { getToken, showToast } from './utils.js';
import { API_BASE } from './api.js';

// ====== Check token ======
const token = getToken();
if (!token) {
  window.location.href = '/';
}

// ====== Logout ======
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  });
}

// ====== Load User Info ======
export async function loadUser() {
  if (!token) return;
  try {
    const res = await fetch(`${API_BASE}/user/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      const userInfo = document.getElementById('userInfo');
      if (userInfo) userInfo.textContent = `👤 ${data.username} | 💰 $${data.balance}`;
    } else {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  } catch (err) {
    console.error(err);
    localStorage.removeItem('token');
    window.location.href = '/';
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

// ====== Load Pending Requests ======
export async function loadPending() {
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
        li.textContent = `${req.fromUser.username} → You: $${req.amount}`;

        const approveBtn = document.createElement('button');
        approveBtn.textContent = 'Approve';
        approveBtn.style.marginLeft = '10px';
        approveBtn.onclick = () => handleApprove(req.id);

        const rejectBtn = document.createElement('button');
        rejectBtn.textContent = 'Reject';
        rejectBtn.style.marginLeft = '5px';
        rejectBtn.onclick = () => handleReject(req.id);

        li.appendChild(approveBtn);
        li.appendChild(rejectBtn);
        list.appendChild(li);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

// ====== Load Transaction History ======
export async function loadHistory() {
  if (!token) return;
  try {
    const res = await fetch(`${API_BASE}/transactions/history`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();

    const list = document.getElementById('history');
    if (!list) return;

    list.innerHTML = '';
    data.forEach((tx) => {
      const li = document.createElement('li');
      const status =
        tx.status === 'pending'
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

// ====== Transaction Handlers ======
export async function handleSend(recipient, amount) {
  try {
    const res = await fetch(`${API_BASE}/transactions/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ recipientUsername: recipient, amount }),
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

export async function handleRequest(recipient, amount) {
  try {
    const res = await fetch(`${API_BASE}/transactions/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ recipientUsername: recipient, amount }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message, 'success');
      loadPending();
      loadHistory();
    } else {
      showToast(data.error, 'error');
    }
  } catch (err) {
    console.error(err);
  }
}

export async function handleApprove(requestId) {
  try {
    const res = await fetch(`${API_BASE}/transactions/request/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ requestId }),
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

export async function handleReject(requestId) {
  try {
    const res = await fetch(`${API_BASE}/transactions/request/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ requestId }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message, 'success');
      loadPending();
      loadHistory();
    } else {
      showToast(data.error, 'error');
    }
  } catch (err) {
    console.error(err);
  }
}

// ====== Form Submissions ======
const sendForm = document.getElementById('sendForm');
if (sendForm) {
  sendForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const recipient = document.getElementById('sendTo').value;
    const amount = parseFloat(document.getElementById('sendAmount').value);
    handleSend(recipient, amount);
  });
}

const requestForm = document.getElementById('requestForm');
if (requestForm) {
  requestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const recipient = document.getElementById('requestFrom').value;
    const amount = parseFloat(document.getElementById('requestAmount').value);
    handleRequest(recipient, amount);
  });
}

// ====== Auto Refresh ======
function startAutoRefresh() {
  setInterval(() => {
    loadPending();
    loadHistory();
  }, 5000);
}

// ====== Initialize ======
loadUser();
loadPending();
loadHistory();
startAutoRefresh();

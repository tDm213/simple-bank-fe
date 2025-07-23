const token = localStorage.getItem('token');
if (!token) location.href = '/';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
};

async function getMe() {
  const res = await fetch('/user/me', { headers });
  const data = await res.json();
  document.getElementById('userInfo').innerHTML =
    `<b>User:</b> ${data.username} | <b>Balance:</b> $${data.balance.toFixed(2)}`;
}

async function sendMoney(e) {
  e.preventDefault();
  const to = document.getElementById('sendTo').value;
  const amount = parseFloat(document.getElementById('sendAmount').value);
  await fetch('/transaction/send', {
    method: 'POST',
    headers,
    body: JSON.stringify({ recipientUsername: to, amount }),
  });
  e.target.reset();
  loadEverything();
}

async function requestMoney(e) {
  e.preventDefault();
  const to = document.getElementById('requestFrom').value;
  const amount = parseFloat(document.getElementById('requestAmount').value);
  await fetch('/transaction/request', {
    method: 'POST',
    headers,
    body: JSON.stringify({ recipientUsername: to, amount }),
  });
  e.target.reset();
  loadEverything();
}

async function getRequests() {
  const res = await fetch('/transaction/requests', { headers });
  const data = await res.json();
  const list = document.getElementById('pendingRequests');
  const emptyMsg = document.getElementById('noPending');
  list.innerHTML = '';

  if (data.length === 0) {
    emptyMsg.classList.remove('hidden');
    return;
  } else {
    emptyMsg.classList.add('hidden');
  }

  data.forEach(req => {
    const li = document.createElement('li');
    li.textContent = `${req.fromUser.username} requests $${req.amount}`;

    const approveBtn = document.createElement('button');
    approveBtn.id = 'approveBtn'
    approveBtn.textContent = 'Approve';
    approveBtn.onclick = async () => {
      await fetch('/transaction/request/approve', {
        method: 'POST',
        headers,
        body: JSON.stringify({ requestId: req.id }),
      });
      loadEverything();
    };

    const rejectBtn = document.createElement('button');
    rejectBtn.id = 'rejectBtn'
    rejectBtn.textContent = 'Reject';
    rejectBtn.onclick = async () => {
      await fetch('/transaction/request/reject', {
        method: 'POST',
        headers,
        body: JSON.stringify({ requestId: req.id }),
      });
      loadEverything();
    };

    li.appendChild(approveBtn);
    li.appendChild(rejectBtn);
    list.appendChild(li);
  });
}

async function getHistory() {
  const res = await fetch('/transaction/history', { headers });
  const data = await res.json();
  const list = document.getElementById('history');
  list.innerHTML = '';
  data.forEach(tx => {
    const li = document.createElement('li');
    const direction = tx.type === 'send'
      ? `Sent $${tx.amount} to ${tx.to}`
      : `Requested $${tx.amount} from ${tx.to}`;
    const result = tx.status === 'completed' ? '✔' : tx.status === 'rejected' ? '✘' : '⏳';
    li.textContent = `${result} ${direction}`;
    list.appendChild(li);
  });
}

function logout() {
  localStorage.removeItem('token');
  location.href = '/';
}

function loadEverything() {
  getMe();
  getRequests();
  getHistory();
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('sendForm')?.addEventListener('submit', sendMoney);
  document.getElementById('requestForm')?.addEventListener('submit', requestMoney);

  // tab switching
  document.getElementById('tabSend')?.addEventListener('click', () => {
    document.getElementById('sendTab').classList.remove('hidden');
    document.getElementById('requestTab').classList.add('hidden');
    document.getElementById('tabSend').classList.add('active');
    document.getElementById('tabRequest').classList.remove('active');
  });

  document.getElementById('tabRequest')?.addEventListener('click', () => {
    document.getElementById('sendTab').classList.add('hidden');
    document.getElementById('requestTab').classList.remove('hidden');
    document.getElementById('tabSend').classList.remove('active');
    document.getElementById('tabRequest').classList.add('active');
  });

  loadEverything();
});
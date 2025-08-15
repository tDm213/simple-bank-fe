import { API_BASE, setToken } from './api.js';

const tabLoginBtn = document.getElementById('tabLogin');
const tabSignupBtn = document.getElementById('tabSignup');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');

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

// Login form
document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (res.ok) {
    setToken(data.token);
    window.location.href = '/dashboard.html';
  } else {
    document.getElementById('loginPassError').textContent = data.error;
    document.getElementById('loginPassError').classList.remove('hidden');
  }
});

// Signup form
document.getElementById('signupForm').addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value;
  const password = document.getElementById('signupPassword').value;

  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (res.ok) {
    setToken(data.token);
    window.location.href = '/dashboard.html';
  } else {
    document.getElementById('signupPassError').textContent = data.error;
    document.getElementById('signupPassError').classList.remove('hidden');
  }
});

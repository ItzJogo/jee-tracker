/**
 * auth.js - Authentication UI and token management
 * 
 * This module handles:
 * - Auth modal UI injection and display
 * - User registration and login flows
 * - Token storage in localStorage (key: 'cloud_token')
 * - Token retrieval for API calls
 * 
 * Non-destructive: Does not modify existing UI or state management.
 */

import { register, login } from './lib/api.js';

const CLOUD_TOKEN_KEY = 'cloud_token';
const CLOUD_USER_KEY = 'cloud_user';

// Modal HTML template
const AUTH_MODAL_HTML = `
<div id="cloudAuthModal" class="modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" style="display: none;">
  <div class="modal-overlay"></div>
  <div class="modal-content">
    <header class="modal-header">
      <h3 id="auth-modal-title" class="modal-title">☁️ Cloud Sync Login</h3>
      <button class="modal-close" id="authModalClose" aria-label="Close modal">&times;</button>
    </header>
    
    <div class="modal-body">
      <!-- Tab Switcher -->
      <div class="auth-tabs" style="display: flex; gap: 10px; margin-bottom: 20px;">
        <button type="button" id="loginTab" class="btn btn-secondary" style="flex: 1;">Login</button>
        <button type="button" id="registerTab" class="btn btn-secondary" style="flex: 1;">Register</button>
      </div>
      
      <!-- Login Form -->
      <form id="loginForm" class="auth-form">
        <div class="form-group">
          <input 
            type="email" 
            id="loginEmail" 
            class="input input-full" 
            placeholder="Email"
            required
            aria-label="Email"
          />
        </div>
        
        <div class="form-group">
          <input 
            type="password" 
            id="loginPassword" 
            class="input input-full" 
            placeholder="Password"
            required
            aria-label="Password"
          />
        </div>
        
        <div id="loginError" class="error-message" style="color: #ff4444; margin-bottom: 10px; display: none;"></div>
        
        <button type="submit" class="btn btn-primary" style="width: 100%;">
          🔐 Login
        </button>
      </form>
      
      <!-- Register Form -->
      <form id="registerForm" class="auth-form" style="display: none;">
        <div class="form-group">
          <input 
            type="text" 
            id="registerName" 
            class="input input-full" 
            placeholder="Full Name"
            required
            aria-label="Full Name"
          />
        </div>
        
        <div class="form-group">
          <input 
            type="email" 
            id="registerEmail" 
            class="input input-full" 
            placeholder="Email"
            required
            aria-label="Email"
          />
        </div>
        
        <div class="form-group">
          <input 
            type="password" 
            id="registerPassword" 
            class="input input-full" 
            placeholder="Password (min 6 chars)"
            required
            minlength="6"
            aria-label="Password"
          />
        </div>
        
        <div id="registerError" class="error-message" style="color: #ff4444; margin-bottom: 10px; display: none;"></div>
        
        <button type="submit" class="btn btn-primary" style="width: 100%;">
          ✨ Create Account
        </button>
      </form>
    </div>
  </div>
</div>
`;

/**
 * Initialize auth module - inject modal HTML
 */
export function initAuth() {
  // Check if modal already exists
  if (document.getElementById('cloudAuthModal')) {
    console.log('[Auth] Modal already initialized');
    return;
  }
  
  // Inject modal into body
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = AUTH_MODAL_HTML;
  document.body.appendChild(modalContainer.firstElementChild);
  
  // Setup event listeners
  setupModalEventListeners();
  
  console.log('[Auth] Module initialized');
}

/**
 * Setup event listeners for the auth modal
 */
function setupModalEventListeners() {
  const modal = document.getElementById('cloudAuthModal');
  const closeBtn = document.getElementById('authModalClose');
  const overlay = modal.querySelector('.modal-overlay');
  
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  // Close modal handlers
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
  
  // Tab switching
  loginTab.addEventListener('click', () => {
    showLoginForm();
  });
  
  registerTab.addEventListener('click', () => {
    showRegisterForm();
  });
  
  // Form submissions
  loginForm.addEventListener('submit', handleLoginSubmit);
  registerForm.addEventListener('submit', handleRegisterSubmit);
}

/**
 * Show the login form tab
 */
function showLoginForm() {
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  loginTab.classList.add('btn-primary');
  loginTab.classList.remove('btn-secondary');
  registerTab.classList.remove('btn-primary');
  registerTab.classList.add('btn-secondary');
  
  loginForm.style.display = 'block';
  registerForm.style.display = 'none';
  
  // Clear errors
  document.getElementById('loginError').style.display = 'none';
}

/**
 * Show the register form tab
 */
function showRegisterForm() {
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  registerTab.classList.add('btn-primary');
  registerTab.classList.remove('btn-secondary');
  loginTab.classList.remove('btn-primary');
  loginTab.classList.add('btn-secondary');
  
  registerForm.style.display = 'block';
  loginForm.style.display = 'none';
  
  // Clear errors
  document.getElementById('registerError').style.display = 'none';
}

/**
 * Handle login form submission
 */
async function handleLoginSubmit(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  
  errorEl.style.display = 'none';
  
  try {
    console.log('[Auth] Attempting login...');
    const result = await login({ email, password });
    
    // Store token and user
    saveToken(result.token);
    saveUser(result.user);
    
    console.log('[Auth] Login successful');
    showToast('✅ Login successful!', 'success');
    
    closeModal();
    
    // Trigger custom event for successful login
    window.dispatchEvent(new CustomEvent('cloudAuthSuccess', { detail: result }));
  } catch (error) {
    console.error('[Auth] Login failed:', error);
    errorEl.textContent = error.message;
    errorEl.style.display = 'block';
    showToast('❌ Login failed: ' + error.message, 'error');
  }
}

/**
 * Handle register form submission
 */
async function handleRegisterSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const errorEl = document.getElementById('registerError');
  
  errorEl.style.display = 'none';
  
  try {
    console.log('[Auth] Attempting registration...');
    const result = await register({ name, email, password });
    
    // Store token and user
    saveToken(result.token);
    saveUser(result.user);
    
    console.log('[Auth] Registration successful');
    showToast('✅ Account created successfully!', 'success');
    
    closeModal();
    
    // Trigger custom event for successful registration
    window.dispatchEvent(new CustomEvent('cloudAuthSuccess', { detail: result }));
  } catch (error) {
    console.error('[Auth] Registration failed:', error);
    errorEl.textContent = error.message;
    errorEl.style.display = 'block';
    showToast('❌ Registration failed: ' + error.message, 'error');
  }
}

/**
 * Open the auth modal
 */
export function openAuthModal() {
  const modal = document.getElementById('cloudAuthModal');
  if (!modal) {
    console.error('[Auth] Modal not initialized');
    return;
  }
  
  modal.style.display = 'block';
  
  // Focus on first input
  setTimeout(() => {
    const firstInput = modal.querySelector('input');
    if (firstInput) firstInput.focus();
  }, 100);
  
  console.log('[Auth] Modal opened');
}

/**
 * Close the auth modal
 */
export function closeModal() {
  const modal = document.getElementById('cloudAuthModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Get the stored auth token
 * @returns {string|null} The token or null if not logged in
 */
export function getToken() {
  return localStorage.getItem(CLOUD_TOKEN_KEY);
}

/**
 * Save auth token to localStorage
 * @param {string} token - The JWT token
 */
function saveToken(token) {
  localStorage.setItem(CLOUD_TOKEN_KEY, token);
}

/**
 * Get the stored user object
 * @returns {Object|null} The user object or null
 */
export function getUser() {
  const userJson = localStorage.getItem(CLOUD_USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (e) {
    console.error('[Auth] Failed to parse user data:', e);
    return null;
  }
}

/**
 * Save user object to localStorage
 * @param {Object} user - The user object
 */
function saveUser(user) {
  localStorage.setItem(CLOUD_USER_KEY, JSON.stringify(user));
}

/**
 * Check if user is logged in
 * @returns {boolean} True if logged in
 */
export function isLoggedIn() {
  return !!getToken();
}

/**
 * Logout - clear token and user data
 */
export function logout() {
  localStorage.removeItem(CLOUD_TOKEN_KEY);
  localStorage.removeItem(CLOUD_USER_KEY);
  console.log('[Auth] Logged out');
  showToast('👋 Logged out from cloud sync', 'info');
}

/**
 * Show a toast notification (uses existing toast system if available)
 */
function showToast(message, type = 'info') {
  // Check if the app's toast system exists
  if (window.showToast && typeof window.showToast === 'function') {
    window.showToast(message, type);
  } else {
    // Fallback to console
    console.log(`[Toast ${type}]`, message);
  }
}

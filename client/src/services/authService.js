const API_URL = '/api/auth';

function getCookie(name) {
  const raw = `; ${document.cookie}`;
  const parts = raw.split(`; ${name}=`);
  if (parts.length !== 2) return null;
  
  try {
    return JSON.parse(decodeURIComponent(parts.pop().split(';').shift()));
  } catch {
    return null;
  }
}

function setCookie(name, value, days = 7) {
  const exp = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; expires=${exp}; path=/; SameSite=Strict`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

async function handleResponse(res) {
  const data = await res.json();
  if (!data.success) {
    const err = new Error(data.error);
    if (data.errors) err.errors = data.errors;
    throw err;
  }
  return data;
}

function getToken() {
  return getCookie('auth')?.token || null;
}

function getUser() {
  return getCookie('auth')?.user || null;
}

function getUserFromStorage() {
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

function setAuth(token, user) {
  setCookie('auth', { token, user });
  localStorage.setItem('user', JSON.stringify(user));
}

function syncFromCookie() {
  const auth = getCookie('auth');
  if (auth) {
    localStorage.setItem('user', JSON.stringify(auth.user));
    return auth.user;
  }
  localStorage.removeItem('user');
  return null;
}

// compares localStorage with cookie, restores if tampered
function validateStorage() {
  const cookie = getCookie('auth');
  const stored = getUserFromStorage();
  
  if (!cookie) {
    if (stored) localStorage.removeItem('user');
    return null;
  }
  
  if (JSON.stringify(stored) !== JSON.stringify(cookie.user)) {
    console.warn('Storage mismatch detected, syncing from cookie...');
    return syncFromCookie();
  }
  
  return cookie.user;
}

function clearAuth() {
  deleteCookie('auth');
  localStorage.removeItem('user');
}

function isAuthenticated() {
  const token = getToken();
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function hasRole(role) {
  return getUser()?.role === role;
}

function isAdmin() {
  return hasRole('ADMIN');
}

export const authService = {
  async register(data) {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await handleResponse(res);
    setAuth(result.data.token, result.data.user);
    return result.data;
  },

  async login(data) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await handleResponse(res);
    setAuth(result.data.token, result.data.user);
    return result.data;
  },

  logout: clearAuth,

  async getProfile() {
    const res = await fetch(`${API_URL}/profile`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return (await handleResponse(res)).data;
  },

  async updateProfile(data) {
    const res = await fetch(`${API_URL}/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(data)
    });
    const result = await handleResponse(res);
    // Update local storage with new user data
    const currentAuth = getCookie('auth');
    if (currentAuth) {
      setAuth(currentAuth.token, result.data);
    }
    return result.data;
  },

  async getAllUsers() {
    const res = await fetch(`${API_URL}/users`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return (await handleResponse(res)).data;
  },

  async updateUserRole(userId, role) {
    const res = await fetch(`${API_URL}/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ role })
    });
    return (await handleResponse(res)).data;
  },

  async toggleUserStatus(userId) {
    const res = await fetch(`${API_URL}/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return (await handleResponse(res)).data;
  },

  async deleteUser(userId) {
    const res = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return await handleResponse(res);
  },

  async uploadAvatar(imageFile) {
    const fd = new FormData();
    fd.append('avatar', imageFile);

    const res = await fetch(`${API_URL}/avatar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: fd
    });
    const result = await handleResponse(res);
    
    // Update local storage with new user data
    const currentAuth = getCookie('auth');
    if (currentAuth) {
      setAuth(currentAuth.token, result.data);
    }
    return result.data;
  },

  async deleteAvatar() {
    const res = await fetch(`${API_URL}/avatar`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const result = await handleResponse(res);
    
    // Update local storage with new user data
    const currentAuth = getCookie('auth');
    if (currentAuth) {
      setAuth(currentAuth.token, result.data);
    }
    return result.data;
  },

  getAvatarUrl(path) {
    return path ? `http://localhost:3000/${path}` : null;
  },

  getToken,
  getUser,
  isAuthenticated,
  hasRole,
  isAdmin,
  validateStorage,
  syncFromCookie
};

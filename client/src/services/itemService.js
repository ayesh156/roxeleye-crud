const API_URL = '/api/items';

function getToken() {
  const raw = `; ${document.cookie}`;
  const parts = raw.split(`; auth=`);
  if (parts.length !== 2) return null;
  
  try {
    return JSON.parse(decodeURIComponent(parts.pop().split(';').shift()))?.token || null;
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
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

export const itemService = {
  async getAll() {
    const res = await fetch(API_URL, { headers: authHeaders() });
    return (await handleResponse(res)).data;
  },

  async getById(id) {
    const res = await fetch(`${API_URL}/${id}`, { headers: authHeaders() });
    return (await handleResponse(res)).data;
  },

  async create(data, imageFile = null) {
    const fd = new FormData();
    fd.append('name', data.name);
    if (data.description) fd.append('description', data.description);
    if (data.price !== undefined) fd.append('price', data.price);
    if (data.quantity !== undefined) fd.append('quantity', data.quantity);
    if (imageFile) fd.append('image', imageFile);

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: fd
    });
    return (await handleResponse(res)).data;
  },

  async update(id, data, imageFile = null) {
    const fd = new FormData();
    if (data.name !== undefined) fd.append('name', data.name);
    if (data.description !== undefined) fd.append('description', data.description);
    if (data.price !== undefined) fd.append('price', data.price);
    if (data.quantity !== undefined) fd.append('quantity', data.quantity);
    if (imageFile) fd.append('image', imageFile);

    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: fd
    });
    return (await handleResponse(res)).data;
  },

  async delete(id) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return await handleResponse(res);
  },

  async deleteImage(id) {
    const res = await fetch(`${API_URL}/${id}/image`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return (await handleResponse(res)).data;
  },

  getImageUrl(path) {
    return path ? `http://localhost:3000/${path}` : null;
  }
};

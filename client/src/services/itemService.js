const API_URL = '/api/items';

// Helper function to handle API responses with validation errors
const handleResponse = async (response) => {
  const result = await response.json();
  if (!result.success) {
    const error = new Error(result.error);
    if (result.errors) {
      error.errors = result.errors;
    }
    throw error;
  }
  return result;
};

export const itemService = {
  // Get all items
  async getAll() {
    const response = await fetch(API_URL);
    const result = await handleResponse(response);
    return result.data;
  },

  // Get single item by ID
  async getById(id) {
    const response = await fetch(`${API_URL}/${id}`);
    const result = await handleResponse(response);
    return result.data;
  },

  // Create new item (with optional image)
  async create(data, imageFile = null) {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.price !== undefined) formData.append('price', data.price);
    if (data.quantity !== undefined) formData.append('quantity', data.quantity);
    if (imageFile) formData.append('image', imageFile);

    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData
    });
    const result = await handleResponse(response);
    return result.data;
  },

  // Update item (with optional image)
  async update(id, data, imageFile = null) {
    const formData = new FormData();
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.price !== undefined) formData.append('price', data.price);
    if (data.quantity !== undefined) formData.append('quantity', data.quantity);
    if (imageFile) formData.append('image', imageFile);

    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      body: formData
    });
    const result = await handleResponse(response);
    return result.data;
  },

  // Delete item
  async delete(id) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    const result = await handleResponse(response);
    return result;
  },

  // Delete item image only
  async deleteImage(id) {
    const response = await fetch(`${API_URL}/${id}/image`, {
      method: 'DELETE'
    });
    const result = await handleResponse(response);
    return result.data;
  },

  // Get image URL
  getImageUrl(imagePath) {
    if (!imagePath) return null;
    return `http://localhost:3000/${imagePath}`;
  }
};

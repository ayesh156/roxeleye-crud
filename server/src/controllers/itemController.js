const prisma = require('../config/database');
const logger = require('../utils/logger');
const { deleteImageFile } = require('../middleware/upload');

// Get all items
const getAllItems = async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    logger.error('Failed to get all items', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single item by ID
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.item.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    logger.error('Failed to get item by ID', { error: error.message, stack: error.stack, itemId: req.params.id });
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new item
const createItem = async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;
    
    // Get image path if file was uploaded
    const imagePath = req.file ? `uploads/items/${req.file.filename}` : null;
    
    const item = await prisma.item.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: parseFloat(price) || 0,
        quantity: parseInt(quantity) || 0,
        image: imagePath
      }
    });
    
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    // Delete uploaded file if database operation fails
    if (req.file) {
      deleteImageFile(`uploads/items/${req.file.filename}`);
    }
    logger.error('Failed to create item', { error: error.message, stack: error.stack, body: req.body });
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, quantity } = req.body;
    
    // Check if item exists
    const existingItem = await prisma.item.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingItem) {
      // Delete uploaded file if item doesn't exist
      if (req.file) {
        deleteImageFile(`uploads/items/${req.file.filename}`);
      }
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    // Handle image update
    let imagePath = existingItem.image;
    if (req.file) {
      // Delete old image if exists
      if (existingItem.image) {
        deleteImageFile(existingItem.image);
      }
      imagePath = `uploads/items/${req.file.filename}`;
    }
    
    const item = await prisma.item.update({
      where: { id: parseInt(id) },
      data: {
        name: name !== undefined ? name : existingItem.name,
        description: description !== undefined ? description : existingItem.description,
        price: price !== undefined ? parseFloat(price) : existingItem.price,
        quantity: quantity !== undefined ? parseInt(quantity) : existingItem.quantity,
        image: imagePath
      }
    });
    
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    // Delete uploaded file if database operation fails
    if (req.file) {
      deleteImageFile(`uploads/items/${req.file.filename}`);
    }
    logger.error('Failed to update item', { error: error.message, stack: error.stack, itemId: req.params.id, body: req.body });
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const itemId = parseInt(id);
    
    // Use transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Check if item exists
      const existingItem = await tx.item.findUnique({
        where: { id: itemId }
      });
      
      if (!existingItem) {
        return { exists: false };
      }
      
      // Delete the item
      await tx.item.delete({
        where: { id: itemId }
      });
      
      return { exists: true, image: existingItem.image };
    });
    
    // If item didn't exist, return success (idempotent delete)
    if (!result.exists) {
      return res.status(200).json({ success: true, message: 'Item already deleted' });
    }
    
    // Delete image file if exists (outside transaction)
    if (result.image) {
      deleteImageFile(result.image);
    }
    
    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    // Handle Prisma "Record not found" error gracefully
    if (error.code === 'P2025') {
      return res.status(200).json({ success: true, message: 'Item already deleted' });
    }
    logger.error('Failed to delete item', { error: error.message, stack: error.stack, itemId: req.params.id });
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete item image only
const deleteItemImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingItem = await prisma.item.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingItem) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    
    if (!existingItem.image) {
      return res.status(400).json({ success: false, error: 'Item has no image' });
    }
    
    // Delete the image file
    deleteImageFile(existingItem.image);
    
    // Update item to remove image reference
    const item = await prisma.item.update({
      where: { id: parseInt(id) },
      data: { image: null }
    });
    
    res.status(200).json({ success: true, data: item, message: 'Image deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete item image', { error: error.message, stack: error.stack, itemId: req.params.id });
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  deleteItemImage
};

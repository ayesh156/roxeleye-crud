const express = require('express');
const router = express.Router();
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  deleteItemImage
} = require('../controllers/itemController');
const {
  createItemValidation,
  updateItemValidation,
  itemIdValidation
} = require('../middleware/itemValidation');
const { upload, handleUploadError, processImage } = require('../middleware/upload');

// GET /api/items - Get all items
router.get('/', getAllItems);

// GET /api/items/:id - Get single item
router.get('/:id', itemIdValidation, getItemById);

// POST /api/items - Create new item (with optional image upload)
router.post('/', upload.single('image'), handleUploadError, processImage, createItemValidation, createItem);

// PUT /api/items/:id - Update item (with optional image upload)
router.put('/:id', upload.single('image'), handleUploadError, processImage, updateItemValidation, updateItem);

// DELETE /api/items/:id - Delete item
router.delete('/:id', itemIdValidation, deleteItem);

// DELETE /api/items/:id/image - Delete item image only
router.delete('/:id/image', itemIdValidation, deleteItemImage);

module.exports = router;

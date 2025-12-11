const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/itemController');
const validate = require('../middleware/itemValidation');
const { upload, handleUploadError, processImage } = require('../middleware/upload');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', ctrl.getAllItems);
router.get('/:id', validate.itemIdValidation, ctrl.getItemById);
router.post('/', upload.single('image'), handleUploadError, processImage, validate.createItemValidation, ctrl.createItem);
router.put('/:id', authorize('ADMIN'), upload.single('image'), handleUploadError, processImage, validate.updateItemValidation, ctrl.updateItem);
router.delete('/:id', authorize('ADMIN'), validate.itemIdValidation, ctrl.deleteItem);
router.delete('/:id/image', authorize('ADMIN'), validate.itemIdValidation, ctrl.deleteItemImage);

module.exports = router;

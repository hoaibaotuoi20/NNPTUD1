const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');

// GET all
router.get('/', inventoryController.getAll);

// GET inventory by ID
router.get('/:id', inventoryController.getById);

// Add_stock (POST: tăng stock)
router.post('/add-stock', inventoryController.addStock);

// Remove_stock (POST: giảm stock)
router.post('/remove-stock', inventoryController.removeStock);

// Reservation (POST: giảm stock, tăng reserved)
router.post('/reservation', inventoryController.reservation);

// Sold (POST: giảm reservation, tăng soldCount)
router.post('/sold', inventoryController.sold);

module.exports = router;

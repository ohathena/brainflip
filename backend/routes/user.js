const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

router.get('/stats', authMiddleware, getStats);

module.exports = router;

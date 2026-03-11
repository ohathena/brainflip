const express = require('express');
const router = express.Router();
const { saveResult } = require('../controllers/gameController');
const authMiddleware = require('../middleware/auth');

router.post('/result', authMiddleware, saveResult);

module.exports = router;

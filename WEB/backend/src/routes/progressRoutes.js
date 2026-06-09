const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, progressController.updateProgress);
router.get('/:courseId', verifyToken, progressController.getProgressByCourse);

module.exports = router;

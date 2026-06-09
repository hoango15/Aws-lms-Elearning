const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, enrollmentController.enroll);
router.get('/my-courses', verifyToken, enrollmentController.getMyCourses);

module.exports = router;

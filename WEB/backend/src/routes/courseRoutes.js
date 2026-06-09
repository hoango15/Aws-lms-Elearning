const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourseById);

// Admin-only routes
router.post('/', verifyToken, isAdmin, upload.single('thumbnail'), courseController.createCourse);
router.put('/:id', verifyToken, isAdmin, upload.single('thumbnail'), courseController.updateCourse);
router.delete('/:id', verifyToken, isAdmin, courseController.deleteCourse);
router.get('/:id/enrollments', verifyToken, isAdmin, courseController.getCourseEnrollments);

module.exports = router;

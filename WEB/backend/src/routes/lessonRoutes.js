const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Public route to view lessons of a course
router.get('/course/:courseId', lessonController.getLessonsByCourseId);

// Admin-only mutation routes
router.post('/', verifyToken, isAdmin, lessonController.createLesson);
router.put('/:id', verifyToken, isAdmin, lessonController.updateLesson);
router.delete('/:id', verifyToken, isAdmin, lessonController.deleteLesson);

module.exports = router;

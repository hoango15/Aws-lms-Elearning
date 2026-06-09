const db = require('../config/db');

// Mark lesson as completed or incomplete
exports.updateProgress = async (req, res, next) => {
  try {
    const { lesson_id, completed } = req.body;
    const user_id = req.user.id;

    if (!lesson_id) {
      return res.status(400).json({ success: false, message: 'Lesson ID is required.' });
    }

    // Verify lesson exists
    const [lessons] = await db.query('SELECT course_id FROM lessons WHERE id = ?', [lesson_id]);
    if (lessons.length === 0) {
      return res.status(404).json({ success: false, message: 'Lesson not found.' });
    }

    const course_id = lessons[0].course_id;

    // Verify user is enrolled in the course first
    const [enrollment] = await db.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [user_id, course_id]
    );

    if (enrollment.length === 0) {
      return res.status(403).json({ success: false, message: 'You must be enrolled in the course to track progress.' });
    }

    // Set completion status (defaulting to true)
    const isCompleted = completed !== undefined ? (completed ? 1 : 0) : 1;

    // Insert or update progress
    await db.query(
      `INSERT INTO progress (user_id, lesson_id, completed) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE completed = ?`,
      [user_id, lesson_id, isCompleted, isCompleted]
    );

    res.status(200).json({
      success: true,
      message: 'Progress updated successfully.',
      completed: isCompleted === 1
    });
  } catch (error) {
    next(error);
  }
};

// Get progress for a specific course
exports.getProgressByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const user_id = req.user.id;

    // Fetch lessons completed by user in this course
    const query = `
      SELECT p.lesson_id, p.completed 
      FROM progress p
      JOIN lessons l ON p.lesson_id = l.id
      WHERE l.course_id = ? AND p.user_id = ? AND p.completed = 1
    `;

    const [progress] = await db.query(query, [courseId, user_id]);

    const completedLessonIds = progress.map(p => p.lesson_id);

    res.status(200).json({
      success: true,
      completedLessonIds
    });
  } catch (error) {
    next(error);
  }
};

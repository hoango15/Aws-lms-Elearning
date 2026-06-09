const db = require('../config/db');

// Enroll in a course
exports.enroll = async (req, res, next) => {
  try {
    const { course_id } = req.body;
    const user_id = req.user.id;

    if (!course_id) {
      return res.status(400).json({ success: false, message: 'Course ID is required.' });
    }

    // Check if course exists
    const [courses] = await db.query('SELECT id FROM courses WHERE id = ?', [course_id]);
    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Check if already enrolled
    const [existing] = await db.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [user_id, course_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this course.' });
    }

    // Enroll
    await db.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
      [user_id, course_id]
    );

    res.status(201).json({
      success: true,
      message: 'Enrolled in course successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Get list of courses enrolled by logged-in user with learning progress
exports.getMyCourses = async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const query = `
      SELECT 
        c.id, 
        c.title, 
        c.description, 
        c.thumbnail, 
        c.created_at, 
        e.enrolled_at,
        (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) as total_lessons,
        (SELECT COUNT(*) FROM progress p 
         JOIN lessons l ON p.lesson_id = l.id 
         WHERE l.course_id = c.id AND p.user_id = ? AND p.completed = 1) as completed_lessons
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = ?
      ORDER BY e.enrolled_at DESC
    `;

    const [courses] = await db.query(query, [user_id, user_id]);

    // Format results to include progress percentage
    const formattedCourses = courses.map(course => {
      const total = parseInt(course.total_lessons || 0);
      const completed = parseInt(course.completed_lessons || 0);
      const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        ...course,
        total_lessons: total,
        completed_lessons: completed,
        progress_percent: progressPercent
      };
    });

    res.status(200).json({
      success: true,
      count: formattedCourses.length,
      courses: formattedCourses
    });
  } catch (error) {
    next(error);
  }
};

const db = require('../config/db');

// Get all lessons for a specific course
exports.getLessonsByCourseId = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;

    // Check if course exists
    const [courses] = await db.query('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const [lessons] = await db.query(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY lesson_order ASC',
      [courseId]
    );

    res.status(200).json({
      success: true,
      count: lessons.length,
      lessons
    });
  } catch (error) {
    next(error);
  }
};

// Create a new lesson (Admin only)
exports.createLesson = async (req, res, next) => {
  try {
    const { course_id, title, content, video_url, lesson_order } = req.body;

    if (!course_id || !title || !content) {
      return res.status(400).json({ success: false, message: 'Course ID, title, and content are required.' });
    }

    // Check if course exists
    const [courses] = await db.query('SELECT id FROM courses WHERE id = ?', [course_id]);
    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Determine lesson order if not provided
    let finalOrder = lesson_order;
    if (finalOrder === undefined || finalOrder === null) {
      const [maxOrder] = await db.query('SELECT MAX(lesson_order) as max FROM lessons WHERE course_id = ?', [course_id]);
      finalOrder = (maxOrder[0].max || 0) + 1;
    } else {
      // Check if order already exists
      const [existingOrder] = await db.query('SELECT id FROM lessons WHERE course_id = ? AND lesson_order = ?', [course_id, finalOrder]);
      if (existingOrder.length > 0) {
        return res.status(400).json({ success: false, message: `Lesson order ${finalOrder} already exists for this course.` });
      }
    }

    const [result] = await db.query(
      'INSERT INTO lessons (course_id, title, content, video_url, lesson_order) VALUES (?, ?, ?, ?, ?)',
      [course_id, title, content, video_url || null, finalOrder]
    );

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully.',
      lesson: {
        id: result.insertId,
        course_id,
        title,
        content,
        video_url,
        lesson_order: finalOrder
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update an existing lesson (Admin only)
exports.updateLesson = async (req, res, next) => {
  try {
    const lessonId = req.params.id;
    const { title, content, video_url, lesson_order } = req.body;

    // Check if lesson exists
    const [existing] = await db.query('SELECT * FROM lessons WHERE id = ?', [lessonId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Lesson not found.' });
    }

    const courseId = existing[0].course_id;

    let finalOrder = lesson_order;
    if (finalOrder !== undefined && finalOrder !== null && finalOrder !== existing[0].lesson_order) {
      // Check if new order already exists for this course
      const [existingOrder] = await db.query('SELECT id FROM lessons WHERE course_id = ? AND lesson_order = ? AND id != ?', [courseId, finalOrder, lessonId]);
      if (existingOrder.length > 0) {
        return res.status(400).json({ success: false, message: `Lesson order ${finalOrder} already exists for this course.` });
      }
    } else {
      finalOrder = existing[0].lesson_order;
    }

    await db.query(
      'UPDATE lessons SET title = ?, content = ?, video_url = ?, lesson_order = ? WHERE id = ?',
      [
        title || existing[0].title,
        content || existing[0].content,
        video_url !== undefined ? video_url : existing[0].video_url,
        finalOrder,
        lessonId
      ]
    );

    const [updated] = await db.query('SELECT * FROM lessons WHERE id = ?', [lessonId]);

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully.',
      lesson: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete a lesson (Admin only)
exports.deleteLesson = async (req, res, next) => {
  try {
    const lessonId = req.params.id;

    // Check if lesson exists
    const [existing] = await db.query('SELECT id FROM lessons WHERE id = ?', [lessonId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Lesson not found.' });
    }

    await db.query('DELETE FROM lessons WHERE id = ?', [lessonId]);

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

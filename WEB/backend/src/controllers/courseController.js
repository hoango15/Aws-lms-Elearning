const db = require('../config/db');

// Get all courses (with optional search query)
exports.getCourses = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM courses';
    let params = [];

    if (search) {
      query += ' WHERE title LIKE ? OR description LIKE ?';
      const searchPattern = `%${search}%`;
      params = [searchPattern, searchPattern];
    }

    query += ' ORDER BY created_at DESC';

    const [courses] = await db.query(query, params);

    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    next(error);
  }
};

// Get single course details and its lessons
exports.getCourseById = async (req, res, next) => {
  try {
    const courseId = req.params.id;

    // Get course details
    const [courses] = await db.query('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const course = courses[0];

    // Get associated lessons
    const [lessons] = await db.query(
      'SELECT id, title, content, video_url, lesson_order FROM lessons WHERE course_id = ? ORDER BY lesson_order ASC',
      [courseId]
    );

    course.lessons = lessons;

    res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    next(error);
  }
};

// Create a new course (Admin only)
exports.createCourse = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    let thumbnail = null;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    if (req.file) {
      thumbnail = `/uploads/${req.file.filename}`;
    }

    const [result] = await db.query(
      'INSERT INTO courses (title, description, thumbnail) VALUES (?, ?, ?)',
      [title, description, thumbnail]
    );

    res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      course: {
        id: result.insertId,
        title,
        description,
        thumbnail
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update an existing course (Admin only)
exports.updateCourse = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const { title, description } = req.body;

    // Check if course exists
    const [existing] = await db.query('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    let query = 'UPDATE courses SET title = ?, description = ?';
    let params = [title || existing[0].title, description || existing[0].description];

    if (req.file) {
      const thumbnail = `/uploads/${req.file.filename}`;
      query += ', thumbnail = ?';
      params.push(thumbnail);
    }

    query += ' WHERE id = ?';
    params.push(courseId);

    await db.query(query, params);

    // Fetch updated course details
    const [updated] = await db.query('SELECT * FROM courses WHERE id = ?', [courseId]);

    res.status(200).json({
      success: true,
      message: 'Course updated successfully.',
      course: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// Delete a course (Admin only)
exports.deleteCourse = async (req, res, next) => {
  try {
    const courseId = req.params.id;

    // Check if course exists
    const [existing] = await db.query('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // Delete course (Foreign key constraints ON DELETE CASCADE will handle associated lessons, enrollments, etc.)
    await db.query('DELETE FROM courses WHERE id = ?', [courseId]);

    res.status(200).json({
      success: true,
      message: 'Course and all its associated lessons, enrollments, and progress deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Get list of enrolled users for a course (Admin only)
exports.getCourseEnrollments = async (req, res, next) => {
  try {
    const courseId = req.params.id;

    // Check if course exists
    const [courses] = await db.query('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const [enrollments] = await db.query(
      `SELECT u.id, u.fullname, u.email, e.enrolled_at 
       FROM enrollments e 
       JOIN users u ON e.user_id = u.id 
       WHERE e.course_id = ? 
       ORDER BY e.enrolled_at DESC`,
      [courseId]
    );

    res.status(200).json({
      success: true,
      enrollments
    });
  } catch (error) {
    next(error);
  }
};

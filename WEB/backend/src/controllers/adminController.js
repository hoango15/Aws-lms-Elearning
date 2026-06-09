const db = require('../config/db');

// Get system-wide stats for admin dashboard
exports.getStats = async (req, res, next) => {
  try {
    // 1. Total count queries
    const [[{ count: totalUsers }]] = await db.query('SELECT COUNT(*) as count FROM users');
    const [[{ count: totalCourses }]] = await db.query('SELECT COUNT(*) as count FROM courses');
    const [[{ count: totalLessons }]] = await db.query('SELECT COUNT(*) as count FROM lessons');
    const [[{ count: totalEnrollments }]] = await db.query('SELECT COUNT(*) as count FROM enrollments');

    // 2. Enrollments per course (for bar chart)
    const [enrollmentsPerCourse] = await db.query(`
      SELECT c.title, COUNT(e.id) as enrollment_count 
      FROM courses c 
      LEFT JOIN enrollments e ON c.id = e.course_id 
      GROUP BY c.id, c.title
    `);

    // 3. User roles split (for pie/doughnut chart)
    const [rolesDistribution] = await db.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalLessons,
        totalEnrollments,
        enrollmentsPerCourse,
        rolesDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get list of all users
exports.getUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(
      'SELECT id, fullname, email, role, avatar, created_at FROM users ORDER BY created_at DESC'
    );

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// Delete a user
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const [user] = await db.query('SELECT id, role FROM users WHERE id = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent deleting oneself
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    // Delete user (cascade delete deletes enrollment, progress, etc.)
    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

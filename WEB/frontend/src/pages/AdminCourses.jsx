import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaBookOpen, FaFilm, FaUserGraduate, FaArrowUp, FaTimes } from 'react-icons/fa';

const AdminCourses = () => {
  // Course State Lists
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected course context (for lessons/roster view)
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [roster, setRoster] = useState([]);
  const [loadingContext, setLoadingContext] = useState(false);
  const [contextTab, setContextTab] = useState('lessons'); // 'lessons' or 'roster'

  // Course Form Modal/States
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseFormId, setCourseFormId] = useState(null); // null = add, ID = edit
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseThumb, setCourseThumb] = useState(null);
  const [courseThumbPreview, setCourseThumbPreview] = useState('');
  const [courseFormSubmitting, setCourseFormSubmitting] = useState(false);

  // Lesson Form States
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonFormId, setLessonFormId] = useState(null); // null = add, ID = edit
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonVideo, setLessonVideo] = useState('');
  const [lessonOrder, setLessonOrder] = useState('');
  const [lessonFormSubmitting, setLessonFormSubmitting] = useState(false);

  // General feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses');
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const loadCourseContext = async (course) => {
    setSelectedCourse(course);
    setLoadingContext(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      // Load Lessons
      const lessonsRes = await api.get(`/lessons/course/${course.id}`);
      if (lessonsRes.data.success) {
        setLessons(lessonsRes.data.lessons);
      }
      // Load Enrolled Students
      const rosterRes = await api.get(`/courses/${course.id}/enrollments`);
      if (rosterRes.data.success) {
        setRoster(rosterRes.data.enrollments);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load course details context.');
    } finally {
      setLoadingContext(false);
    }
  };

  // Course Mutation CRUD Handlers
  const handleOpenCourseAdd = () => {
    setCourseFormId(null);
    setCourseTitle('');
    setCourseDesc('');
    setCourseThumb(null);
    setCourseThumbPreview('');
    setShowCourseForm(true);
  };

  const handleOpenCourseEdit = (course) => {
    setCourseFormId(course.id);
    setCourseTitle(course.title);
    setCourseDesc(course.description);
    setCourseThumb(null);
    setCourseThumbPreview(course.thumbnail || '');
    setShowCourseForm(true);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setCourseFormSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', courseTitle);
      formData.append('description', courseDesc);
      if (courseThumb) {
        formData.append('thumbnail', courseThumb);
      }

      let res;
      if (courseFormId) {
        res = await api.put(`/courses/${courseFormId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/courses', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        setSuccessMsg(courseFormId ? 'Course updated successfully.' : 'Course created successfully.');
        setShowCourseForm(false);
        fetchCourses();
        if (selectedCourse && selectedCourse.id === courseFormId) {
          setSelectedCourse(res.data.course);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit course form.');
    } finally {
      setCourseFormSubmitting(false);
    }
  };

  const handleCourseDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? All associated lessons and enrollments will be deleted permanently.')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.delete(`/courses/${courseId}`);
      if (res.data.success) {
        setSuccessMsg('Course deleted successfully.');
        fetchCourses();
        if (selectedCourse && selectedCourse.id === courseId) {
          setSelectedCourse(null);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to delete course.');
    }
  };

  // Lesson Mutation CRUD Handlers
  const handleOpenLessonAdd = () => {
    setLessonFormId(null);
    setLessonTitle('');
    setLessonContent('');
    setLessonVideo('');
    // Propose default order
    const nextOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.lesson_order)) + 1 : 1;
    setLessonOrder(nextOrder.toString());
    setShowLessonForm(true);
  };

  const handleOpenLessonEdit = (lesson) => {
    setLessonFormId(lesson.id);
    setLessonTitle(lesson.title);
    setLessonContent(lesson.content);
    setLessonVideo(lesson.video_url || '');
    setLessonOrder(lesson.lesson_order.toString());
    setShowLessonForm(true);
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLessonFormSubmitting(true);

    const payload = {
      course_id: selectedCourse.id,
      title: lessonTitle,
      content: lessonContent,
      video_url: lessonVideo || null,
      lesson_order: parseInt(lessonOrder)
    };

    try {
      let res;
      if (lessonFormId) {
        res = await api.put(`/lessons/${lessonFormId}`, payload);
      } else {
        res = await api.post('/lessons', payload);
      }

      if (res.data.success) {
        setSuccessMsg(lessonFormId ? 'Lesson updated successfully.' : 'Lesson created successfully.');
        setShowLessonForm(false);
        // Refresh context
        loadCourseContext(selectedCourse);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit lesson.');
    } finally {
      setLessonFormSubmitting(false);
    }
  };

  const handleLessonDelete = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.delete(`/lessons/${lessonId}`);
      if (res.data.success) {
        setSuccessMsg('Lesson deleted successfully.');
        loadCourseContext(selectedCourse);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to delete lesson.');
    }
  };

  return (
    <div className="container py-5 fade-in-el text-start">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-5 gap-3">
        <div>
          <h2 className="text-white fw-extrabold mb-1">Manage Course Catalog</h2>
          <p className="text-muted mb-0">Create, update, and manage learning tracks and syllabus lessons.</p>
        </div>
        <button onClick={handleOpenCourseAdd} className="btn btn-primary px-4 py-2.5 rounded-pill d-flex align-items-center gap-2">
          <FaPlus /> Add New Course
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success border-0 bg-success bg-opacity-10 text-success small py-2 px-3 mb-4 rounded-3">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger small py-2 px-3 mb-4 rounded-3">
          {errorMsg}
        </div>
      )}

      {/* Grid of existing courses */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-4 mb-5">
          {courses.map((c) => (
            <div className="col-lg-4 col-md-6" key={c.id}>
              <div className={`card h-100 glass-card text-start overflow-hidden d-flex flex-column ${selectedCourse?.id === c.id ? 'border-primary' : ''}`}>
                {c.thumbnail ? (
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    className="card-img-top object-fit-cover"
                    style={{ height: '150px' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentNode.innerHTML = `<div class="img-fallback" style="height: 150px">🎓 ${c.title}</div>`;
                    }}
                  />
                ) : (
                  <div className="img-fallback" style={{ height: '150px' }}>
                    🎓 {c.title}
                  </div>
                )}
                <div className="card-body p-4 d-flex flex-column">
                  <h6 className="card-title text-white fw-bold mb-2 text-truncate">{c.title}</h6>
                  <p className="card-text text-muted small flex-grow-1" style={{ fontSize: '12px' }}>
                    {c.description.substring(0, 100)}...
                  </p>

                  <div className="d-flex justify-content-between gap-2 mt-4 pt-3 border-top border-secondary border-opacity-25">
                    <button
                      onClick={() => loadCourseContext(c)}
                      className="btn btn-outline-light btn-sm px-2.5 rounded-3"
                      style={{ fontSize: '11px' }}
                    >
                      Manage
                    </button>
                    <div className="d-flex gap-1">
                      <button
                        onClick={() => handleOpenCourseEdit(c)}
                        className="btn btn-secondary bg-opacity-20 text-white btn-sm px-2 rounded-3 border-0"
                        title="Edit course details"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleCourseDelete(c.id)}
                        className="btn btn-danger bg-opacity-20 text-danger btn-sm px-2 rounded-3 border-0"
                        title="Delete course"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course administration pane (if selected) */}
      {selectedCourse && (
        <div className="card glass-card p-4 p-md-5 mt-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom border-secondary border-opacity-20 gap-3">
            <div>
              <span className="badge bg-primary bg-opacity-10 text-primary mb-2">Selected Course</span>
              <h3 className="text-white fw-bold mb-1">{selectedCourse.title}</h3>
              <p className="text-muted small mb-0">Auditing syllabus components and enrolled students.</p>
            </div>
            <div className="d-flex gap-2">
              <button
                onClick={() => setContextTab('lessons')}
                className={`btn btn-sm px-4 rounded-pill ${contextTab === 'lessons' ? 'btn-primary' : 'btn-outline-light'}`}
              >
                Lessons ({lessons.length})
              </button>
              <button
                onClick={() => setContextTab('roster')}
                className={`btn btn-sm px-4 rounded-pill ${contextTab === 'roster' ? 'btn-primary' : 'btn-outline-light'}`}
              >
                Roster ({roster.length})
              </button>
              <button onClick={() => setSelectedCourse(null)} className="btn btn-outline-danger btn-sm rounded-circle p-2" title="Close Workspace">
                <FaTimes />
              </button>
            </div>
          </div>

          {loadingContext ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : (
            <div>
              {contextTab === 'lessons' ? (
                /* Lessons Tab */
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="text-white fw-bold mb-0">Syllabus Lectures</h5>
                    <button onClick={handleOpenLessonAdd} className="btn btn-primary btn-sm px-3 rounded-pill d-flex align-items-center gap-2">
                      <FaPlus size={10} /> Add Lesson
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-dark table-hover border-secondary align-middle small">
                      <thead>
                        <tr>
                          <th style={{ width: '80px' }}>Order</th>
                          <th>Lecture Title</th>
                          <th>Video URL</th>
                          <th style={{ width: '120px' }} className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lessons.length > 0 ? (
                          lessons.map((lesson) => (
                            <tr key={lesson.id}>
                              <td className="fw-bold text-primary">#{lesson.lesson_order}</td>
                              <td className="text-white fw-semibold">{lesson.title}</td>
                              <td className="text-muted text-truncate" style={{ maxWidth: '200px' }}>
                                {lesson.video_url || 'No Video'}
                              </td>
                              <td className="text-end">
                                <div className="d-flex justify-content-end gap-1">
                                  <button
                                    onClick={() => handleOpenLessonEdit(lesson)}
                                    className="btn btn-secondary bg-opacity-20 text-white btn-sm px-2 border-0"
                                    title="Edit lesson content"
                                  >
                                    <FaEdit size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleLessonDelete(lesson.id)}
                                    className="btn btn-danger bg-opacity-20 text-danger btn-sm px-2 border-0"
                                    title="Delete lesson"
                                  >
                                    <FaTrash size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center text-muted py-4">No lessons added to this course yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* Roster Tab */
                <div>
                  <h5 className="text-white fw-bold mb-4">Registered Students</h5>
                  <div className="table-responsive">
                    <table className="table table-dark table-hover border-secondary align-middle small">
                      <thead>
                        <tr>
                          <th>Full Name</th>
                          <th>Email Address</th>
                          <th>Enrollment Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roster.length > 0 ? (
                          roster.map((student) => (
                            <tr key={student.id}>
                              <td className="text-white fw-semibold">{student.fullname}</td>
                              <td className="text-muted">{student.email}</td>
                              <td className="text-muted">
                                {new Date(student.enrolled_at).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center text-muted py-4">No students enrolled in this course.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Course Creator/Editor Form Box Overlay */}
      {showCourseForm && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75 z-3">
          <div className="card glass-card p-4 p-md-5 w-100 m-3" style={{ maxWidth: '600px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="text-white fw-bold mb-0">{courseFormId ? 'Edit Course Details' : 'Add New Course'}</h4>
              <button onClick={() => setShowCourseForm(false)} className="btn btn-outline-light btn-sm rounded-circle p-1">
                <FaTimes size={16} />
              </button>
            </div>
            
            <form onSubmit={handleCourseSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Course Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Mastering React 19"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Course Description</label>
                <textarea
                  className="form-control"
                  placeholder="Provide an overview of the curriculum..."
                  rows="4"
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small fw-semibold">Course Thumbnail Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={(e) => setCourseThumb(e.target.files[0])}
                />
                {courseThumbPreview && !courseThumb && (
                  <div className="mt-2 text-muted small">Current thumbnail: {courseThumbPreview}</div>
                )}
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button type="button" onClick={() => setShowCourseForm(false)} className="btn btn-outline-light px-4">
                  Cancel
                </button>
                <button type="submit" disabled={courseFormSubmitting} className="btn btn-primary px-4">
                  {courseFormSubmitting ? <span className="spinner-border spinner-border-sm"></span> : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Form Overlay Box */}
      {showLessonForm && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75 z-3">
          <div className="card glass-card p-4 p-md-5 w-100 m-3" style={{ maxWidth: '600px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="text-white fw-bold mb-0">{lessonFormId ? 'Edit Syllabus Lesson' : 'Add New Lesson'}</h4>
              <button onClick={() => setShowLessonForm(false)} className="btn btn-outline-light btn-sm rounded-circle p-1">
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleLessonSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-sm-9">
                  <label className="form-label text-muted small fw-semibold">Lesson Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Section 1: Introduction to AWS"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="col-sm-3">
                  <label className="form-label text-muted small fw-semibold">Lesson Order</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={lessonOrder}
                    onChange={(e) => setLessonOrder(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Video URL (YouTube, Vimeo, or Direct Video Link)</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  value={lessonVideo}
                  onChange={(e) => setLessonVideo(e.target.value)}
                />
                <span className="text-muted small" style={{ fontSize: '10px' }}>Paste any standard video link (YouTube watch/share link, Vimeo video, or direct MP4 video URL). The system will automatically process and render it.</span>
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small fw-semibold">Lesson Content / Description</label>
                <textarea
                  className="form-control"
                  placeholder="Provide detailed written information for this lecture..."
                  rows="5"
                  value={lessonContent}
                  onChange={(e) => setLessonContent(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <button type="button" onClick={() => setShowLessonForm(false)} className="btn btn-outline-light px-4">
                  Cancel
                </button>
                <button type="submit" disabled={lessonFormSubmitting} className="btn btn-primary px-4">
                  {lessonFormSubmitting ? <span className="spinner-border spinner-border-sm"></span> : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;

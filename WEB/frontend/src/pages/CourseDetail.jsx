import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import api from '../services/api';
import { FaPlay, FaCheckCircle, FaLock, FaGraduationCap, FaArrowLeft, FaCheck } from 'react-icons/fa';

const getVideoDetails = (url) => {
  if (!url) return { type: 'none', url: null };
  const cleanUrl = url.trim();

  // 1. Direct video file links (ends with extension or has common pattern)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(cleanUrl)) {
    return { type: 'direct', url: cleanUrl };
  }

  // 2. YouTube checks
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|live\/)([^#\&\?]*).*/;
  const ytMatch = cleanUrl.match(ytRegExp);
  if (ytMatch && ytMatch[2].length === 11) {
    return { type: 'youtube', url: `https://www.youtube.com/embed/${ytMatch[2]}` };
  }
  
  // Raw 11-char ID
  if (cleanUrl.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return { type: 'youtube', url: `https://www.youtube.com/embed/${cleanUrl}` };
  }

  // 3. Vimeo checks
  const vimeoRegExp = /(?:vimeo)\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|showcase\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
  const vimeoMatch = cleanUrl.match(vimeoRegExp);
  if (vimeoMatch && vimeoMatch[4]) {
    return { type: 'vimeo', url: `https://player.vimeo.com/video/${vimeoMatch[4]}` };
  }

  // 4. Default generic iframe
  let fallbackUrl = cleanUrl;
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    fallbackUrl = `https://${cleanUrl}`;
  }
  return { type: 'iframe', url: fallbackUrl };
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [progressUpdating, setProgressUpdating] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        // 1. Get Course and lessons
        const courseRes = await api.get(`/courses/${id}`);
        if (courseRes.data.success) {
          setCourse(courseRes.data.course);
          setLessons(courseRes.data.course.lessons || []);
          
          if (courseRes.data.course.lessons && courseRes.data.course.lessons.length > 0) {
            setActiveLesson(courseRes.data.course.lessons[0]);
          }
        }

        // 2. If logged in, check enrollment and learning progress
        if (token && user) {
          const enrollRes = await api.get('/enrollments/my-courses');
          if (enrollRes.data.success) {
            const isMyCourse = enrollRes.data.courses.some(c => c.id === parseInt(id));
            setEnrolled(isMyCourse);
            
            if (isMyCourse) {
              const progressRes = await api.get(`/progress/${id}`);
              if (progressRes.data.success) {
                setCompletedLessons(progressRes.data.completedLessonIds || []);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to load course details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id, token, user]);

  const handleEnroll = async () => {
    if (!token) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } });
      return;
    }

    try {
      setEnrolling(true);
      const res = await api.post('/enrollments', { course_id: id });
      if (res.data.success) {
        setEnrolled(true);
        // Fetch progress for this new enrolled course (should be empty but good practice)
        const progressRes = await api.get(`/progress/${id}`);
        if (progressRes.data.success) {
          setCompletedLessons(progressRes.data.completedLessonIds || []);
        }
      }
    } catch (error) {
      console.error('Enrollment failed:', error);
    } finally {
      setEnrolling(false);
    }
  };

  const handleToggleComplete = async (lessonId) => {
    if (progressUpdating) return;

    const isCompleted = completedLessons.includes(lessonId);
    try {
      setProgressUpdating(true);
      const res = await api.post('/progress', {
        lesson_id: lessonId,
        completed: !isCompleted
      });

      if (res.data.success) {
        if (isCompleted) {
          setCompletedLessons(completedLessons.filter(lid => lid !== lessonId));
        } else {
          setCompletedLessons([...completedLessons, lessonId]);
        }
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setProgressUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark text-white">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-white">Course Not Found</h3>
        <Link to="/courses" className="btn btn-primary mt-3">Back to Courses</Link>
      </div>
    );
  }

  return (
    <div className="container py-5 fade-in-el text-start">
      <Link to="/courses" className="btn btn-link text-secondary text-decoration-none d-inline-flex align-items-center gap-2 mb-4 px-0">
        <FaArrowLeft size={14} /> {t('backToCatalog')}
      </Link>

      {/* Main layout depends on enrollment */}
      {!enrolled ? (
        /* Preview / Guest Mode */
        <div className="row g-4 justify-content-between">
          <div className="col-lg-7">
            <h1 className="text-white display-5 fw-extrabold mb-3">{course.title}</h1>
            <p className="text-muted fs-5 mb-4">{course.description}</p>
            
            <h4 className="text-white mt-5 mb-4 fw-bold">{t('syllabusOverview')}</h4>
            <div className="d-flex flex-column gap-3 mb-4">
              {lessons.length > 0 ? (
                lessons.map((lesson, idx) => (
                  <div className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-glass border border-secondary border-opacity-25" key={lesson.id}>
                    <div className="d-flex align-items-center gap-3">
                      <span className="text-primary small fw-bold">#{idx + 1}</span>
                      <span className="text-white fw-medium">{lesson.title}</span>
                    </div>
                    <FaLock className="text-muted" size={14} />
                  </div>
                ))
              ) : (
                <p className="text-muted">{t('noLessonsUploaded')}</p>
              )}
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card glass-card overflow-hidden sticky-top" style={{ top: '100px' }}>
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="card-img-top object-fit-cover"
                  style={{ height: '220px' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.parentNode.innerHTML = `<div class="img-fallback" style="height: 220px">🎓 ${course.title}</div>`;
                  }}
                />
              ) : (
                <div className="img-fallback" style={{ height: '220px' }}>
                  🎓 {course.title}
                </div>
              )}
              <div className="card-body p-4">
                <h4 className="text-white fw-bold mb-3">{t('getAccess')}</h4>
                <p className="text-muted small mb-4">{t('getAccessDesc')}</p>
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="btn btn-primary w-100 py-3 rounded-3 text-white shadow-sm fw-semibold d-flex align-items-center justify-content-center gap-2"
                >
                  {enrolling ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <>
                      <FaGraduationCap size={18} /> {t('enrollCourse')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Enrolled Mode - Skeuomorphic Book Spread Layout */
        <div className="row g-0 enrolled-book-spread">
          {/* Lecture Playlist Column (Left Page) */}
          <div className="col-lg-4 book-page-left">
            <div className="d-flex flex-column h-100" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              <h5 className="book-index-title mb-4">{t('courseSyllabus')}</h5>
              <div className="d-flex flex-column gap-2 pe-2">
                {lessons.map((lesson, idx) => {
                  const isActive = activeLesson && activeLesson.id === lesson.id;
                  const isCompleted = completedLessons.includes(lesson.id);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`btn book-index-item d-flex align-items-center justify-content-between p-3 rounded-2 w-100 transition-all ${
                        isActive
                          ? 'active-item'
                          : 'inactive-item'
                      }`}
                    >
                      <div className="d-flex align-items-center gap-2 overflow-hidden">
                        <span className="idx-num">
                          #{idx + 1}
                        </span>
                        <span className="title-text text-truncate">
                          {lesson.title}
                        </span>
                      </div>
                      {isCompleted && (
                        <FaCheckCircle className="check-icon" size={16} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Lecture Content Column (Right Page) */}
          <div className="col-lg-8 book-page-right">
            {activeLesson ? (
              <div className="d-flex flex-column h-100">
                {/* Responsive Embedded Video Player */}
                {activeLesson.video_url ? (() => {
                  const videoInfo = getVideoDetails(activeLesson.video_url);
                  return (
                    <div className="ratio ratio-169 mb-4 rounded-3 overflow-hidden border border-secondary border-opacity-10 shadow-sm">
                      {videoInfo.type === 'direct' ? (
                        <video
                          src={videoInfo.url}
                          controls
                          className="w-100 h-100"
                          style={{ backgroundColor: '#000', objectFit: 'contain' }}
                        />
                      ) : (
                        <iframe
                          src={videoInfo.url}
                          title={activeLesson.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      )}
                    </div>
                  );
                })() : (
                  <div className="img-fallback ratio ratio-169 mb-4 rounded-3 border border-secondary border-opacity-10 shadow-sm">
                    <div className="d-flex flex-column align-items-center gap-2">
                      <FaPlay size={40} className="text-muted" />
                      <span className="text-muted small">{t('noVideo')}</span>
                    </div>
                  </div>
                )}

                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                  <div>
                    <h3 className="active-lesson-title mb-0">{activeLesson.title}</h3>
                  </div>
                  
                  <button
                    onClick={() => handleToggleComplete(activeLesson.id)}
                    disabled={progressUpdating}
                    className={`btn btn-sm rounded-pill px-4 py-2 d-flex align-items-center gap-2 fw-semibold border-0 ${
                      completedLessons.includes(activeLesson.id)
                        ? 'btn-complete-checked'
                        : 'btn-complete-unchecked'
                    }`}
                  >
                    {completedLessons.includes(activeLesson.id) ? (
                      <>
                        <FaCheck size={12} /> {t('completed')}
                      </>
                    ) : (
                      t('markCompleted')
                    )}
                  </button>
                </div>

                {/* Notebook Margin Area for writing notes or content */}
                <div className="notebook-body-content flex-grow-1">
                  {activeLesson.content}
                </div>
              </div>
            ) : (
              <div className="p-5 text-center d-flex align-items-center justify-content-center h-100">
                <p className="text-muted mb-0">{t('selectLesson')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;

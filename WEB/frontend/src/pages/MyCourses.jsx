import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaPlay, FaGraduationCap } from 'react-icons/fa';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await api.get('/enrollments/my-courses');
        if (response.data.success) {
          setCourses(response.data.courses);
        }
      } catch (error) {
        console.error('Failed to load enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark text-white">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 fade-in-el text-start">
      <div className="mb-5 text-center text-sm-start">
        <h2 className="text-white fw-extrabold mb-1">My Enrolled Courses</h2>
        <p className="text-muted mb-0">Track your progress and continue learning where you left off.</p>
      </div>

      {courses.length > 0 ? (
        <div className="row g-4">
          {courses.map((course) => (
            <div className="col-lg-4 col-md-6" key={course.id}>
              <div className="card h-100 glass-card overflow-hidden text-start d-flex flex-column">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="card-img-top object-fit-cover"
                    style={{ height: '180px' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentNode.innerHTML = `<div class="img-fallback" style="height: 180px">🎓 ${course.title}</div>`;
                    }}
                  />
                ) : (
                  <div className="img-fallback" style={{ height: '180px' }}>
                    🎓 {course.title}
                  </div>
                )}
                <div className="card-body p-4 d-flex flex-column">
                  <h5 className="card-title text-white fw-bold mb-2">{course.title}</h5>
                  <p className="card-text text-muted small flex-grow-1">
                    {course.description.substring(0, 110)}...
                  </p>
                  
                  {/* Progress Indicator */}
                  <div className="mt-4 mb-3">
                    <div className="d-flex justify-content-between text-muted small mb-2">
                      <span>Progress</span>
                      <span className="fw-semibold text-primary">{course.progress_percent}%</span>
                    </div>
                    <div className="progress bg-secondary bg-opacity-25" style={{ height: '6px' }}>
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        style={{ width: `${course.progress_percent}%` }}
                        aria-valuenow={course.progress_percent}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between text-muted small mt-2">
                      <span>{course.completed_lessons} of {course.total_lessons} lessons</span>
                    </div>
                  </div>

                  <div className="d-grid mt-2">
                    <Link to={`/courses/${course.id}`} className="btn btn-primary py-2.5 rounded-3 text-white shadow-sm fw-semibold d-flex align-items-center justify-content-center gap-2">
                      <FaPlay size={10} /> Resume Learning
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="col-12 text-center py-5 bg-glass rounded-4 p-5 d-flex flex-column align-items-center">
          <FaGraduationCap size={50} className="text-muted mb-3" />
          <h5 className="text-white mb-2">No Enrolled Courses</h5>
          <p className="text-muted mb-4 small">You have not registered for any courses yet. Browse our catalog to find a track.</p>
          <Link to="/courses" className="btn btn-primary px-4 rounded-pill">
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyCourses;

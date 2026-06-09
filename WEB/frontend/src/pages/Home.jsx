import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaPlayCircle, FaArrowRight, FaUsers, FaBookOpen, FaAward } from 'react-icons/fa';

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  // Đã kích hoạt lại state quản lý ẩn/hiện video chuẩn chỉnh ở đây
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/courses');
        if (response.data.success) {
          // Get the 3 most recent courses for featured section
          setCourses(response.data.courses.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="hero-radial-glow fade-in-el">
      {/* Hero Section */}
      <section className="py-5 py-lg-6 text-center text-lg-start position-relative">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill mb-3 fw-semibold">
                ✨ Next-Gen Learning Experience
              </span>
              <h1 className="display-4 fw-extrabold text-white mb-4 lh-sm">
                Unlock Your Potential with <span className="text-gradient">E-Learn LMS</span>
              </h1>
              <p className="lead text-muted mb-5">
                Join thousands of students learning cutting-edge technologies. Our premium courses are structured to guide you from absolute beginner to production-ready professional.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
                <Link to="/courses" className="btn btn-primary btn-lg px-4 py-3 rounded-pill d-flex align-items-center justify-content-center gap-2">
                  Browse All Courses <FaArrowRight size={14} />
                </Link>
                <Link to="/register" className="btn btn-outline-light btn-lg px-4 py-3 rounded-pill">
                  Get Started Free
                </Link>
              </div>
            </div>
            
            <div className="col-lg-6 position-relative text-center">
              <div className="p-3 border border-secondary border-opacity-50 rounded-4 glass-card bg-opacity-25 shadow-lg position-relative d-inline-block overflow-hidden">
                
                {/* Sửa lại logic hoán đổi render linh hoạt giữa nút bấm và Iframe */}
                {showVideo ? (
                  <iframe
                    width="100%"
                    style={{ width: '500px', height: '320px', maxWidth: '100%' }}
                    src="https://www.youtube.com/embed/QtE00VP4W3Y?si=U7m0IiJfWNESxN26&autoplay=1"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="rounded-3 shadow-lg"
                  ></iframe>
                ) : (
                  <div 
                    className="img-fallback rounded-3 shadow-lg cursor-pointer" 
                    style={{ width: '100%', maxWidth: '500px', height: '320px', aspectRatio: '16/9' }}
                    onClick={() => setShowVideo(true)}
                  >
                    <div className="p-4">
                      <FaPlayCircle size={60} className="text-primary mb-3 cursor-pointer hover-scale" />
                      <h5 className="text-white">Learn AWS, React 19, & NodeJS</h5>
                      <p className="text-muted small">Watch 2-minute project walkthrough</p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-5 bg-dark bg-opacity-50 border-y border-secondary border-opacity-25">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="p-4 rounded-4 glass-card h-100">
                <div className="d-flex justify-content-center align-items-center bg-primary bg-opacity-10 text-primary rounded-circle mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                  <FaUsers size={24} />
                </div>
                <h3 className="text-white fw-bold">15,000+</h3>
                <p className="text-muted mb-0 small uppercase fw-bold tracking-wider">Active Students</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 rounded-4 glass-card h-100">
                <div className="d-flex justify-content-center align-items-center bg-success bg-opacity-10 text-success rounded-circle mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                  <FaBookOpen size={24} />
                </div>
                <h3 className="text-white fw-bold">120+</h3>
                <p className="text-muted mb-0 small uppercase fw-bold tracking-wider">Expert Courses</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 rounded-4 glass-card h-100">
                <div className="d-flex justify-content-center align-items-center bg-info bg-opacity-10 text-info rounded-circle mx-auto mb-3" style={{ width: '60px', height: '60px' }}>
                  <FaAward size={24} />
                </div>
                <h3 className="text-white fw-bold">98%</h3>
                <p className="text-muted mb-0 small uppercase fw-bold tracking-wider">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-5 py-lg-6">
        <div className="container py-4">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-5 text-center text-sm-start">
            <div>
              <h2 className="text-white fw-extrabold mb-1">Featured Learning Tracks</h2>
              <p className="text-muted mb-0">Kickstart your cloud, frontend, and backend career today.</p>
            </div>
            <Link to="/courses" className="btn btn-outline-light rounded-pill mt-3 mt-sm-0">
              View All Courses
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <div className="col-lg-4 col-md-6" key={course.id}>
                    <div className="card h-100 glass-card text-start overflow-hidden d-flex flex-column">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="card-img-top object-fit-cover"
                          style={{ height: '200px' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentNode.innerHTML = `<div class="img-fallback" style="height: 200px">🎓 ${course.title}</div>`;
                          }}
                        />
                      ) : (
                        <div className="img-fallback" style={{ height: '200px' }}>
                          🎓 {course.title}
                        </div>
                      )}
                      <div className="card-body p-4 d-flex flex-column">
                        <h5 className="card-title text-white fw-bold mb-2">{course.title}</h5>
                        <p className="card-text text-muted small flex-grow-1">
                          {course.description.substring(0, 120)}...
                        </p>
                        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary border-opacity-25">
                          <span className="badge bg-primary bg-opacity-10 text-primary">Self-Paced</span>
                          <Link to={`/courses/${course.id}`} className="btn btn-primary btn-sm px-3 rounded-pill text-white shadow-sm">
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-4">
                  <p className="text-muted">No courses available. Log in as admin to create your first course!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
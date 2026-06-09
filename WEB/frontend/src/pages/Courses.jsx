import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FaSearch, FaBook, FaCalendarAlt } from 'react-icons/fa';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const url = debouncedSearch ? `/courses?search=${encodeURIComponent(debouncedSearch)}` : '/courses';
        const response = await api.get(url);
        if (response.data.success) {
          setCourses(response.data.courses);
        }
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [debouncedSearch]);

  return (
    <div className="container py-5 fade-in-el">
      {/* Header and Search */}
      <div className="row mb-5 align-items-center justify-content-between g-3">
        <div className="col-md-6 text-center text-md-start">
          <h2 className="text-white fw-extrabold mb-1">Explore Our Courses</h2>
          <p className="text-muted mb-0">Expand your mind and learn the skills needed to design, develop, and deliver high-impact software.</p>
        </div>
        
        <div className="col-md-5">
          <div className="position-relative">
            <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control ps-5"
              placeholder="Search by course title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid of Courses */}
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
                <div className="card h-100 glass-card overflow-hidden d-flex flex-column text-start">
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
                      {course.description.substring(0, 140)}...
                    </p>
                    
                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary border-opacity-25 text-muted small">
                      <span className="d-flex align-items-center gap-1">
                        <FaBook size={12} /> Lectures
                      </span>
                      <span className="d-flex align-items-center gap-1">
                        <FaCalendarAlt size={12} /> {new Date(course.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="d-grid mt-4">
                      <Link to={`/courses/${course.id}`} className="btn btn-primary py-2 rounded-3 text-white shadow-sm">
                        View Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5 bg-glass rounded-4 p-5">
              <p className="text-muted fs-5 mb-0">No courses match your search criteria. Try a different keyword!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Courses;

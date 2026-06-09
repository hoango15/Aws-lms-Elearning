import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaBookReader, FaCheckCircle, FaPercentage, FaArrowRight } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/enrollments/my-courses');
        if (response.data.success) {
          setCourses(response.data.courses);
        }
      } catch (error) {
        console.error('Failed to load dashboard statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalEnrolled = courses.length;
  const totalCompletedLessons = courses.reduce((acc, c) => acc + c.completed_lessons, 0);
  const totalLessons = courses.reduce((acc, c) => acc + c.total_lessons, 0);
  const overallCompletionRate = totalLessons > 0 ? Math.round((totalCompletedLessons / totalLessons) * 100) : 0;

  // Chart configuration
  const chartData = {
    labels: courses.map(c => c.title.substring(0, 20) + (c.title.length > 20 ? '...' : '')),
    datasets: [
      {
        label: 'Completion Progress (%)',
        data: courses.map(c => c.progress_percent),
        backgroundColor: 'rgba(79, 70, 229, 0.6)',
        borderColor: '#4f46e5',
        borderWidth: 1,
        borderRadius: 5,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => `Progress: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: '#9ca3af',
          callback: (value) => `${value}%`
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#9ca3af'
        }
      }
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

  return (
    <div className="container py-5 fade-in-el text-start">
      {/* Title */}
      <div className="mb-5 text-center text-sm-start">
        <h2 className="text-white fw-extrabold mb-1">Welcome back, {user?.fullname}!</h2>
        <p className="text-muted mb-0">Here is a quick overview of your learning track and milestones.</p>
      </div>

      {/* Metrics Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="p-4 rounded-4 glass-card d-flex align-items-center gap-3">
            <div className="d-flex justify-content-center align-items-center bg-primary bg-opacity-10 text-primary rounded-3" style={{ width: '50px', height: '50px' }}>
              <FaBookReader size={20} />
            </div>
            <div>
              <p className="text-muted small mb-0 fw-bold uppercase">Enrolled Courses</p>
              <h4 className="text-white fw-bold mb-0">{totalEnrolled}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 rounded-4 glass-card d-flex align-items-center gap-3">
            <div className="d-flex justify-content-center align-items-center bg-success bg-opacity-10 text-success rounded-3" style={{ width: '50px', height: '50px' }}>
              <FaCheckCircle size={20} />
            </div>
            <div>
              <p className="text-muted small mb-0 fw-bold uppercase">Completed Lessons</p>
              <h4 className="text-white fw-bold mb-0">{totalCompletedLessons} / {totalLessons}</h4>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 rounded-4 glass-card d-flex align-items-center gap-3">
            <div className="d-flex justify-content-center align-items-center bg-warning bg-opacity-10 text-warning rounded-3" style={{ width: '50px', height: '50px' }}>
              <FaPercentage size={20} />
            </div>
            <div>
              <p className="text-muted small mb-0 fw-bold uppercase">Completion Rate</p>
              <h4 className="text-white fw-bold mb-0">{overallCompletionRate}%</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Chart Column */}
        {totalEnrolled > 0 && (
          <div className="col-lg-7">
            <div className="card glass-card p-4 h-100">
              <h5 className="text-white fw-bold mb-4">Course Tracking Chart</h5>
              <div style={{ height: '300px' }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Courses list summary */}
        <div className={totalEnrolled > 0 ? "col-lg-5" : "col-12"}>
          <div className="card glass-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white fw-bold mb-0">Academic Status</h5>
              {totalEnrolled > 0 && (
                <Link to="/my-courses" className="text-primary text-decoration-none small fw-semibold d-flex align-items-center gap-1">
                  All Courses <FaArrowRight size={10} />
                </Link>
              )}
            </div>

            {totalEnrolled > 0 ? (
              <div className="d-flex flex-column gap-3">
                {courses.slice(0, 4).map((course) => (
                  <div key={course.id} className="p-3 bg-dark bg-opacity-25 border border-secondary border-opacity-10 rounded-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-white fw-semibold small text-truncate" style={{ maxWidth: '80%' }}>
                        {course.title}
                      </span>
                      <span className="text-primary small fw-bold">{course.progress_percent}%</span>
                    </div>
                    <div className="progress bg-secondary bg-opacity-25 mb-2" style={{ height: '4px' }}>
                      <div className="progress-bar bg-primary" style={{ width: `${course.progress_percent}%` }}></div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="text-muted small" style={{ fontSize: '11px' }}>
                        {course.completed_lessons}/{course.total_lessons} Lectures
                      </span>
                      <Link to={`/courses/${course.id}`} className="text-white small text-decoration-none hover-primary" style={{ fontSize: '11px' }}>
                        Resume Study
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 d-flex flex-column align-items-center justify-content-center h-100">
                <p className="text-muted mb-4">You have not enrolled in any learning courses yet.</p>
                <Link to="/courses" className="btn btn-primary px-4 rounded-pill">
                  View Catalog
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

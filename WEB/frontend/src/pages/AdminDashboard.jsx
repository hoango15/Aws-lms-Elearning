import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FaUsers, FaBookOpen, FaVideo, FaClipboardList } from 'react-icons/fa';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js elements
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        if (response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
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

  const { totalUsers, totalCourses, totalLessons, totalEnrollments, enrollmentsPerCourse, rolesDistribution } = stats;

  // Chart 1: Enrollments per Course (Bar)
  const barData = {
    labels: enrollmentsPerCourse.map(c => c.title.substring(0, 15) + (c.title.length > 15 ? '...' : '')),
    datasets: [
      {
        label: 'Registered Students',
        data: enrollmentsPerCourse.map(c => c.enrollment_count),
        backgroundColor: 'rgba(79, 70, 229, 0.6)',
        borderColor: '#4f46e5',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#9ca3af', stepSize: 1 }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#9ca3af' }
      }
    }
  };

  // Chart 2: User Roles split (Doughnut)
  const doughnutData = {
    labels: rolesDistribution.map(r => r.role.charAt(0).toUpperCase() + r.role.slice(1) + 's'),
    datasets: [
      {
        data: rolesDistribution.map(r => r.count),
        backgroundColor: ['#4f46e5', '#10b981'],
        borderWidth: 0
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#f3f4f6' }
      }
    }
  };

  return (
    <div className="container py-5 fade-in-el text-start">
      <div className="mb-5 text-center text-sm-start">
        <h2 className="text-white fw-extrabold mb-1">Admin Management Console</h2>
        <p className="text-muted mb-0">System performance diagnostics and configuration controls.</p>
      </div>

      {/* Stats row */}
      <div className="row g-4 mb-5">
        <div className="col-lg-3 col-sm-6">
          <div className="card glass-card p-4 d-flex flex-row align-items-center gap-3">
            <div className="d-flex justify-content-center align-items-center bg-primary bg-opacity-10 text-primary rounded-3" style={{ width: '50px', height: '50px' }}>
              <FaUsers size={20} />
            </div>
            <div>
              <p className="text-muted small mb-0 fw-bold uppercase">Total Users</p>
              <h4 className="text-white fw-bold mb-0">{totalUsers}</h4>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card glass-card p-4 d-flex flex-row align-items-center gap-3">
            <div className="d-flex justify-content-center align-items-center bg-success bg-opacity-10 text-success rounded-3" style={{ width: '50px', height: '50px' }}>
              <FaBookOpen size={20} />
            </div>
            <div>
              <p className="text-muted small mb-0 fw-bold uppercase">Total Courses</p>
              <h4 className="text-white fw-bold mb-0">{totalCourses}</h4>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card glass-card p-4 d-flex flex-row align-items-center gap-3">
            <div className="d-flex justify-content-center align-items-center bg-info bg-opacity-10 text-info rounded-3" style={{ width: '50px', height: '50px' }}>
              <FaVideo size={20} />
            </div>
            <div>
              <p className="text-muted small mb-0 fw-bold uppercase">Total Lessons</p>
              <h4 className="text-white fw-bold mb-0">{totalLessons}</h4>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-sm-6">
          <div className="card glass-card p-4 d-flex flex-row align-items-center gap-3">
            <div className="d-flex justify-content-center align-items-center bg-warning bg-opacity-10 text-warning rounded-3" style={{ width: '50px', height: '50px' }}>
              <FaClipboardList size={20} />
            </div>
            <div>
              <p className="text-muted small mb-0 fw-bold uppercase">Enrollments</p>
              <h4 className="text-white fw-bold mb-0">{totalEnrollments}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Enrollments Chart */}
        <div className="col-lg-8">
          <div className="card glass-card p-4 h-100">
            <h5 className="text-white fw-bold mb-4">Enrollment Volume per Track</h5>
            <div style={{ height: '300px' }}>
              {enrollmentsPerCourse.length > 0 ? (
                <Bar data={barData} options={barOptions} />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                  No enrollments data available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Split Chart */}
        <div className="col-lg-4">
          <div className="card glass-card p-4 h-100">
            <h5 className="text-white fw-bold mb-4">Account Roles Allocation</h5>
            <div style={{ height: '300px' }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

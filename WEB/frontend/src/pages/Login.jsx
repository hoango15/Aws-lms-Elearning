import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEnvelope, FaLock, FaSignInAlt, FaGraduationCap } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="container py-5 my-auto fade-in-el">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-8 col-sm-10">
          <div className="text-center mb-4">
            <Link to="/" className="d-inline-flex align-items-center fw-bold fs-3 text-white text-decoration-none mb-2">
              <FaGraduationCap className="text-primary me-2 fs-2" />
              E-Learn
            </Link>
            <h4 className="text-white fw-bold">Welcome Back</h4>
            <p className="text-muted small">Sign in to your learning dashboard</p>
          </div>

          <div className="card glass-card p-4 p-md-5">
            {error && (
              <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger small py-2 px-3 mb-4 rounded-3" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label text-muted small fw-semibold">Email Address</label>
                <div className="position-relative">
                  <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    className="form-control ps-5"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label text-muted small fw-semibold mb-0">Password</label>
                </div>
                <div className="position-relative">
                  <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                    <FaLock />
                  </span>
                  <input
                    type="password"
                    className="form-control ps-5"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2 mt-4"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                    Sign In <FaSignInAlt />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top border-secondary border-opacity-20 small">
              <span className="text-muted">Don't have an account? </span>
              <Link to="/register" className="text-primary text-decoration-none fw-semibold">
                Register here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaGraduationCap } from 'react-icons/fa';

const Register = () => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullname || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = await register(fullname, email, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Registration failed. Please check the fields.');
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
            <h4 className="text-white fw-bold">Create an Account</h4>
            <p className="text-muted small">Start your professional learning path today</p>
          </div>

          <div className="card glass-card p-4 p-md-5">
            {error && (
              <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger small py-2 px-3 mb-4 rounded-3" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Full Name</label>
                <div className="position-relative">
                  <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                    <FaUser />
                  </span>
                  <input
                    type="text"
                    className="form-control ps-5"
                    placeholder="Full Name"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
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

              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Password</label>
                <div className="position-relative">
                  <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                    <FaLock />
                  </span>
                  <input
                    type="password"
                    className="form-control ps-5"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small fw-semibold">Confirm Password</label>
                <div className="position-relative">
                  <span className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                    <FaLock />
                  </span>
                  <input
                    type="password"
                    className="form-control ps-5"
                    placeholder="Re-type password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-3 rounded-3 d-flex align-items-center justify-content-center gap-2 mt-2"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                    Sign Up <FaUserPlus />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top border-secondary border-opacity-20 small">
              <span className="text-muted">Already have an account? </span>
              <Link to="/login" className="text-primary text-decoration-none fw-semibold">
                Login here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="container py-5 my-auto fade-in-el text-center">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8">
          <div className="p-5 rounded-4 glass-card d-flex flex-column align-items-center">
            <div className="bg-danger bg-opacity-10 text-danger rounded-circle p-4 mb-4 d-inline-flex">
              <FaExclamationTriangle size={48} />
            </div>
            <h1 className="text-white display-3 fw-extrabold mb-2 text-gradient">404</h1>
            <h3 className="text-white fw-bold mb-3">Page Not Found</h3>
            <p className="text-muted mb-5 lead">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link to="/" className="btn btn-primary px-4 py-2.5 rounded-pill d-flex align-items-center gap-2">
              <FaHome size={14} /> Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

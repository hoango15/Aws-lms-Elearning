import React from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaFacebook, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-secondary pt-5 pb-3 border-top border-secondary mt-auto">
      <div className="container">
        <div className="row g-4 justify-content-between">
          <div className="col-lg-4 col-md-6">
            <Link className="d-flex align-items-center fw-bold fs-4 text-white text-decoration-none mb-3" to="/">
              <FaGraduationCap className="text-primary me-2 fs-3" />
              E-Learn
            </Link>
            <p className="text-muted small">
              Empowering learners worldwide through accessible, high-quality online courses. Master cutting-edge technologies and business skills at your own pace.
            </p>
            <div className="d-flex gap-3 mt-4">
              <a href="#" className="text-secondary hover-primary"><FaFacebook size={20} /></a>
              <a href="#" className="text-secondary hover-primary"><FaTwitter size={20} /></a>
              <a href="#" className="text-secondary hover-primary"><FaLinkedin size={20} /></a>
              <a href="#" className="text-secondary hover-primary"><FaGithub size={20} /></a>
            </div>
          </div>
          
          <div className="col-md-3 col-sm-6">
            <h6 className="text-white mb-3 fw-bold">Explore</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/" className="text-muted text-decoration-none hover-primary">Home</Link></li>
              <li><Link to="/courses" className="text-muted text-decoration-none hover-primary">All Courses</Link></li>
              <li><a href="#" className="text-muted text-decoration-none hover-primary">Pricing Plans</a></li>
              <li><a href="#" className="text-muted text-decoration-none hover-primary">Frequently Asked Questions</a></li>
            </ul>
          </div>
          
          <div className="col-md-4 col-sm-6">
            <h6 className="text-white mb-3 fw-bold">Contact Support</h6>
            <p className="small text-muted mb-2">Have questions or feedback? Feel free to contact our support desk.</p>
            <p className="small text-white mb-1">Email: <span className="text-muted">support@elearn.com</span></p>
            <p className="small text-white">Hotline: <span className="text-muted">+1 (800) 123-4567</span></p>
          </div>
        </div>
        
        <hr className="border-secondary my-4" />
        
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center small text-muted">
          <p className="mb-0">&copy; {new Date().getFullYear()} E-Learn. All rights reserved.</p>
          <div className="d-flex gap-3 mt-2 mt-sm-0">
            <a href="#" className="text-muted text-decoration-none">Privacy Policy</a>
            <a href="#" className="text-muted text-decoration-none">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

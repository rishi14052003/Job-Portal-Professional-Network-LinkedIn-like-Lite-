import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import logo from '../assets/workaholic-high-resolution-logo.png';
import '../design/style.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <span className="company-name">WORKAHOLIC</span>
        </div>
        <div className="footer-center">
          <img src={logo} alt="Workaholic" className="footer-logo" />
          <span className="copyright-text">© 2025 All rights reserved</span>
        </div>
        <div className="footer-right">
          <div className="social-icons">
            <a href="https://www.facebook.com/info.iGeek" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <Facebook size={20} />
            </a>
            <a href="https://www.instagram.com/i_geektech/?hl=en" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <Instagram size={20} />
            </a>
            <a href="#" aria-label="Twitter" rel="noopener noreferrer">
              <Twitter size={20} />
            </a>
            <a href="https://linkedin.com/company/infoigeek/?originalSubdomain=in" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
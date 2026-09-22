import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">
            tuktuk<span>world</span>
          </div>

          <p>
            Everything your furry family needs, brought together in one
            friendly marketplace.
          </p>

          <div className="socials">
            <span>
              <Facebook size={17} />
            </span>
            <span>
              <Instagram size={17} />
            </span>
          </div>
        </div>

        <div>
          <h3>Quick links</h3>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/orders">My Orders</Link>
        </div>

        <div>
          <h3>Customer care</h3>
          <span>Secure checkout</span>
          <span>COD available</span>
          <span>Online payment</span>
          <span>Order tracking</span>
        </div>

        <div>
          <h3>Contact</h3>
          <span>
            <Mail size={16} /> support@tuktuk.world
          </span>
          <span>
            <Phone size={16} /> +91 98765 43210
          </span>
          <span>
            <MapPin size={16} /> Lucknow, Uttar Pradesh, India
          </span>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Tuktuk World. All rights reserved.</span>
        <span>Built with React + Vite + Node.js + MongoDB</span>
      </div>
    </footer>
  );
}
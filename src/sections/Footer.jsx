import React from "react";

export default function Footer({ brand }) {
  return (
    <footer>
      <div className="container">
        <div className="row">
          <div className="footer-brand">
            <img src="/assets/complyai-logo.png" alt={`${brand} logo`} height="28" />
            <strong>{brand}</strong>
          </div>
          <div>© {new Date().getFullYear()} {brand}. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}

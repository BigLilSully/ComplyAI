import React from "react";
import { Link } from "react-router-dom";

export default function Navbar({ brand }) {
  return (
    <nav>
      <div className="container nav-inner">
        <Link className="brand" to="/" aria-label={`${brand} home`}>
          <img src="/assets/complyai-logo.png" alt={`${brand} logo`} />
          <span className="word">{brand}</span>
        </Link>
        <div className="nav-actions">
          <a className="btn btn--ghost" href="/news">Latest AI compliance news</a>
          <a className="btn" href="#about">About ComplyAI</a>
        </div>
      </div>
    </nav>
  );
}

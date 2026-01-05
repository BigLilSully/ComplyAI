import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ brand }) {
  const { session, signOut } = useAuth();
  const location = useLocation();
  const isAuthed = Boolean(session);

  const aboutHref = location.pathname === "/" ? "#about" : "/#about";

  return (
    <nav>
      <div className="container nav-inner">
        <Link className="brand" to="/" aria-label={`${brand} home`}>
          <img src="/assets/complyai-logo.png" alt={`${brand} logo`} />
          <span className="word">{brand}</span>
        </Link>
        <div className="nav-actions">
          <NavLink className="nav-link" to="/app">App</NavLink>
          {isAuthed ? (
            <button className="nav-link nav-link--button" type="button" onClick={() => signOut()}>
              Sign out
            </button>
          ) : (
            <NavLink className="nav-link" to="/login">Sign in</NavLink>
          )}
          <NavLink className="btn btn--ghost" to="/news">Latest AI compliance news</NavLink>
          <a className="btn" href={aboutHref}>About ComplyAI</a>
        </div>
      </div>
    </nav>
  );
}

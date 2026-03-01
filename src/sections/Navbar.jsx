import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ brand }) {
  const { session, signOut } = useAuth();
  const location = useLocation();
  const isAuthed = Boolean(session);
  const isInApp = location.pathname.startsWith("/app");

  const productHref = location.pathname === "/" ? "#learn" : "/#learn";
  const howItWorksHref = location.pathname === "/" ? "#how-it-works" : "/#how-it-works";
  const pricingHref = "/toolkit";
  const authHref = isAuthed ? "/app" : "/login";

  return (
    <nav>
      <div className="container nav-inner">
        <Link className="brand" to="/" aria-label={`${brand} home`}>
          <img src="/assets/complyai-logo.png" alt={`${brand} logo`} />
          <span className="word">{brand}</span>
        </Link>
        <div className="nav-actions">
          {!isInApp ? (
            <>
              <a className="nav-link" href={productHref}>Product</a>
              <a className="nav-link" href={howItWorksHref}>How it works</a>
              <NavLink className="nav-link" to={pricingHref}>Pricing</NavLink>
              <NavLink className="nav-link" to={authHref}>Login/App</NavLink>
            </>
          ) : (
            <>
              <NavLink className="nav-link" to="/app#inbox">Inbox</NavLink>
              <NavLink className="nav-link" to="/app#questionnaires">Questionnaires</NavLink>
              <NavLink className="nav-link" to="/app#evidence">Evidence</NavLink>
              <NavLink className="nav-link" to="/app#vendors">Vendors</NavLink>
              <NavLink className="nav-link" to="/app#readiness">Readiness</NavLink>
            </>
          )}
          {isAuthed ? (
            <button className="nav-link nav-link--button" type="button" onClick={() => signOut()}>
              Sign out
            </button>
          ) : (
            <NavLink className="btn btn--ghost" to="/login">Login</NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}

import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import AboutSection from "./sections/AboutSection";
import RisksSectionData from "./sections/RisksSectionData";
import Features from "./sections/Features";
import HowItWorks from "./sections/HowItWorks";
import CTA from "./sections/CTA";
import Footer from "./sections/Footer";
import NewsPage from "./pages/NewsPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Toolkit from "./pages/Toolkit";

const BRAND = "ComplyAI";

function LandingPage() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll("[data-focus-section]"));
    if (!sections.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-active", entry.isIntersecting);
        });
      },
      {
        root: null,
        threshold: 0.55,
        rootMargin: "-20% 0px -20% 0px"
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <main id="main">
      <Hero brand={BRAND} />
      <RisksSectionData />
      <Features />
      <HowItWorks />
      <AboutSection brand={BRAND} />
      <CTA />
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Navbar brand={BRAND} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/toolkit" element={<Toolkit />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/login" element={<Login brand={BRAND} />} />
        <Route
          path="/app"
          element={(
            <ProtectedRoute>
              <Dashboard brand={BRAND} />
            </ProtectedRoute>
          )}
        />
      </Routes>
      <Footer brand={BRAND} />
    </AuthProvider>
  );
}

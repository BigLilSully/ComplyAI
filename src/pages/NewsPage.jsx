import React, { useEffect } from "react";
import NewsSection from "../sections/NewsSection";
import { complianceNewsItems } from "../content/siteContent";

export default function NewsPage({ brand }) {
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
    <main id="main" className="news-page">
      <NewsSection
        brand={brand}
        title="Latest AI compliance news"
        intro="Updates on regulations, enforcement actions, and practical compliance shifts."
        items={complianceNewsItems}
      />
    </main>
  );
}

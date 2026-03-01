// ── Existing marketing exports ────────────────────────────────────────────────

export const features = [
  {
    title: "Policy Studio",
    body: "Generate and maintain questionnaire-ready security policies mapped to buyer requirements."
  },
  {
    title: "Evidence Autopilot",
    body: "Continuously collect and organize screenshots, logs, and attestations into reusable evidence."
  },
  {
    title: "Questionnaire Autopilot",
    body: "Draft accurate responses from your policy and evidence library to complete security forms in minutes."
  },
  {
    title: "Vendor Risk",
    body: "Run vendor checks and track risk posture before procurement or renewal decisions."
  }
];

export const howItWorksSteps = [
  {
    title: "Connect tools",
    body: "Link your ticketing, storage, and documentation systems to sync existing controls and artifacts."
  },
  {
    title: "Upload questionnaire or generate policies",
    body: "Bring in a customer questionnaire or generate policy answers from your risk profile and stack."
  },
  {
    title: "Export security packet",
    body: "Share a complete packet with policies, evidence, and vendor checks for faster buyer review."
  }
];

export const outcomeProofStats = [
  {
    title: "Security questionnaires",
    value: "70% faster",
    caption: "Average completion time reduction",
    desc: "Teams move from days of back-and-forth to same-day submissions."
  },
  {
    title: "Audit readiness",
    value: "Always on",
    caption: "Evidence library stays current",
    desc: "Policy updates and evidence collection stay in sync for every review cycle."
  },
  {
    title: "Deals won",
    value: "More closes",
    caption: "Fewer security bottlenecks",
    desc: "Faster trust reviews help revenue teams keep enterprise deals on track."
  },
  {
    title: "Response quality",
    value: "Consistent",
    caption: "Single source of truth",
    desc: "Every answer pulls from approved policy language and validated evidence."
  }
];

export const aboutHighlights = [
  {
    title: "B2B SaaS teams",
    body: "Scale security responses across sales cycles without adding headcount."
  },
  {
    title: "Digital agencies",
    body: "Standardize client security workflows with reusable policy and evidence playbooks."
  },
  {
    title: "Lean ops and security owners",
    body: "Give one owner the leverage to keep teams continuously audit-ready."
  }
];

export const useCaseItems = [
  {
    title: "Enterprise SaaS security review in one afternoon",
    date: "Use case",
    body: "A GTM team uploads an 80-question form and submits polished answers the same day.",
    link: "/toolkit"
  },
  {
    title: "Agency standardizes vendor and client due diligence",
    date: "Use case",
    body: "Ops teams centralize policy answers and evidence packets across client accounts.",
    link: "/toolkit"
  },
  {
    title: "Founding team stays audit-ready during rapid growth",
    date: "Use case",
    body: "Quarterly evidence requests become a continuous workflow with clean handoffs.",
    link: "/toolkit"
  }
];

export const complianceNewsItems = [
  {
    title: "EU AI Act implementation timeline updates",
    date: "Dec 2025",
    body: "Key milestones for prohibited uses, GPAI obligations, and enforcement readiness.",
    link: "https://artificialintelligenceact.eu"
  },
  {
    title: "FTC guidance on AI claims and enforcement",
    date: "Nov 2025",
    body: "Recent actions highlight expectations for substantiation and transparency.",
    link: "https://www.ftc.gov"
  },
  {
    title: "State privacy law changes impacting AI systems",
    date: "Oct 2025",
    body: "New data handling and notice requirements relevant to AI workflows.",
    link: "https://iapp.org"
  },
  {
    title: "UK ICO guidance on AI and data protection",
    date: "Jan 2026",
    body: "Updated expectations for lawful basis, transparency, and model monitoring.",
    link: "https://ico.org.uk"
  },
  {
    title: "NIST AI Risk Management updates",
    date: "Jan 2026",
    body: "New implementation profiles for governance, measurement, and risk response.",
    link: "https://www.nist.gov/ai"
  },
  {
    title: "EU DSA/AI transparency signals for platforms",
    date: "Dec 2025",
    body: "Disclosure requirements intersecting with AI-driven recommendations.",
    link: "https://digital-strategy.ec.europa.eu"
  }
];

// ── ICP-specific outcomes ─────────────────────────────────────────────────────
// One entry per ideal customer profile. Used for targeted landing messaging,
// onboarding flows, and testimonial framing.

export const icpOutcomes = [
  {
    id: "saas",
    profile: "B2B SaaS teams",
    persona: "Head of Security · GTM Ops",
    pain: "Security questionnaires stall enterprise deals for days or weeks.",
    outcomes: [
      "Submit questionnaire responses the same day they arrive — not next week",
      "Maintain one source of truth for policies and evidence across every deal",
      "Let sales hand off security reviews without pulling engineering into it"
    ],
    stat: { value: "70% faster", label: "questionnaire turnaround" },
    ctaLabel: "Start free assessment",
    ctaHref: "/login"
  },
  {
    id: "agency",
    profile: "Digital agencies",
    persona: "Ops Lead · Compliance Owner",
    pain: "Rebuilding the same evidence packets from scratch for every client engagement.",
    outcomes: [
      "Reuse one policy and evidence library across all client accounts",
      "Standardize vendor due diligence with a single repeatable workflow",
      "Onboard new clients faster with pre-built compliance playbooks"
    ],
    stat: { value: "1 library", label: "reused across all client accounts" },
    ctaLabel: "See how agencies use it",
    ctaHref: "/toolkit"
  },
  {
    id: "lean-ops",
    profile: "Lean ops & security owners",
    persona: "Solo Security Lead · Founding Engineer",
    pain: "One person cannot keep policies, evidence, and audit cycles in sync manually.",
    outcomes: [
      "Evidence collects continuously — no scramble before reviews",
      "Policies stay version-tracked and current without manual effort",
      "Audit cycles run on schedule with automated attestation collection"
    ],
    stat: { value: "Always on", label: "audit readiness with a single owner" },
    ctaLabel: "Start free assessment",
    ctaHref: "/login"
  }
];

// ── Module value props ────────────────────────────────────────────────────────
// One entry per product module. Used in Toolkit page, feature detail cards,
// onboarding tooltips, and module-specific landing sections.

export const moduleValueProps = [
  {
    id: "policy-studio",
    title: "Policy Studio",
    tagline: "Generate questionnaire-ready policies in minutes",
    description: "Five pre-built templates map directly to buyer questionnaire categories. Every policy is version-tracked, publishable, and linked to evidence and controls.",
    bullets: [
      "AI usage, data handling, vendor governance, access logging, and incident response templates included",
      "Policies map directly to common buyer questionnaire categories",
      "Version history keeps every change dated and auditable",
      "Publish or archive to signal active governance to reviewers"
    ],
    tab: "policies"
  },
  {
    id: "evidence-autopilot",
    title: "Evidence Autopilot",
    tagline: "Evidence library that stays current between every review",
    description: "Link screenshots, logs, and docs to specific controls. Attestations are collected on a schedule so evidence is ready when the next questionnaire arrives.",
    bullets: [
      "Attach file URLs or links directly to controls and audit runs",
      "Attestations collected from team members on a recurring schedule",
      "Every item is dated and linked to an audit run — always traceable",
      "No last-minute scramble when a security questionnaire lands in your inbox"
    ],
    tab: "evidence"
  },
  {
    id: "questionnaire-autopilot",
    title: "Questionnaire Autopilot",
    tagline: "Draft accurate answers from your existing policy library",
    description: "Upload any questionnaire format and get answers drafted automatically from your policies and evidence. Verification badges surface which answers need review before export.",
    bullets: [
      "Upload any questionnaire format — answers drafted from your policy library",
      "Verification badges show which answers have evidence backing",
      "Partially verified answers flagged for human review before you export",
      "Export a complete, dated security packet for buyer sign-off"
    ],
    tab: "questionnaires"
  },
  {
    id: "vendor-risk",
    title: "Vendor Risk",
    tagline: "Track AI vendor posture before it becomes a liability",
    description: "Log each vendor with criticality, DPA status, and renewal date. Governance controls are auto-generated from your vendor policy so nothing is missed.",
    bullets: [
      "Log vendors with criticality level, DPA status, and renewal date",
      "Governance controls auto-generated from your vendor governance policy",
      "Expired or high-criticality vendors surfaced immediately",
      "Vendor checklist exportable as part of any security review packet"
    ],
    tab: "vendors"
  }
];

// ── Readiness path definitions ────────────────────────────────────────────────
// Action labels and metadata for each readiness path. Check logic lives in
// Readiness.jsx so this file stays free of runtime dependencies.

export const readinessPaths = [
  {
    id: "soc2-lite",
    label: "SOC 2 Lite",
    description: "Core trust services criteria for security, availability, and confidentiality.",
    actions: [
      "AI Usage Policy created",
      "Data Handling & Privacy Policy created",
      "Vendor & Model Governance Policy created",
      "Incident Response Policy created",
      "Prompt Logging & Access Policy created",
      "Controls generated from at least one policy",
      "Audit cycle scheduled",
      "At least one audit run completed",
      "Evidence collected for controls",
      "Team attestations collected"
    ]
  },
  {
    id: "client-ready",
    label: "Client-Ready",
    description: "Everything a buyer needs to complete a vendor security review.",
    actions: [
      "At least one policy published",
      "All policies have controls mapped",
      "Evidence linked to controls",
      "Vendor governance policy exists",
      "Data handling policy exists",
      "Incident response policy exists",
      "Audit run completed",
      "5 or more evidence items collected",
      "Team sign-offs collected",
      "Recurring audit cycle scheduled"
    ]
  },
  {
    id: "hipaa-basics",
    label: "HIPAA Basics",
    description: "Foundational controls for handling protected health information (PHI).",
    actions: [
      "PHI data handling policy created",
      "Incident response plan in place",
      "Access control & logging policy exists",
      "Vendor (BAA) governance policy created",
      "Controls generated for access and logging",
      "Evidence of access controls collected",
      "Workforce attestations collected",
      "Audit cycle defined",
      "Audit run completed",
      "AI usage policy documents approved use cases"
    ]
  }
];

// ── Questionnaire example claims ──────────────────────────────────────────────
// Representative security questionnaire questions paired with pre-written claim
// language. Questionnaire Autopilot uses these as the baseline answer when a
// matching policy exists; the policy title is interpolated at runtime.

export const questionnaireExamples = [
  {
    id: "q1",
    question: "Do you have a written information security policy?",
    claim: "We maintain a published AI Usage Policy covering approved use cases, prohibited uses, human oversight expectations, and escalation paths.",
    category: "Security",
    keywords: ["usage", "security"]
  },
  {
    id: "q2",
    question: "How do you handle customer data and what retention periods apply?",
    claim: "Customer data handling is governed by our Data Handling & Privacy Policy, which documents PII classification, retention timelines, and redaction requirements.",
    category: "Privacy",
    keywords: ["data", "privacy"]
  },
  {
    id: "q3",
    question: "Do you have an incident response plan for security events?",
    claim: "Our AI Incident Response Policy defines incident categories, response steps, notification requirements, and postmortem processes for data leakage, bias events, and model failures.",
    category: "Incident Response",
    keywords: ["incident", "response"]
  },
  {
    id: "q4",
    question: "How do you manage third-party vendors and AI model providers?",
    claim: "Third-party vendors are governed by our Vendor & Model Governance Policy, covering due diligence checklists, Data Processing Agreements, and data residency verification.",
    category: "Vendor Management",
    keywords: ["vendor", "model"]
  },
  {
    id: "q5",
    question: "How are access controls and prompt logging managed for AI systems?",
    claim: "Our Prompt Logging & Access Policy defines logging scope, access controls, retention windows, and review cadence for all AI system interactions.",
    category: "Access Control",
    keywords: ["prompt", "logging", "access"]
  },
  {
    id: "q6",
    question: "Do you conduct regular audits of AI system usage and compliance?",
    claim: "We maintain recurring audit cycles — monthly or quarterly — with documented audit runs, evidence collection periods, and signed team attestations per control.",
    category: "Audit",
    keywords: ["audit", "compliance"]
  }
];

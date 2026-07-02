// Structured data for the home page (Organization + SoftwareApplication).
// Server component: emits a static <script type="application/ld+json"> so it is
// present in the initial HTML for crawlers.

const SITE_URL = "https://vytal.fit";

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Vytal",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description:
        "AI-powered platform to run CrossFit boxes, functional-training gyms and studios: members, classes, payments, WODs, CRM and a public website, in one place.",
      sameAs: [
        "https://instagram.com/vytal.fit",
        "https://www.linkedin.com/company/vytal-fit",
        "https://x.com/vytalfit",
      ],
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "Vytal",
      url: SITE_URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, iOS, Android",
      description:
        "Intelligent management for gyms, CrossFit boxes and fitness studios: members, classes, payments, WODs, CRM and a public website.",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
    />
  );
}

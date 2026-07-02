"use client";

import { NOISE_SVG, LANDING_KEYFRAMES } from "@/lib/constants";
import { useLandingLang } from "@/lib/hooks";
import { SmoothScroll } from "@/components/smooth-scroll";
import { JsonLd } from "@/components/json-ld";
import { Navbar } from "@/components/sections/navbar";
import { Hero } from "@/components/sections/hero";
import { SocialProof } from "@/components/sections/social-proof";
import { Features } from "@/components/sections/features";
import { VerticalsMarquee } from "@/components/sections/verticals";
import { ProductShowcase } from "@/components/sections/showcase";
import { FeatureDeepDive } from "@/components/sections/deep-dive";
import { PaymentsPortugal } from "@/components/sections/payments";
import { AutomationsAI } from "@/components/sections/automations";
import { Comparison } from "@/components/sections/comparison";
import { Testimonials } from "@/components/sections/testimonials";
import { EarlyBird } from "@/components/sections/early-bird";
import { ComplianceSecurity } from "@/components/sections/compliance";
import { FAQ } from "@/components/sections/faq";
import { CTABanner } from "@/components/sections/cta-banner";
import { Footer } from "@/components/sections/footer";

// ── Page ───────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { lang, setLang, t } = useLandingLang();

  return (
    <SmoothScroll>
    <div className="min-h-screen bg-vytal-bg text-vytal-text">
      <JsonLd />
      {/* Injected keyframes */}
      <style dangerouslySetInnerHTML={{ __html: LANDING_KEYFRAMES }} />

      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[100]"
        style={{ backgroundImage: NOISE_SVG, backgroundRepeat: "repeat" }}
        aria-hidden="true"
      />

      <Navbar t={t} lang={lang} setLang={setLang} />
      <main>
        <Hero t={t} />
        <SocialProof t={t} />
        <Features t={t} />
        <VerticalsMarquee t={t} />
        <ProductShowcase t={t} />
        <FeatureDeepDive t={t} />
        <PaymentsPortugal t={t} />
        <AutomationsAI t={t} />
        <Comparison t={t} />
        <Testimonials t={t} />
        <EarlyBird t={t} lang={lang} />
        <ComplianceSecurity t={t} />
        <FAQ t={t} />
        <CTABanner t={t} />
      </main>
      <Footer t={t} />
    </div>
    </SmoothScroll>
  );
}

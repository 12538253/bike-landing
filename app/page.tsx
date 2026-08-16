import CaseStudies from "@/components/CaseStudies";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LocationFinal from "@/components/LocationFinal";
import QuoteChecklist from "@/components/QuoteChecklist";
import VisitFlowSection from "@/components/VisitFlowSection";
import TrustBar from "@/components/TrustBar";
import SupportSection from "@/components/SupportSection";

export default function Home() {
  return (
    <div className="site-page">
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <VisitFlowSection />
        <CaseStudies />
        <QuoteChecklist />
        <SupportSection />
        <LocationFinal />
      </main>
      <Footer />
    </div>
  );
}

import CaseStudies from "@/components/CaseStudies";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LocationFinal from "@/components/LocationFinal";
import PurchaseGuide from "@/components/PurchaseGuide";
import QuoteChecklist from "@/components/QuoteChecklist";
import VisitFlowSection from "@/components/VisitFlowSection";
import TrustBar from "@/components/TrustBar";

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
        <PurchaseGuide />
        <FAQSection />
        <LocationFinal />
      </main>
      <Footer />
    </div>
  );
}

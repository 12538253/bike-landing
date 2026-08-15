import CaseStudies from "@/components/CaseStudies";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HonestComparison from "@/components/HonestComparison";
import LocationFinal from "@/components/LocationFinal";
import NaverProof from "@/components/NaverProof";
import ProcessSection from "@/components/ProcessSection";
import PurchaseGuide from "@/components/PurchaseGuide";
import QuoteChecklist from "@/components/QuoteChecklist";
import TradeMethodComparison from "@/components/TradeMethodComparison";
import TrustBar from "@/components/TrustBar";

export default function Home() {
  return (
    <div className="site-page">
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <QuoteChecklist />
        <CaseStudies />
        <TradeMethodComparison />
        <ProcessSection />
        <HonestComparison />
        <PurchaseGuide />
        <NaverProof />
        <FAQSection />
        <LocationFinal />
      </main>
      <Footer />
    </div>
  );
}

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustSection from "@/components/TrustSection";
import ProcessSection from "@/components/ProcessSection";
import PolicySection from "@/components/PolicySection";
import LocationSection from "@/components/LocationSection";
import ReviewsSection from "@/components/ReviewsSection";
import ServicesSection from "@/components/ServicesSection";
import FAQSection from "@/components/FAQSection";
import PurchaseTicker from "@/components/PurchaseTicker";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-brand-orange selection:text-white">
      <Header />
      <main className="flex-1 pt-16">
        <PurchaseTicker />
        <Hero />
        <ReviewsSection />
        <TrustSection />
        <ProcessSection />
        <PolicySection />
        <ServicesSection />
        <FAQSection />
        <LocationSection />
      </main>
      <Footer />
    </div>
  );
}

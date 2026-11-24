import { useState } from 'react';
import { REACTION_PROTOCOLS } from './data/reactions';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CapabilitiesSection } from './components/CapabilitiesSection';
import { ReactionBench } from './components/ReactionBench';
import { ReactionLibrary } from './components/ReactionLibrary';
import { AnalyticalQcSection } from './components/AnalyticalQcSection';
import { InquirySection } from './components/InquirySection';
import { Footer } from './components/Footer';

export default function App() {
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>(REACTION_PROTOCOLS[0].id);
  const [quotePrefill, setQuotePrefill] = useState<{ project?: string; notes?: string }>({});

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoadInBench = (id: string) => {
    setSelectedProtocolId(id);
    scrollToSection('reaction-bench');
  };

  const handleRequestRouteQuote = (protocolName: string, scaleSummary: string) => {
    setQuotePrefill({
      project: protocolName,
      notes: `Requested route: ${protocolName} · ${scaleSummary}`,
    });
    scrollToSection('inquiry');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      <Header onRequestQuote={() => scrollToSection('inquiry')} />

      <main className="flex-1">
        <HeroSection
          onExploreBench={() => scrollToSection('reaction-bench')}
          onRequestQuote={() => scrollToSection('inquiry')}
        />

        <CapabilitiesSection onSelectBench={() => scrollToSection('reaction-bench')} />

        <ReactionBench
          protocols={REACTION_PROTOCOLS}
          selectedProtocolId={selectedProtocolId}
          onSelectProtocol={setSelectedProtocolId}
          onRequestRouteQuote={handleRequestRouteQuote}
        />

        <ReactionLibrary
          protocols={REACTION_PROTOCOLS}
          activeProtocolId={selectedProtocolId}
          onLoadInBench={handleLoadInBench}
        />

        <AnalyticalQcSection />

        <InquirySection
          prefillProject={quotePrefill.project}
          prefillNotes={quotePrefill.notes}
        />
      </main>

      <Footer />
    </div>
  );
}

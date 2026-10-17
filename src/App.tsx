import React from 'react';
import { CyberDeckProvider } from './context/CyberDeckContext';
import { Header } from './components/Header';
import { Terminal } from './components/Terminal/Terminal';
import { MissionControl } from './components/MissionControl/MissionControl';
import { RigCustomizer } from './components/Customizer/RigCustomizer';
import { CrtOverlay } from './components/Effects/CrtOverlay';
import { MatrixRain } from './components/Effects/MatrixRain';

const CyberDeckDashboard: React.FC = () => {
  return (
    <div className="relative w-screen h-screen flex flex-col bg-cyber-bg text-cyber-text overflow-hidden">
      <MatrixRain />
      <CrtOverlay />
      
      {/* Top Deck Status Bar */}
      <Header />

      {/* Main Tiled CyberDeck Layout */}
      <main className="flex-1 p-3 overflow-hidden z-10">
        <div className="h-full w-full flex flex-col lg:flex-row gap-3">
          {/* Left/Main Panel: 65% Desktop Width */}
          <section className="h-[55%] lg:h-full lg:w-[65%] flex flex-col">
            <Terminal />
          </section>

          {/* Right Panel: 35% Desktop Width (Split into Mission Control & Customizer) */}
          <section className="h-[45%] lg:h-full lg:w-[35%] flex flex-col gap-3 min-w-0">
            {/* Top-Right: Mission Control */}
            <div className="h-1/2 flex flex-col min-h-0">
              <MissionControl />
            </div>

            {/* Bottom-Right: Rig Customizer & Telemetry */}
            <div className="h-1/2 flex flex-col min-h-0">
              <RigCustomizer />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export function App() {
  return (
    <CyberDeckProvider>
      <CyberDeckDashboard />
    </CyberDeckProvider>
  );
}

export default App;

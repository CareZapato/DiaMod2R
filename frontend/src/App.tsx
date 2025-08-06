import React, { useState, useEffect } from 'react';
import './App.css';
import { ModProvider } from './context/ModContext';
import Sidebar from './components/Sidebar';
import ModSelection from './components/ModSelection';
import StatsHeroes from './components/StatsHeroes';
import Runas from './components/Runas';
import { SkillsView } from './components/SkillsView';
import { Mod } from './types';
import { modService } from './services/modService';

function App() {
  const [activeSection, setActiveSection] = useState('mod-selection');
  const [mods, setMods] = useState<Mod[]>([]);

  useEffect(() => {
    loadMods();
  }, []);

  const loadMods = async () => {
    try {
      const response = await modService.getAllMods();
      if (response.success && response.data) {
        setMods(response.data);
      }
    } catch (error) {
      console.error('Error loading mods:', error);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'mod-selection':
        return <ModSelection />;
      case 'stats-heroes':
        return <StatsHeroes />;
      case 'runas':
        return <Runas />;
      case 'items':
        return (
          <div className="coming-soon">
            <div className="coming-soon-icon">⚔️</div>
            <h3>Items - Próximamente</h3>
            <p>La gestión de items estará disponible en una próxima versión.</p>
          </div>
        );
      case 'skills':
        return <SkillsView mods={mods} />;
      case 'monsters':
        return (
          <div className="coming-soon">
            <div className="coming-soon-icon">👹</div>
            <h3>Monstruos - Próximamente</h3>
            <p>La gestión de monstruos estará disponible en una próxima versión.</p>
          </div>
        );
      case 'levels':
        return (
          <div className="coming-soon">
            <div className="coming-soon-icon">🗺️</div>
            <h3>Niveles - Próximamente</h3>
            <p>La gestión de niveles estará disponible en una próxima versión.</p>
          </div>
        );
      case 'treasures':
        return (
          <div className="coming-soon">
            <div className="coming-soon-icon">💎</div>
            <h3>Tesoros - Próximamente</h3>
            <p>La gestión de tesoros estará disponible en una próxima versión.</p>
          </div>
        );
      default:
        return <ModSelection />;
    }
  };

  return (
    <ModProvider>
      <div className="App">
        <div className="app-layout">
          <Sidebar 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
          <main className="main-area">
            {renderActiveSection()}
          </main>
        </div>
      </div>
    </ModProvider>
  );
}

export default App;

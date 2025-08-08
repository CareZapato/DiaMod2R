import React, { useState, useEffect } from 'react';
import './App.css';
import { ModProvider } from './context/ModContext';
import Sidebar from './components/Sidebar';
import ModSelection from './components/ModSelection';
import StatsHeroes from './components/StatsHeroes';
import StatsBuffers from './components/BuffersComponent';
import StatsChanges from './components/StatsChanges';
import Runas from './components/Runas';
import { SkillsView } from './components/SkillsView';
import SkillsGlobal from './components/SkillsGlobal';
import SkillsChanges from './components/SkillsChanges';
import GlobalChanges from './components/GlobalChanges';
import FileComparison from './components/FileComparison';
import Changelog from './components/Changelog';
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
      
      // Stats Personajes - Submenús
      case 'stats-heroes-individual':
        return <StatsHeroes />;
      case 'stats-heroes-buffers':
        return <StatsBuffers />;
      case 'stats-heroes-changes':
        return <StatsChanges />;
      case 'stats-heroes': // Fallback para compatibilidad
        return <StatsHeroes />;
      
      // Skills - Submenús  
      case 'skills-management':
        return <SkillsView mods={mods} />;
      case 'skills-global':
        return <SkillsGlobal />;
      case 'skills-changes':
        return <SkillsChanges />;
      case 'skills': // Fallback para compatibilidad
        return <SkillsView mods={mods} />;
      
      // Otras secciones
      case 'runas':
        return <Runas />;
      case 'global-changes':
        return <GlobalChanges />;
      case 'file-comparison':
        return <FileComparison />;
      case 'items':
        return (
          <div className="coming-soon">
            <div className="coming-soon-icon">⚔️</div>
            <h3>Items - Próximamente</h3>
            <p>La gestión de items estará disponible en una próxima versión.</p>
          </div>
        );
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
      
      case 'changelog':
        return <Changelog />;
        
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

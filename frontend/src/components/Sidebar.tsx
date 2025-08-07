import React from 'react';
import { useModContext } from '../context/ModContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { selectedMod, isModSelected, enabledSections } = useModContext();

  const openModFolder = async (folderPath: string) => {
    try {
      // Crear endpoint para abrir carpeta
      const response = await fetch('http://localhost:3001/api/system/open-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: folderPath })
      });
      
      if (!response.ok) {
        throw new Error('Error abriendo carpeta');
      }
    } catch (error) {
      console.error('Error abriendo carpeta:', error);
      alert('Error al abrir la carpeta del mod');
    }
  };

  const menuItems = [
    {
      id: 'mod-selection',
      label: 'Selección de Mod',
      icon: '📁',
      enabled: true,
      description: 'Seleccionar carpeta del mod'
    },
    {
      id: 'stats-heroes',
      label: 'Stats Héroes',
      icon: '🏃‍♂️',
      enabled: isModSelected && enabledSections.includes('stats-heroes'),
      description: 'Gestionar estadísticas de personajes'
    },
    {
      id: 'runas',
      label: 'Runas',
      icon: '🗿',
      enabled: isModSelected && enabledSections.includes('runas'),
      description: 'Configurar runas y runewords'
    },
    {
      id: 'items',
      label: 'Items',
      icon: '⚔️',
      enabled: isModSelected && enabledSections.includes('items'),
      description: 'Gestionar objetos y equipamiento'
    },
    {
      id: 'skills',
      label: 'Habilidades',
      icon: '✨',
      enabled: isModSelected && enabledSections.includes('skills'),
      description: 'Configurar habilidades y árboles'
    },
    {
      id: 'monsters',
      label: 'Monstruos',
      icon: '👹',
      enabled: isModSelected && enabledSections.includes('monsters'),
      description: 'Configurar monstruos y jefes'
    },
    {
      id: 'levels',
      label: 'Niveles',
      icon: '🗺️',
      enabled: isModSelected && enabledSections.includes('levels'),
      description: 'Configurar mapas y niveles'
    },
    {
      id: 'treasures',
      label: 'Tesoros',
      icon: '💎',
      enabled: isModSelected && enabledSections.includes('treasures'),
      description: 'Configurar drops y tesoros'
    }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>DiaMod2R</h2>
        <div className="logo">🎮</div>
      </div>

      {selectedMod && (
        <div className="selected-mod-info">
          <div className="mod-badge">
            <span className="mod-label">Mod Actual:</span>
            <div className="mod-name-container">
              <span className="mod-name">{selectedMod.name}</span>
              <button
                className="folder-button"
                onClick={() => openModFolder(selectedMod.folderPath)}
                title="Abrir carpeta del mod en el explorador"
              >
                📁
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3>Configuración</h3>
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.id} className={`nav-item ${!item.enabled ? 'disabled' : ''}`}>
                <button
                  className={`nav-button ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => item.enabled && onSectionChange(item.id)}
                  disabled={!item.enabled}
                  title={!item.enabled ? 'Selecciona un mod primero' : item.description}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                  {!item.enabled && <span className="lock-icon">🔒</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="footer-info">
          <p>v0.2.0</p>
          <p>CareZapato</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

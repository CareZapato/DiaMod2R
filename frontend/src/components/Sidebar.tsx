import React from 'react';
import { useModContext } from '../context/ModContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { selectedMod, isModSelected } = useModContext();

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
      enabled: isModSelected,
      description: 'Gestionar estadísticas de personajes'
    },
    {
      id: 'runas',
      label: 'Runas',
      icon: '🗿',
      enabled: isModSelected,
      description: 'Configurar runas y runewords'
    },
    {
      id: 'items',
      label: 'Items',
      icon: '⚔️',
      enabled: isModSelected,
      description: 'Gestionar objetos y equipamiento'
    },
    {
      id: 'skills',
      label: 'Habilidades',
      icon: '✨',
      enabled: isModSelected,
      description: 'Configurar habilidades y árboles'
    },
    {
      id: 'monsters',
      label: 'Monstruos',
      icon: '👹',
      enabled: isModSelected,
      description: 'Configurar monstruos y jefes'
    },
    {
      id: 'levels',
      label: 'Niveles',
      icon: '🗺️',
      enabled: isModSelected,
      description: 'Configurar mapas y niveles'
    },
    {
      id: 'treasures',
      label: 'Tesoros',
      icon: '💎',
      enabled: isModSelected,
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
            <span className="mod-name">{selectedMod.name}</span>
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
          <p>v1.0.0</p>
          <p>Gestor de Mods D2</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

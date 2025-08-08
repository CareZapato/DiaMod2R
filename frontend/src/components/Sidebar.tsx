import React, { useState } from 'react';
import { useModContext } from '../context/ModContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { selectedMod, isModSelected, enabledSections } = useModContext();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);

  const handleMenuClick = (item: any) => {
    if (item.enabled) {
      if (item.subItems.length === 0) {
        onSectionChange(item.id);
      } else {
        // En móviles, expandir/contraer
        if (window.innerWidth <= 768) {
          setExpandedMobileMenu(expandedMobileMenu === item.id ? null : item.id);
        } else {
          // En desktop, ir al primer subitem
          onSectionChange(item.subItems[0].id);
        }
      }
    }
  };

  const handleMouseEnter = (item: any) => {
    if (item.enabled && item.subItems.length > 0 && window.innerWidth > 768) {
      setHoveredMenu(item.id);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (window.innerWidth > 768) {
      // Usar un pequeño delay para permitir que el mouse se mueva al submenu
      setTimeout(() => {
        const submenu = document.querySelector('.submenu:hover');
        const navItem = document.querySelector('.nav-item:hover');
        if (!submenu && !navItem) {
          setHoveredMenu(null);
        }
      }, 100);
    }
  };

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
      description: 'Seleccionar carpeta del mod',
      subItems: []
    },
    {
      id: 'stats-heroes',
      label: 'Stats Personajes',
      icon: '🏃‍♂️',
      enabled: isModSelected && enabledSections.includes('stats-heroes'),
      description: 'Gestionar estadísticas de personajes',
      subItems: [
        {
          id: 'stats-heroes-individual',
          label: 'Héroes',
          description: 'Editar estadísticas individuales por héroe',
          icon: '👤'
        },
        {
          id: 'stats-heroes-buffers',
          label: 'Buffers Globales',
          description: 'Aplicar cambios automáticos a todos los personajes',
          icon: '⚡'
        },
        {
          id: 'stats-heroes-changes',
          label: 'Resumen de Cambios',
          description: 'Ver todos los cambios realizados vs valores base',
          icon: '�'
        }
      ]
    },
    {
      id: 'skills',
      label: 'Habilidades',
      icon: '✨',
      enabled: isModSelected && enabledSections.includes('skills'),
      description: 'Configurar habilidades y árboles',
      subItems: [
        {
          id: 'skills-management',
          label: 'Gestión Individual',
          description: 'Editar habilidades una por una',
          icon: '🎯'
        },
        {
          id: 'skills-global',
          label: 'Cambios Globales',
          description: 'Aplicar modificaciones masivas a todas las habilidades',
          icon: '🌟'
        },
        {
          id: 'skills-changes',
          label: 'Resumen de Cambios',
          description: 'Ver todos los cambios realizados vs valores base',
          icon: '📈'
        }
      ]
    },
    {
      id: 'runas',
      label: 'Runas',
      icon: '🗿',
      enabled: isModSelected && enabledSections.includes('runas'),
      description: 'Configurar runas y runewords',
      subItems: []
    },
    {
      id: 'items',
      label: 'Items',
      icon: '⚔️',
      enabled: isModSelected && enabledSections.includes('items'),
      description: 'Gestionar objetos y equipamiento',
      subItems: []
    },
    {
      id: 'monsters',
      label: 'Monstruos',
      icon: '👹',
      enabled: isModSelected && enabledSections.includes('monsters'),
      description: 'Configurar monstruos y jefes',
      subItems: []
    },
    {
      id: 'levels',
      label: 'Niveles',
      icon: '🗺️',
      enabled: isModSelected && enabledSections.includes('levels'),
      description: 'Configurar mapas y niveles',
      subItems: []
    },
    {
      id: 'treasures',
      label: 'Tesoros',
      icon: '💎',
      enabled: isModSelected && enabledSections.includes('treasures'),
      description: 'Configurar drops y tesoros',
      subItems: []
    },
    {
      id: 'global-changes',
      label: 'Todos los Cambios',
      icon: '📋',
      enabled: isModSelected,
      description: 'Ver resumen completo de todas las modificaciones',
      subItems: []
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
              <li 
                key={item.id} 
                className={`nav-item ${!item.enabled ? 'disabled' : ''} ${item.subItems.length > 0 ? 'has-submenu' : ''}`}
                onMouseEnter={() => handleMouseEnter(item)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`nav-button ${activeSection === item.id || (item.subItems.some(sub => sub.id === activeSection)) ? 'active' : ''}`}
                  onClick={() => handleMenuClick(item)}
                  disabled={!item.enabled}
                  title={!item.enabled ? 'Selecciona un mod primero' : item.description}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                  {!item.enabled && <span className="lock-icon">🔒</span>}
                  {item.enabled && item.subItems.length > 0 && <span className="submenu-arrow">▶</span>}
                </button>
                
                {item.enabled && item.subItems.length > 0 && (
                  (hoveredMenu === item.id || expandedMobileMenu === item.id) && (
                    <div className="submenu">
                      <ul className="submenu-list">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.id} className="submenu-item">
                            <button
                              className={`submenu-button ${activeSection === subItem.id ? 'active' : ''}`}
                              onClick={() => onSectionChange(subItem.id)}
                              title={subItem.description}
                            >
                              <span className="submenu-icon">{subItem.icon}</span>
                              <span className="submenu-text">{subItem.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}
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

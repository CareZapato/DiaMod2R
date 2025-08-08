import React, { useState, useEffect } from 'react';
import { useModContext } from '../context/ModContext';
import './GlobalChanges.css';

interface ChangesSummary {
  section: 'stats' | 'skills';
  sectionName: string;
  icon: string;
  totalChanges: number;
  increases: number;
  decreases: number;
  modifications: number;
  lastModified: string;
  changes: Array<{
    itemName: string;
    field: string;
    originalValue: any;
    currentValue: any;
    changeType: 'increase' | 'decrease' | 'change';
    changedAt: string;
  }>;
}

const GlobalChanges: React.FC = () => {
  const { selectedMod } = useModContext();
  const [changesSummary, setChangesSummary] = useState<ChangesSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (selectedMod) {
      loadGlobalChanges();
    }
  }, [selectedMod]);

  const loadGlobalChanges = async () => {
    if (!selectedMod) return;
    
    setIsLoading(true);
    try {
      // Aquí harías la llamada al backend para obtener todos los cambios
      // Por ahora simulamos datos
      const mockSummary: ChangesSummary[] = [
        {
          section: 'stats',
          sectionName: 'Estadísticas de Personajes',
          icon: '🏃‍♂️',
          totalChanges: 12,
          increases: 8,
          decreases: 2,
          modifications: 2,
          lastModified: '2024-08-07T10:34:00Z',
          changes: [
            {
              itemName: 'Amazon',
              field: 'str',
              originalValue: 20,
              currentValue: 25,
              changeType: 'increase',
              changedAt: '2024-08-07T10:30:00Z'
            },
            {
              itemName: 'Amazon',
              field: 'dex',
              originalValue: 25,
              currentValue: 30,
              changeType: 'increase',
              changedAt: '2024-08-07T10:31:00Z'
            },
            {
              itemName: 'Sorceress',
              field: 'int',
              originalValue: 15,
              currentValue: 35,
              changeType: 'increase',
              changedAt: '2024-08-07T10:32:00Z'
            },
            {
              itemName: 'Paladin',
              field: 'vit',
              originalValue: 25,
              currentValue: 40,
              changeType: 'increase',
              changedAt: '2024-08-07T10:33:00Z'
            }
          ]
        },
        {
          section: 'skills',
          sectionName: 'Habilidades',
          icon: '✨',
          totalChanges: 18,
          increases: 12,
          decreases: 4,
          modifications: 2,
          lastModified: '2024-08-07T10:45:00Z',
          changes: [
            {
              itemName: 'Fire Bolt',
              field: 'mindamage',
              originalValue: 3,
              currentValue: 10,
              changeType: 'increase',
              changedAt: '2024-08-07T10:31:00Z'
            },
            {
              itemName: 'Fire Bolt',
              field: 'maxdamage',
              originalValue: 6,
              currentValue: 15,
              changeType: 'increase',
              changedAt: '2024-08-07T10:31:30Z'
            },
            {
              itemName: 'Charged Strike',
              field: 'mana',
              originalValue: 3,
              currentValue: 1,
              changeType: 'decrease',
              changedAt: '2024-08-07T10:32:00Z'
            },
            {
              itemName: 'Blessed Hammer',
              field: 'delay',
              originalValue: 25,
              currentValue: 10,
              changeType: 'decrease',
              changedAt: '2024-08-07T10:33:00Z'
            }
          ]
        }
      ];
      
      setTimeout(() => {
        setChangesSummary(mockSummary);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error cargando resumen global:', error);
      setIsLoading(false);
    }
  };

  const filteredSections = selectedSection === 'all' 
    ? changesSummary 
    : changesSummary.filter(section => section.section === selectedSection);

  const totalChangesAcrossSections = changesSummary.reduce((sum, section) => sum + section.totalChanges, 0);
  const totalIncreasesAcrossSections = changesSummary.reduce((sum, section) => sum + section.increases, 0);
  const totalDecreasesAcrossSections = changesSummary.reduce((sum, section) => sum + section.decreases, 0);

  const toggleDetails = (sectionKey: string) => {
    setShowDetails(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const formatValue = (value: any) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return '📈';
      case 'decrease': return '📉';
      case 'change': return '🔄';
      default: return '➡️';
    }
  };

  const exportGlobalSummary = () => {
    const summaryText = changesSummary.map(section => {
      const sectionText = `\n${section.sectionName}:\n` +
        `- Total de cambios: ${section.totalChanges}\n` +
        `- Aumentos: ${section.increases}\n` +
        `- Reducciones: ${section.decreases}\n` +
        `- Modificaciones: ${section.modifications}\n` +
        `- Última modificación: ${formatDate(section.lastModified)}\n\n` +
        section.changes.map(change => 
          `  ${change.itemName} -> ${change.field}: ${change.originalValue} → ${change.currentValue}`
        ).join('\n');
      
      return sectionText;
    }).join('\n');

    const fullText = `Resumen Global de Cambios - ${selectedMod?.name}\n` +
      `Fecha de exportación: ${new Date().toLocaleString('es-ES')}\n` +
      `===============================================\n` +
      summaryText;

    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resumen-cambios-${selectedMod?.name}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="global-changes">
      <div className="content-header">
        <h1>Resumen Global de Cambios</h1>
        <p>Vista completa de todas las modificaciones realizadas en el mod</p>
      </div>

      {!selectedMod && (
        <div className="warning-message">
          <p>⚠️ Selecciona un mod primero para ver el resumen global</p>
        </div>
      )}

      {selectedMod && (
        <>
          <div className="mod-info">
            <h3>Mod: <span className="mod-name">{selectedMod.name}</span></h3>
            <p>Resumen completo de todas las modificaciones vs valores base del juego</p>
          </div>

          <div className="global-controls">
            <div className="filter-section">
              <label htmlFor="section-filter">Filtrar por sección:</label>
              <select 
                id="section-filter"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="section-filter"
              >
                <option value="all">Todas las secciones</option>
                <option value="stats">Estadísticas de Personajes</option>
                <option value="skills">Habilidades</option>
              </select>
            </div>
            
            <div className="global-summary">
              <div className="summary-item">
                <span className="summary-label">Total de cambios:</span>
                <span className="summary-value total">{totalChangesAcrossSections}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Aumentos:</span>
                <span className="summary-value increase">{totalIncreasesAcrossSections}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Reducciones:</span>
                <span className="summary-value decrease">{totalDecreasesAcrossSections}</span>
              </div>
            </div>

            <button 
              className="export-button"
              onClick={exportGlobalSummary}
              disabled={changesSummary.length === 0}
            >
              📄 Exportar Resumen
            </button>
          </div>

          {isLoading ? (
            <div className="loading-message">
              <p>🔄 Cargando resumen global...</p>
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="no-changes-message">
              <p>📝 No se han realizado cambios aún</p>
              <p>Los cambios aparecerán aquí cuando modifiques elementos del mod</p>
            </div>
          ) : (
            <div className="sections-list">
              {filteredSections.map((section) => (
                <div key={section.section} className="section-card">
                  <div 
                    className="section-header"
                    onClick={() => toggleDetails(section.section)}
                  >
                    <div className="section-info">
                      <span className="section-icon">{section.icon}</span>
                      <div className="section-details">
                        <h3 className="section-name">{section.sectionName}</h3>
                        <p className="section-meta">
                          Última modificación: {formatDate(section.lastModified)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="section-stats">
                      <div className="stat-item">
                        <span className="stat-value total">{section.totalChanges}</span>
                        <span className="stat-label">Total</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value increase">{section.increases}</span>
                        <span className="stat-label">↗️</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value decrease">{section.decreases}</span>
                        <span className="stat-label">↘️</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value change">{section.modifications}</span>
                        <span className="stat-label">🔄</span>
                      </div>
                    </div>

                    <div className="expand-icon">
                      {showDetails[section.section] ? '🔽' : '▶️'}
                    </div>
                  </div>

                  {showDetails[section.section] && (
                    <div className="section-details-expanded">
                      <div className="changes-header">
                        <h4>Detalle de Cambios</h4>
                        <span className="changes-count">{section.changes.length} elementos modificados</span>
                      </div>
                      
                      <div className="detailed-changes">
                        {section.changes.map((change, index) => (
                          <div key={index} className={`change-detail ${change.changeType}`}>
                            <div className="change-item-info">
                              <span className="item-name">{change.itemName}</span>
                              <code className="field-name">{change.field}</code>
                            </div>
                            
                            <div className="value-change">
                              <span className="original">{formatValue(change.originalValue)}</span>
                              <span className="arrow">{getChangeIcon(change.changeType)}</span>
                              <span className="current">{formatValue(change.currentValue)}</span>
                            </div>
                            
                            <div className="change-timestamp">
                              {formatDate(change.changedAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GlobalChanges;

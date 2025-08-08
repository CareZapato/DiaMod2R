import React, { useState, useEffect } from 'react';
import { useModContext } from '../context/ModContext';
import './StatsChanges.css';

interface StatChange {
  heroClass: string;
  field: string;
  originalValue: any;
  currentValue: any;
  changedAt: string;
}

const StatsChanges: React.FC = () => {
  const { selectedMod } = useModContext();
  const [changes, setChanges] = useState<StatChange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterClass, setFilterClass] = useState<string>('all');

  const heroClasses = [
    'Amazon', 'Sorceress', 'Necromancer', 'Paladin', 'Barbarian', 
    'Druid', 'Assassin'
  ];

  useEffect(() => {
    if (selectedMod) {
      loadChanges();
    }
  }, [selectedMod]);

  const loadChanges = async () => {
    if (!selectedMod) return;
    
    setIsLoading(true);
    try {
      // Aquí harías la llamada al backend para obtener los cambios
      // Por ahora simulamos datos
      const mockChanges: StatChange[] = [
        {
          heroClass: 'Amazon',
          field: 'str',
          originalValue: 20,
          currentValue: 25,
          changedAt: '2024-08-07T10:30:00Z'
        },
        {
          heroClass: 'Amazon',
          field: 'dex',
          originalValue: 25,
          currentValue: 30,
          changedAt: '2024-08-07T10:31:00Z'
        },
        {
          heroClass: 'Sorceress',
          field: 'int',
          originalValue: 15,
          currentValue: 35,
          changedAt: '2024-08-07T10:32:00Z'
        },
        {
          heroClass: 'Paladin',
          field: 'vit',
          originalValue: 25,
          currentValue: 40,
          changedAt: '2024-08-07T10:33:00Z'
        },
        {
          heroClass: 'Barbarian',
          field: 'str',
          originalValue: 30,
          currentValue: 50,
          changedAt: '2024-08-07T10:34:00Z'
        }
      ];
      
      setTimeout(() => {
        setChanges(mockChanges);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error cargando cambios:', error);
      setIsLoading(false);
    }
  };

  const filteredChanges = changes.filter(change => 
    filterClass === 'all' || change.heroClass === filterClass
  );

  const getChangeDirection = (original: any, current: any) => {
    if (typeof original === 'number' && typeof current === 'number') {
      return current > original ? 'increase' : current < original ? 'decrease' : 'equal';
    }
    return original !== current ? 'change' : 'equal';
  };

  const getChangeIcon = (direction: string) => {
    switch (direction) {
      case 'increase': return '📈';
      case 'decrease': return '📉';
      case 'change': return '🔄';
      default: return '➡️';
    }
  };

  const getChangeColor = (direction: string) => {
    switch (direction) {
      case 'increase': return 'increase';
      case 'decrease': return 'decrease';
      case 'change': return 'change';
      default: return 'equal';
    }
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

  return (
    <div className="stats-changes">
      <div className="content-header">
        <h1>Resumen de Cambios - Estadísticas</h1>
        <p>Visualiza todos los cambios realizados en las estadísticas de personajes</p>
      </div>

      {!selectedMod && (
        <div className="warning-message">
          <p>⚠️ Selecciona un mod primero para ver los cambios</p>
        </div>
      )}

      {selectedMod && (
        <>
          <div className="mod-info">
            <h3>Mod: <span className="mod-name">{selectedMod.name}</span></h3>
            <p>Mostrando cambios realizados vs valores base del juego</p>
          </div>

          <div className="changes-controls">
            <div className="filter-section">
              <label htmlFor="class-filter">Filtrar por clase:</label>
              <select 
                id="class-filter"
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="class-filter"
              >
                <option value="all">Todas las clases</option>
                {heroClasses.map(heroClass => (
                  <option key={heroClass} value={heroClass}>{heroClass}</option>
                ))}
              </select>
            </div>
            
            <div className="stats-summary">
              <div className="summary-item">
                <span className="summary-label">Total de cambios:</span>
                <span className="summary-value total">{filteredChanges.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Aumentos:</span>
                <span className="summary-value increase">
                  {filteredChanges.filter(c => getChangeDirection(c.originalValue, c.currentValue) === 'increase').length}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Reducciones:</span>
                <span className="summary-value decrease">
                  {filteredChanges.filter(c => getChangeDirection(c.originalValue, c.currentValue) === 'decrease').length}
                </span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-message">
              <p>🔄 Cargando cambios...</p>
            </div>
          ) : filteredChanges.length === 0 ? (
            <div className="no-changes-message">
              <p>📝 No se han realizado cambios aún</p>
              <p>Los cambios aparecerán aquí cuando modifiques estadísticas de personajes</p>
            </div>
          ) : (
            <div className="changes-list">
              {filteredChanges.map((change, index) => {
                const direction = getChangeDirection(change.originalValue, change.currentValue);
                return (
                  <div key={index} className={`change-item ${getChangeColor(direction)}`}>
                    <div className="change-header">
                      <div className="hero-info">
                        <span className="hero-icon">🏃‍♂️</span>
                        <span className="hero-class">{change.heroClass}</span>
                      </div>
                      <div className="change-meta">
                        <span className="change-date">{formatDate(change.changedAt)}</span>
                      </div>
                    </div>
                    
                    <div className="change-details">
                      <div className="field-name">
                        <code>{change.field}</code>
                      </div>
                      
                      <div className="value-comparison">
                        <span className="original-value">
                          {formatValue(change.originalValue)}
                        </span>
                        <span className="change-arrow">
                          {getChangeIcon(direction)}
                        </span>
                        <span className="current-value">
                          {formatValue(change.currentValue)}
                        </span>
                      </div>
                      
                      {typeof change.originalValue === 'number' && typeof change.currentValue === 'number' && (
                        <div className="change-magnitude">
                          {direction === 'increase' ? '+' : direction === 'decrease' ? '' : '±'}
                          {Math.abs(change.currentValue - change.originalValue)} 
                          ({direction === 'increase' ? '+' : ''}
                          {((change.currentValue - change.originalValue) / change.originalValue * 100).toFixed(1)}%)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StatsChanges;

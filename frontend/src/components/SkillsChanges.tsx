import React, { useState, useEffect } from 'react';
import { useModContext } from '../context/ModContext';
import './SkillsChanges.css';

interface SkillChange {
  skillName: string;
  skillId: string;
  charClass: string;
  field: string;
  originalValue: any;
  currentValue: any;
  changedAt: string;
}

const SkillsChanges: React.FC = () => {
  const { selectedMod } = useModContext();
  const [changes, setChanges] = useState<SkillChange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterField, setFilterField] = useState<string>('all');

  const charClasses = [
    'Amazon', 'Sorceress', 'Necromancer', 'Paladin', 'Barbarian', 
    'Druid', 'Assassin'
  ];

  const fieldCategories = [
    'reqlevel', 'maxlvl', 'mana', 'delay', 'mindamage', 'maxdamage',
    'Param1', 'Param2', 'calc1', 'calc2'
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
      const mockChanges: SkillChange[] = [
        {
          skillName: 'Fire Bolt',
          skillId: 'firebolt',
          charClass: 'Sorceress',
          field: 'reqlevel',
          originalValue: 1,
          currentValue: 1,
          changedAt: '2024-08-07T10:30:00Z'
        },
        {
          skillName: 'Fire Bolt',
          skillId: 'firebolt',
          charClass: 'Sorceress',
          field: 'mindamage',
          originalValue: 3,
          currentValue: 10,
          changedAt: '2024-08-07T10:31:00Z'
        },
        {
          skillName: 'Fire Bolt',
          skillId: 'firebolt',
          charClass: 'Sorceress',
          field: 'maxdamage',
          originalValue: 6,
          currentValue: 15,
          changedAt: '2024-08-07T10:31:30Z'
        },
        {
          skillName: 'Charged Strike',
          skillId: 'chargedstrike',
          charClass: 'Amazon',
          field: 'mana',
          originalValue: 3,
          currentValue: 1,
          changedAt: '2024-08-07T10:32:00Z'
        },
        {
          skillName: 'Blessed Hammer',
          skillId: 'blessedhammer',
          charClass: 'Paladin',
          field: 'delay',
          originalValue: 25,
          currentValue: 10,
          changedAt: '2024-08-07T10:33:00Z'
        },
        {
          skillName: 'Whirlwind',
          skillId: 'whirlwind',
          charClass: 'Barbarian',
          field: 'maxlvl',
          originalValue: 20,
          currentValue: 30,
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

  const filteredChanges = changes.filter(change => {
    const classMatch = filterClass === 'all' || change.charClass === filterClass;
    const fieldMatch = filterField === 'all' || change.field === filterField;
    return classMatch && fieldMatch;
  });

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

  const getFieldDisplayName = (field: string) => {
    const fieldNames: Record<string, string> = {
      'reqlevel': 'Nivel Requerido',
      'maxlvl': 'Nivel Máximo',
      'mana': 'Costo de Mana',
      'delay': 'Tiempo de Reutilización',
      'mindamage': 'Daño Mínimo',
      'maxdamage': 'Daño Máximo',
      'Param1': 'Parámetro 1',
      'Param2': 'Parámetro 2',
      'calc1': 'Cálculo 1',
      'calc2': 'Cálculo 2'
    };
    return fieldNames[field] || field;
  };

  const groupedChanges = filteredChanges.reduce((groups, change) => {
    const key = `${change.skillId}-${change.charClass}`;
    if (!groups[key]) {
      groups[key] = {
        skillName: change.skillName,
        skillId: change.skillId,
        charClass: change.charClass,
        changes: []
      };
    }
    groups[key].changes.push(change);
    return groups;
  }, {} as Record<string, any>);

  return (
    <div className="skills-changes">
      <div className="content-header">
        <h1>Resumen de Cambios - Habilidades</h1>
        <p>Visualiza todos los cambios realizados en las habilidades</p>
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
            <div className="filters-section">
              <div className="filter-group">
                <label htmlFor="class-filter">Clase:</label>
                <select 
                  id="class-filter"
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Todas las clases</option>
                  {charClasses.map(charClass => (
                    <option key={charClass} value={charClass}>{charClass}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label htmlFor="field-filter">Campo:</label>
                <select 
                  id="field-filter"
                  value={filterField}
                  onChange={(e) => setFilterField(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Todos los campos</option>
                  {fieldCategories.map(field => (
                    <option key={field} value={field}>{getFieldDisplayName(field)}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="stats-summary">
              <div className="summary-item">
                <span className="summary-label">Habilidades modificadas:</span>
                <span className="summary-value total">{Object.keys(groupedChanges).length}</span>
              </div>
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
          ) : Object.keys(groupedChanges).length === 0 ? (
            <div className="no-changes-message">
              <p>📝 No se han realizado cambios aún</p>
              <p>Los cambios aparecerán aquí cuando modifiques habilidades</p>
            </div>
          ) : (
            <div className="skills-groups">
              {Object.values(groupedChanges).map((group: any, index: number) => (
                <div key={index} className="skill-group">
                  <div className="skill-header">
                    <div className="skill-info">
                      <span className="skill-icon">✨</span>
                      <div className="skill-details">
                        <h3 className="skill-name">{group.skillName}</h3>
                        <span className="skill-class">{group.charClass}</span>
                      </div>
                    </div>
                    <div className="changes-count">
                      {group.changes.length} cambio{group.changes.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="changes-list">
                    {group.changes.map((change: SkillChange, changeIndex: number) => {
                      const direction = getChangeDirection(change.originalValue, change.currentValue);
                      return (
                        <div key={changeIndex} className={`change-item ${getChangeColor(direction)}`}>
                          <div className="change-field">
                            <span className="field-label">{getFieldDisplayName(change.field)}</span>
                            <code className="field-code">{change.field}</code>
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
                          
                          <div className="change-meta">
                            {typeof change.originalValue === 'number' && typeof change.currentValue === 'number' && (
                              <div className="change-magnitude">
                                {direction === 'increase' ? '+' : direction === 'decrease' ? '' : '±'}
                                {Math.abs(change.currentValue - change.originalValue)} 
                                ({direction === 'increase' ? '+' : ''}
                                {((change.currentValue - change.originalValue) / change.originalValue * 100).toFixed(1)}%)
                              </div>
                            )}
                            <div className="change-date">{formatDate(change.changedAt)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SkillsChanges;

import React, { useState } from 'react';
import { useModContext } from '../context/ModContext';
import './SkillsGlobal.css';

interface GlobalSkillChange {
  id: string;
  name: string;
  description: string;
  icon: string;
  changes: Record<string, any>;
  category: 'requirements' | 'levels' | 'damage' | 'mana' | 'cooldown' | 'synergies' | 'other';
}

const SkillsGlobal: React.FC = () => {
  const { selectedMod } = useModContext();
  const [selectedChanges, setSelectedChanges] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  const globalChanges: GlobalSkillChange[] = [
    // Categoría: Requirements
    {
      id: 'no-requirements',
      name: 'Sin Requisitos',
      description: 'Elimina todos los requisitos de nivel, stats y habilidades previas',
      icon: '🚫',
      category: 'requirements',
      changes: {
        reqlevel: 1,
        reqstr: 0,
        reqdex: 0,
        reqint: 0,
        reqvit: 0,
        reqskill1: '',
        reqskill2: '',
        reqskill3: ''
      }
    },
    {
      id: 'low-requirements',
      name: 'Requisitos Bajos',
      description: 'Reduce significativamente todos los requisitos',
      icon: '📉',
      category: 'requirements',
      changes: {
        reqlevel: 'Math.max(1, original * 0.3)',
        reqstr: 'Math.max(0, original * 0.5)',
        reqdex: 'Math.max(0, original * 0.5)',
        reqint: 'Math.max(0, original * 0.5)',
        reqvit: 'Math.max(0, original * 0.5)'
      }
    },

    // Categoría: Levels
    {
      id: 'max-level-30',
      name: 'Nivel Máximo 30',
      description: 'Establece el nivel máximo de todas las habilidades en 30',
      icon: '📈',
      category: 'levels',
      changes: {
        maxlvl: 30
      }
    },
    {
      id: 'max-level-50',
      name: 'Nivel Máximo 50',
      description: 'Establece el nivel máximo de todas las habilidades en 50',
      icon: '🚀',
      category: 'levels',
      changes: {
        maxlvl: 50
      }
    },
    {
      id: 'unlimited-levels',
      name: 'Niveles Ilimitados',
      description: 'Elimina el límite de nivel de todas las habilidades',
      icon: '♾️',
      category: 'levels',
      changes: {
        maxlvl: 99
      }
    },

    // Categoría: Damage
    {
      id: 'double-damage',
      name: 'Daño Doble',
      description: 'Duplica el daño base de todas las habilidades',
      icon: '⚡',
      category: 'damage',
      changes: {
        mindamage: 'original * 2',
        maxdamage: 'original * 2',
        'Param1': 'original * 2',
        'Param2': 'original * 2'
      }
    },
    {
      id: 'triple-damage',
      name: 'Daño Triple',
      description: 'Triplica el daño base de todas las habilidades',
      icon: '💥',
      category: 'damage',
      changes: {
        mindamage: 'original * 3',
        maxdamage: 'original * 3',
        'Param1': 'original * 3',
        'Param2': 'original * 3'
      }
    },

    // Categoría: Mana
    {
      id: 'no-mana-cost',
      name: 'Sin Costo de Mana',
      description: 'Elimina el costo de mana de todas las habilidades',
      icon: '💙',
      category: 'mana',
      changes: {
        mana: 0
      }
    },
    {
      id: 'low-mana-cost',
      name: 'Bajo Costo de Mana',
      description: 'Reduce el costo de mana en un 75%',
      icon: '💧',
      category: 'mana',
      changes: {
        mana: 'Math.max(1, original * 0.25)'
      }
    },

    // Categoría: Cooldown
    {
      id: 'no-cooldown',
      name: 'Sin Tiempo de Reutilización',
      description: 'Elimina el cooldown de todas las habilidades',
      icon: '⏰',
      category: 'cooldown',
      changes: {
        delay: 0
      }
    },
    {
      id: 'fast-cooldown',
      name: 'Cooldown Rápido',
      description: 'Reduce el tiempo de reutilización en un 80%',
      icon: '⚡',
      category: 'cooldown',
      changes: {
        delay: 'Math.max(1, original * 0.2)'
      }
    },

    // Categoría: Synergies
    {
      id: 'enhanced-synergies',
      name: 'Sinergias Mejoradas',
      description: 'Aumenta el bonus de sinergias entre habilidades',
      icon: '🔗',
      category: 'synergies',
      changes: {
        'calc1': 'original * 1.5',
        'calc2': 'original * 1.5',
        'calc3': 'original * 1.5',
        'calc4': 'original * 1.5'
      }
    },

    // Categoría: Other
    {
      id: 'overpowered-skills',
      name: 'Habilidades Súper Poderosas',
      description: 'Hace todas las habilidades extremadamente poderosas',
      icon: '🌟',
      category: 'other',
      changes: {
        reqlevel: 1,
        maxlvl: 50,
        mana: 1,
        delay: 0,
        mindamage: 'original * 5',
        maxdamage: 'original * 5',
        'Param1': 'original * 3',
        'Param2': 'original * 3'
      }
    }
  ];

  const categories = {
    requirements: { name: 'Requisitos', icon: '📋' },
    levels: { name: 'Niveles', icon: '📈' },
    damage: { name: 'Daño', icon: '⚔️' },
    mana: { name: 'Mana', icon: '💙' },
    cooldown: { name: 'Tiempo de Reutilización', icon: '⏰' },
    synergies: { name: 'Sinergias', icon: '🔗' },
    other: { name: 'Otros', icon: '⚙️' }
  };

  const toggleChange = (changeId: string) => {
    setSelectedChanges(prev => 
      prev.includes(changeId)
        ? prev.filter(id => id !== changeId)
        : [...prev, changeId]
    );
  };

  const applyGlobalChanges = async () => {
    if (!selectedMod || selectedChanges.length === 0) return;
    
    setIsApplying(true);
    try {
      const selectedChangeConfigs = globalChanges.filter(change => 
        selectedChanges.includes(change.id)
      );

      // Aquí harías la llamada al backend para aplicar los cambios globales
      console.log('Aplicando cambios globales a skills:', selectedChangeConfigs);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`¡Se aplicaron ${selectedChanges.length} cambios globales a todas las habilidades!`);
      setSelectedChanges([]);
    } catch (error) {
      console.error('Error aplicando cambios globales:', error);
      alert('Error al aplicar los cambios globales');
    } finally {
      setIsApplying(false);
    }
  };

  const clearSelection = () => {
    setSelectedChanges([]);
  };

  return (
    <div className="skills-global">
      <div className="content-header">
        <h1>Cambios Globales de Habilidades</h1>
        <p>Aplica modificaciones masivas a todas las habilidades del mod de una vez</p>
      </div>

      {!selectedMod && (
        <div className="warning-message">
          <p>⚠️ Selecciona un mod primero para aplicar cambios globales</p>
        </div>
      )}

      {selectedMod && (
        <>
          <div className="mod-info">
            <h3>Mod Actual: <span className="mod-name">{selectedMod.name}</span></h3>
            <p>Los cambios se aplicarán a todas las habilidades de este mod</p>
          </div>

          <div className="changes-controls">
            <div className="selected-count">
              Cambios seleccionados: <span className="count">{selectedChanges.length}</span>
            </div>
            <div className="control-buttons">
              <button 
                className="clear-button"
                onClick={clearSelection}
                disabled={selectedChanges.length === 0}
              >
                Limpiar Selección
              </button>
              <button 
                className="apply-button"
                onClick={applyGlobalChanges}
                disabled={selectedChanges.length === 0 || isApplying}
              >
                {isApplying ? 'Aplicando...' : `Aplicar ${selectedChanges.length} Cambios`}
              </button>
            </div>
          </div>

          <div className="changes-grid">
            {Object.entries(categories).map(([categoryKey, category]) => {
              const categoryChanges = globalChanges.filter(change => change.category === categoryKey);
              if (categoryChanges.length === 0) return null;

              return (
                <div key={categoryKey} className="change-category">
                  <h3 className="category-title">
                    <span className="category-icon">{category.icon}</span>
                    {category.name}
                  </h3>
                  <div className="changes-list">
                    {categoryChanges.map(change => (
                      <div 
                        key={change.id} 
                        className={`change-card ${selectedChanges.includes(change.id) ? 'selected' : ''}`}
                        onClick={() => toggleChange(change.id)}
                      >
                        <div className="change-icon">{change.icon}</div>
                        <div className="change-content">
                          <h4 className="change-name">{change.name}</h4>
                          <p className="change-description">{change.description}</p>
                          <div className="change-details">
                            <strong>Campos afectados:</strong>
                            <ul>
                              {Object.entries(change.changes).map(([key, value]) => (
                                <li key={key}>
                                  <code>{key}</code>: {typeof value === 'string' && value.includes('original') ? 
                                    <span className="formula">{value}</span> : 
                                    <span className="value">{value}</span>
                                  }
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="change-selector">
                          {selectedChanges.includes(change.id) ? '✅' : '⬜'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SkillsGlobal;

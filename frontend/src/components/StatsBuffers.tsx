import React, { useState } from 'react';
import { useModContext } from '../context/ModContext';
import './StatsBuffers.css';

interface BufferConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  changes: Record<string, any>;
  category: 'stamina' | 'requirements' | 'stats' | 'lighting' | 'health-mana' | 'other';
}

const StatsBuffers: React.FC = () => {
  const { selectedMod } = useModContext();
  const [selectedBuffers, setSelectedBuffers] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  const predefinedBuffers: BufferConfig[] = [
    // Categoría: Stamina
    {
      id: 'no-stamina',
      name: 'Sin Estamina',
      description: 'Elimina completamente el consumo de estamina',
      icon: '🏃‍♂️',
      category: 'stamina',
      changes: {
        stamina: 999999,
        'stamina recovery': 999,
        'run speed': 15
      }
    },
    {
      id: 'infinite-stamina',
      name: 'Estamina Infinita',
      description: 'Estamina que nunca se agota',
      icon: '♾️',
      category: 'stamina',
      changes: {
        stamina: 999999,
        'stamina recovery': 999
      }
    },

    // Categoría: Requirements
    {
      id: 'no-skill-requirements',
      name: 'Habilidades sin Requisito',
      description: 'Elimina todos los requisitos de habilidades',
      icon: '✨',
      category: 'requirements',
      changes: {
        'Skill 1': 1,
        'Skill 2': 1,
        'Skill 3': 1,
        'Skill 4': 1,
        'Skill 5': 1,
        'Skill 6': 1,
        'Skill 7': 1,
        'Skill 8': 1,
        'Skill 9': 1,
        'Skill 10': 1
      }
    },

    // Categoría: Stats
    {
      id: 'fast-leveling-stats',
      name: 'Stats Rápidos (+5 por Nivel)',
      description: 'Aumenta la cantidad de puntos de estadística por nivel',
      icon: '📈',
      category: 'stats',
      changes: {
        'StatPerLevel': 5
      }
    },
    {
      id: 'super-fast-leveling-stats',
      name: 'Stats Súper Rápidos (+10 por Nivel)',
      description: 'Aumenta significativamente los puntos de estadística por nivel',
      icon: '🚀',
      category: 'stats',
      changes: {
        'StatPerLevel': 10
      }
    },

    // Categoría: Health & Mana
    {
      id: 'high-hp-per-level',
      name: 'Vida Alta por Nivel',
      description: 'Aumenta la vida ganada por nivel (+20)',
      icon: '❤️',
      category: 'health-mana',
      changes: {
        'LifePerLevel': 20,
        'LifePerVitality': 4
      }
    },
    {
      id: 'high-mana-per-level',
      name: 'Mana Alto por Nivel',
      description: 'Aumenta el mana ganado por nivel (+15)',
      icon: '💙',
      category: 'health-mana',
      changes: {
        'ManaPerLevel': 15,
        'ManaPerMagic': 3
      }
    },

    // Categoría: Lighting
    {
      id: 'bright-lighting',
      name: 'Iluminación Brillante',
      description: 'Aumenta significativamente la iluminación del mapa',
      icon: '💡',
      category: 'lighting',
      changes: {
        'LightRadius': 15
      }
    },
    {
      id: 'super-bright-lighting',
      name: 'Iluminación Súper Brillante',
      description: 'Iluminación máxima en todo el mapa',
      icon: '🌟',
      category: 'lighting',
      changes: {
        'LightRadius': 25
      }
    },

    // Categoría: Other
    {
      id: 'fast-walk-run',
      name: 'Velocidad Aumentada',
      description: 'Aumenta significativamente la velocidad de movimiento',
      icon: '💨',
      category: 'other',
      changes: {
        'WalkVelocity': 9,
        'RunVelocity': 15
      }
    },
    {
      id: 'overpowered-start',
      name: 'Inicio Poderoso',
      description: 'Comienza con estadísticas muy altas',
      icon: '⚡',
      category: 'other',
      changes: {
        str: 100,
        dex: 100,
        int: 100,
        vit: 100,
        'StatPerLevel': 10,
        'LifePerLevel': 25,
        'ManaPerLevel': 20
      }
    }
  ];

  const categories = {
    stamina: { name: 'Estamina', icon: '🏃‍♂️' },
    requirements: { name: 'Requisitos', icon: '✨' },
    stats: { name: 'Estadísticas', icon: '📈' },
    'health-mana': { name: 'Vida y Mana', icon: '❤️💙' },
    lighting: { name: 'Iluminación', icon: '💡' },
    other: { name: 'Otros', icon: '⚙️' }
  };

  const toggleBuffer = (bufferId: string) => {
    setSelectedBuffers(prev => 
      prev.includes(bufferId)
        ? prev.filter(id => id !== bufferId)
        : [...prev, bufferId]
    );
  };

  const applyBuffers = async () => {
    if (!selectedMod || selectedBuffers.length === 0) return;
    
    setIsApplying(true);
    try {
      const selectedBufferConfigs = predefinedBuffers.filter(buffer => 
        selectedBuffers.includes(buffer.id)
      );

      // Aquí harías la llamada al backend para aplicar los buffers
      console.log('Aplicando buffers:', selectedBufferConfigs);
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`¡Se aplicaron ${selectedBuffers.length} buffers a todos los personajes!`);
      setSelectedBuffers([]);
    } catch (error) {
      console.error('Error aplicando buffers:', error);
      alert('Error al aplicar los buffers');
    } finally {
      setIsApplying(false);
    }
  };

  const clearSelection = () => {
    setSelectedBuffers([]);
  };

  return (
    <div className="stats-buffers">
      <div className="content-header">
        <h1>Buffers Globales de Personajes</h1>
        <p>Aplica cambios automáticos a todos los personajes del mod de una vez</p>
      </div>

      {!selectedMod && (
        <div className="warning-message">
          <p>⚠️ Selecciona un mod primero para usar los buffers</p>
        </div>
      )}

      {selectedMod && (
        <>
          <div className="mod-info">
            <h3>Mod Actual: <span className="mod-name">{selectedMod.name}</span></h3>
            <p>Los cambios se aplicarán a todos los personajes de este mod</p>
          </div>

          <div className="buffers-controls">
            <div className="selected-count">
              Buffers seleccionados: <span className="count">{selectedBuffers.length}</span>
            </div>
            <div className="control-buttons">
              <button 
                className="clear-button"
                onClick={clearSelection}
                disabled={selectedBuffers.length === 0}
              >
                Limpiar Selección
              </button>
              <button 
                className="apply-button"
                onClick={applyBuffers}
                disabled={selectedBuffers.length === 0 || isApplying}
              >
                {isApplying ? 'Aplicando...' : `Aplicar ${selectedBuffers.length} Buffers`}
              </button>
            </div>
          </div>

          <div className="buffers-grid">
            {Object.entries(categories).map(([categoryKey, category]) => {
              const categoryBuffers = predefinedBuffers.filter(buffer => buffer.category === categoryKey);
              if (categoryBuffers.length === 0) return null;

              return (
                <div key={categoryKey} className="buffer-category">
                  <h3 className="category-title">
                    <span className="category-icon">{category.icon}</span>
                    {category.name}
                  </h3>
                  <div className="buffers-list">
                    {categoryBuffers.map(buffer => (
                      <div 
                        key={buffer.id} 
                        className={`buffer-card ${selectedBuffers.includes(buffer.id) ? 'selected' : ''}`}
                        onClick={() => toggleBuffer(buffer.id)}
                      >
                        <div className="buffer-icon">{buffer.icon}</div>
                        <div className="buffer-content">
                          <h4 className="buffer-name">{buffer.name}</h4>
                          <p className="buffer-description">{buffer.description}</p>
                          <div className="buffer-changes">
                            <strong>Cambios:</strong>
                            <ul>
                              {Object.entries(buffer.changes).map(([key, value]) => (
                                <li key={key}>{key}: {value}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="buffer-selector">
                          {selectedBuffers.includes(buffer.id) ? '✅' : '⬜'}
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

export default StatsBuffers;

import React, { useState, useEffect, useCallback } from 'react';
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
  const [appliedBuffers, setAppliedBuffers] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  const predefinedBuffers: BufferConfig[] = [
    // Categoría: Stamina - Buffers compatibles entre sí
    {
      id: 'bolt',
      name: 'Bolt',
      description: 'Velocidad de carrera aumentada (RunVelocity = 15)',
      icon: '⚡',
      category: 'stamina',
      changes: {
        RunVelocity: 15
      }
    },
    {
      id: 'forest-runner',
      name: 'Forest Runner',
      description: 'Elimina completamente el consumo de estamina (RunDrain = 0)',
      icon: '🌲',
      category: 'stamina',
      changes: {
        RunDrain: 0
      }
    },

    // Categoría: Stats  
    {
      id: 'god-mode',
      name: 'God Mode',
      description: 'Estadísticas máximas para todos los atributos principales',
      icon: '👑',
      category: 'stats',
      changes: {
        str: 999,
        dex: 999,
        int: 999,
        vit: 999
      }
    },

    // Categoría: Health-Mana
    {
      id: 'mega-health',
      name: 'Mega Health',
      description: 'Incremento masivo de vida por nivel y vitalidad',
      icon: '❤️',
      category: 'health-mana',
      changes: {
        LifePerLevel: 20,
        LifePerVitality: 4
      }
    },
    {
      id: 'mega-mana',
      name: 'Mega Mana',
      description: 'Incremento masivo de mana por nivel y inteligencia',
      icon: '💙',
      category: 'health-mana',
      changes: {
        ManaPerLevel: 15,
        ManaPerMagic: 3
      }
    },

    // Categoría: Other
    {
      id: 'fast-cast',
      name: 'Fast Cast',
      description: 'Elimina el delay mínimo de conjuros (casting instantáneo)',
      icon: '🪄',
      category: 'other',
      changes: {
        MinimumCastingDelay: 0
      }
    },

    // Categoría: Lighting
    {
      id: 'super-bright',
      name: 'Super Bright',
      description: 'Radio de luz máximo para iluminación perfecta',
      icon: '💡',
      category: 'lighting',
      changes: {
        LightRadius: 15
      }
    },

    // Categoría: Requirements
    {
      id: 'no-level-requirements',
      name: 'No Level Requirements',
      description: 'Reduce significativamente los requisitos de nivel',
      icon: '✨',
      category: 'requirements',
      changes: {
        StatPerLevel: 1,
        SkillsPerLevel: 1
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

  // Función para obtener buffers aplicados
  const fetchAppliedBuffers = useCallback(async () => {
    if (!selectedMod) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/mods/${selectedMod.id}/applied-buffers`);
      if (response.ok) {
        const result = await response.json();
        setAppliedBuffers(result.appliedBuffers || []);
      }
    } catch (error) {
      console.error('Error fetching applied buffers:', error);
    }
  }, [selectedMod]);

  // Cargar buffers aplicados cuando se selecciona un mod
  useEffect(() => {
    fetchAppliedBuffers();
  }, [fetchAppliedBuffers]);

  const toggleBuffer = useCallback((bufferId: string) => {
    setSelectedBuffers(prev => 
      prev.includes(bufferId)
        ? prev.filter(id => id !== bufferId)
        : [...prev, bufferId]
    );
  }, []);

  const applyBuffers = useCallback(async () => {
    if (!selectedMod || selectedBuffers.length === 0) return;
    
    setIsApplying(true);
    try {
      const selectedBufferConfigs = predefinedBuffers.filter(buffer => 
        selectedBuffers.includes(buffer.id)
      );

      const response = await fetch(`http://localhost:3001/api/mods/${selectedMod.id}/apply-buffers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buffers: selectedBufferConfigs
        })
      });

      if (!response.ok) {
        throw new Error('Error aplicando buffers');
      }

      const result = await response.json();
      
      alert(`¡Buffers aplicados exitosamente!\n\n` +
            `📊 Personajes afectados: ${result.data.affectedRows}\n` +
            `⚡ Buffers aplicados: ${selectedBufferConfigs.map(b => b.name).join(', ')}\n` +
            `📄 Archivo generado: ${result.data.modFileGenerated ? 'Sí' : 'No'}\n\n` +
            `Los cambios se guardaron en la base de datos y se generó el archivo charstats.txt`);
      
      setSelectedBuffers([]);
      // Actualizar la lista de buffers aplicados
      fetchAppliedBuffers();
    } catch (error) {
      console.error('Error aplicando buffers:', error);
      alert('Error al aplicar los buffers: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setIsApplying(false);
    }
  }, [selectedMod, selectedBuffers, fetchAppliedBuffers, predefinedBuffers]);

  const clearSelection = useCallback(() => {
    setSelectedBuffers([]);
  }, []);

  if (!selectedMod) {
    return (
      <div className="stats-buffers">
        <h2>Buffers Globales</h2>
        <p>Por favor, selecciona un mod para ver y aplicar buffers.</p>
      </div>
    );
  }

  return (
    <div className="stats-buffers">
      <h2>⚡ Buffers Globales - {selectedMod.name}</h2>
      <p className="description">
        Aplica mejoras automáticas a <strong>todos los personajes</strong> del mod seleccionado. 
        Los buffers son <em>compatibles entre sí</em> cuando no modifican los mismos campos.
      </p>

      <div className="buffer-controls">
        <div className="selected-info">
          <span className="selected-count">
            Seleccionados: <span className="count">{selectedBuffers.length}</span>
          </span>
          <div className="control-buttons">
            <button
              onClick={clearSelection}
              className="clear-button"
              disabled={selectedBuffers.length === 0}
            >
              🗑️ Limpiar
            </button>
            <button
              onClick={applyBuffers}
              disabled={isApplying || selectedBuffers.length === 0}
              className="apply-button"
            >
              {isApplying ? '⏳ Aplicando...' : '✨ Aplicar Buffers'}
            </button>
          </div>
        </div>
      </div>

      <div className="buffers-container">
        <div className="buffer-categories">
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
                  {categoryBuffers.map(buffer => {
                    const isApplied = appliedBuffers.includes(buffer.name);
                    return (
                      <div
                        key={buffer.id}
                        className={`buffer-card ${selectedBuffers.includes(buffer.id) ? 'selected' : ''} ${isApplied ? 'applied' : ''}`}
                        onClick={() => toggleBuffer(buffer.id)}
                      >
                        <div className="buffer-icon">
                          {buffer.icon}
                          {isApplied && <span className="applied-indicator">✓</span>}
                        </div>
                        <div className="buffer-content">
                          <h4 className="buffer-name">
                            {buffer.name}
                            {isApplied && <span className="applied-text"> (Aplicado)</span>}
                          </h4>
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
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsBuffers;
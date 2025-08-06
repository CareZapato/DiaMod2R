import React, { useState, useEffect } from 'react';
import { CharStat } from '../types';
import axios from 'axios';

interface HeroCarouselProps {
  charStats: CharStat[];
  onCharStatUpdate: (updatedCharStat: CharStat) => void;
}

interface StatChange {
  field: string;
  original: number;
  current: number;
  difference: number;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ charStats, onCharStatUpdate }) => {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [editedStats, setEditedStats] = useState<Partial<CharStat>>({});
  const [statChanges, setStatChanges] = useState<{ [key: string]: StatChange }>({});
  const [isLoading, setIsLoading] = useState(false);

  const currentHero = charStats[currentHeroIndex];

  useEffect(() => {
    // Reset edited stats when hero changes
    setEditedStats({});
    setStatChanges({});
  }, [currentHeroIndex]);

  const nextHero = () => {
    if (currentHeroIndex < charStats.length - 1) {
      setCurrentHeroIndex(currentHeroIndex + 1);
    }
  };

  const prevHero = () => {
    if (currentHeroIndex > 0) {
      setCurrentHeroIndex(currentHeroIndex - 1);
    }
  };

  const goToHero = (index: number) => {
    setCurrentHeroIndex(index);
  };

  const handleStatChange = (field: string, value: number) => {
    const originalValue = (currentHero as any)[field] as number;
    const difference = value - originalValue;
    
    setEditedStats((prev: Partial<CharStat>) => ({
      ...prev,
      [field]: value
    }));

    setStatChanges((prev: { [key: string]: StatChange }) => ({
      ...prev,
      [field]: {
        field,
        original: originalValue,
        current: value,
        difference
      }
    }));
  };

  const getStatLimits = (field: string): { min: number; max: number } => {
    // Stats principales con límites específicos
    const mainStats = ['str', 'dex', 'int', 'vit'];
    if (mainStats.includes(field)) {
      return { min: 1, max: 270 };
    }
    // Otros stats con límites generales
    return { min: 0, max: 9999 };
  };

  const incrementStat = (field: string) => {
    const currentValue = editedStats[field as keyof CharStat] as number || (currentHero as any)[field] as number;
    const limits = getStatLimits(field);
    if (currentValue < limits.max) {
      handleStatChange(field, currentValue + 1);
    }
  };

  const decrementStat = (field: string) => {
    const currentValue = editedStats[field as keyof CharStat] as number || (currentHero as any)[field] as number;
    const limits = getStatLimits(field);
    if (currentValue > limits.min) {
      handleStatChange(field, currentValue - 1);
    }
  };

  const saveChanges = async () => {
    if (Object.keys(editedStats).length === 0) {
      alert('No hay cambios para guardar');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Guardar cambios en la base de datos
      const updateResponse = await axios.put(`http://localhost:3001/api/mods/charstats/${currentHero.id}`, editedStats);
      
      if (updateResponse.data.success) {
        onCharStatUpdate(updateResponse.data.data);
        
        // 2. Generar archivo modificado charstatsmod.txt
        const generateResponse = await axios.post(`http://localhost:3001/api/mods/${currentHero.modId}/generate-modified-file`);
        
        if (generateResponse.data.success) {
          setEditedStats({});
          setStatChanges({});
          alert(`Cambios guardados exitosamente.\nArchivo generado en: ${generateResponse.data.data.filePath}`);
        } else {
          alert('Cambios guardados, pero hubo un error generando el archivo modificado.');
        }
      }
    } catch (error) {
      console.error('Error guardando cambios:', error);
      if (axios.isAxiosError(error) && error.response) {
        alert(`Error al guardar los cambios: ${error.response.data.details || error.response.data.error}`);
      } else {
        alert('Error al guardar los cambios');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearChanges = () => {
    setEditedStats({});
    setStatChanges({});
  };

  const getCurrentValue = (field: string): number => {
    return editedStats[field as keyof CharStat] as number || (currentHero as any)[field] as number || 0;
  };

  const renderStatField = (label: string, field: string) => {
    const currentValue = getCurrentValue(field);
    const change = statChanges[field];
    const limits = getStatLimits(field);
    
    return (
      <div className="stat-field" key={field}>
        <label>{label}:</label>
        <div className="stat-controls">
          <button 
            type="button" 
            onClick={() => decrementStat(field)}
            className="stat-button minus"
            disabled={currentValue <= limits.min}
          >
            -
          </button>
          <input
            type="number"
            value={currentValue}
            min={limits.min}
            max={limits.max}
            onChange={(e) => {
              const value = parseInt(e.target.value) || limits.min;
              const clampedValue = Math.max(limits.min, Math.min(limits.max, value));
              handleStatChange(field, clampedValue);
            }}
            className="stat-input"
          />
          <button 
            type="button" 
            onClick={() => incrementStat(field)}
            className="stat-button plus"
            disabled={currentValue >= limits.max}
          >
            +
          </button>
          <span className={`stat-change ${change ? (change.difference >= 0 ? 'positive' : 'negative') : 'hidden'}`}>
            {change ? (change.difference >= 0 ? '+' : '') + change.difference : ''}
          </span>
        </div>
      </div>
    );
  };

  if (!currentHero) {
    return <div>No hay héroes para mostrar</div>;
  }

  // Function to get character icon based on class
  const getCharacterIcon = (className: string): string => {
    const icons: { [key: string]: string } = {
      'Amazon': '🏹',
      'Sorceress': '🔮',
      'Necromancer': '💀',
      'Paladin': '⚔️',
      'Barbarian': '🪓',
      'Druid': '🌿',
      'Assassin': '🗡️'
    };
    return icons[className] || '🛡️';
  };

  const numericStats = [
    { label: 'Fuerza', field: 'str' },
    { label: 'Destreza', field: 'dex' },
    { label: 'Inteligencia', field: 'int' },
    { label: 'Vitalidad', field: 'vit' },
    { label: 'Stamina', field: 'stamina' },
    { label: 'HP Adicional', field: 'hpadd' },
    { label: 'Regeneración Mana', field: 'ManaRegen' },
    { label: 'Factor de Golpe', field: 'ToHitFactor' },
    { label: 'Velocidad Caminar', field: 'WalkVelocity' },
    { label: 'Velocidad Correr', field: 'RunVelocity' },
    { label: 'Drenaje Correr', field: 'RunDrain' },
    { label: 'Vida por Nivel', field: 'LifePerLevel' },
    { label: 'Stamina por Nivel', field: 'StaminaPerLevel' },
    { label: 'Mana por Nivel', field: 'ManaPerLevel' },
    { label: 'Vida por Vitalidad', field: 'LifePerVitality' },
    { label: 'Stamina por Vitalidad', field: 'StaminaPerVitality' },
    { label: 'Mana por Magia', field: 'ManaPerMagic' },
    { label: 'Stats por Nivel', field: 'StatPerLevel' },
    { label: 'Skills por Nivel', field: 'SkillsPerLevel' },
    { label: 'Radio de Luz', field: 'LightRadius' },
    { label: 'Factor de Bloqueo', field: 'BlockFactor' },
    { label: 'Delay Mínimo Casteo', field: 'MinimumCastingDelay' },
    { label: '% Poción Salud', field: 'HealthPotionPercent' },
    { label: '% Poción Mana', field: 'ManaPotionPercent' }
  ];

  const midPoint = Math.ceil(numericStats.length / 2);
  const leftColumnStats = numericStats.slice(0, midPoint);
  const rightColumnStats = numericStats.slice(midPoint);

  return (
    <div className="hero-carousel">
      {/* Navigation */}
      <div className="carousel-header">
        <button 
          onClick={prevHero} 
          disabled={currentHeroIndex === 0}
          className="nav-button prev minimal"
          title="Héroe anterior"
        >
          ◀
        </button>
        
        <div className="hero-info">
          <div className="hero-portrait">
            <div className="character-icon" title={currentHero.class}>
              {getCharacterIcon(currentHero.class)}
            </div>
          </div>
          <h2>{currentHero.class}</h2>
          <span className="hero-type">{currentHero.expansion ? 'Expansión' : 'Clásico'}</span>
          <span className="hero-counter">({currentHeroIndex + 1} de {charStats.length})</span>
        </div>
        
        <button 
          onClick={nextHero} 
          disabled={currentHeroIndex === charStats.length - 1}
          className="nav-button next minimal"
          title="Siguiente héroe"
        >
          ▶
        </button>
      </div>

      {/* Hero dots indicator */}
      <div className="hero-dots">
        {charStats.map((_, index) => (
          <button
            key={index}
            onClick={() => goToHero(index)}
            className={`dot ${index === currentHeroIndex ? 'active' : ''}`}
            title={charStats[index].class}
          >
          </button>
        ))}
      </div>

      {/* Stats Editor */}
      <div className="stats-editor">
        <div className="stats-columns">
          <div className="stats-column left">
            <h3>Estadísticas Base</h3>
            {leftColumnStats.map(stat => renderStatField(stat.label, stat.field))}
          </div>
          
          <div className="stats-column right">
            <h3>Estadísticas Avanzadas</h3>
            {rightColumnStats.map(stat => renderStatField(stat.label, stat.field))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="action-buttons">
          <button 
            onClick={saveChanges}
            disabled={isLoading || Object.keys(editedStats).length === 0}
            className="save-button"
          >
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          
          <button 
            onClick={clearChanges}
            disabled={Object.keys(editedStats).length === 0}
            className="clear-button"
          >
            Limpiar Cambios
          </button>
        </div>

        {/* Changes summary */}
        {Object.keys(statChanges).length > 0 && (
          <div className="changes-summary">
            <h4>Cambios pendientes:</h4>
            <ul>
              {Object.values(statChanges).map(change => (
                <li key={change.field}>
                  <strong>{change.field}:</strong> {change.original} → {change.current} 
                  <span className={`change-indicator ${change.difference >= 0 ? 'positive' : 'negative'}`}>
                    ({change.difference >= 0 ? '+' : ''}{change.difference})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroCarousel;

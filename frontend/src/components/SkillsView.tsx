import React, { useState, useEffect } from 'react';
import { Skill, Mod } from '../types';
import { skillService } from '../services/skillService';
import './SkillsView.css';

interface SkillsViewProps {
  mods: Mod[];
}

export const SkillsView: React.FC<SkillsViewProps> = ({ mods }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [selectedMod, setSelectedMod] = useState<number | ''>('');
  const [selectedCharClass, setSelectedCharClass] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Obtener clases únicas para el filtro
  const uniqueCharClasses = React.useMemo(() => {
    const classes = new Set<string>();
    skills.forEach(skill => {
      if (skill.charclass && skill.charclass.trim() !== '') {
        classes.add(skill.charclass);
      }
    });
    return Array.from(classes).sort();
  }, [skills]);

  useEffect(() => {
    loadSkills();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [skills, selectedMod, selectedCharClass, searchTerm]);

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const skillsData = await skillService.getSkills();
      setSkills(skillsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...skills];

    // Filtrar por mod
    if (selectedMod !== '') {
      filtered = filtered.filter(skill => skill.modId === selectedMod);
    }

    // Filtrar por clase
    if (selectedCharClass !== '') {
      filtered = filtered.filter(skill => skill.charclass === selectedCharClass);
    }

    // Filtrar por búsqueda
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(skill =>
        skill.skill.toLowerCase().includes(search) ||
        skill.skilldesc.toLowerCase().includes(search) ||
        skill.starId.toLowerCase().includes(search)
      );
    }

    setFilteredSkills(filtered);
  };

  const clearFilters = () => {
    setSelectedMod('');
    setSelectedCharClass('');
    setSearchTerm('');
  };

  const getCharClassDisplayName = (charclass: string) => {
    const classMap: { [key: string]: string } = {
      'ama': 'Amazon',
      'ass': 'Assassin',
      'bar': 'Barbarian',
      'dru': 'Druid',
      'nec': 'Necromancer',
      'pal': 'Paladin',
      'sor': 'Sorceress'
    };
    return classMap[charclass.toLowerCase()] || charclass;
  };

  if (loading) {
    return (
      <div className="skills-view">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Cargando habilidades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="skills-view">
        <div className="error">
          <h3>Error al cargar habilidades</h3>
          <p>{error}</p>
          <button onClick={loadSkills} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="skills-view">
      <div className="skills-header">
        <h2>Habilidades del Mod</h2>
        <p>Total: {filteredSkills.length} habilidades</p>
      </div>

      {/* Filtros */}
      <div className="skills-filters">
        <div className="filter-group">
          <label htmlFor="mod-filter">Mod:</label>
          <select
            id="mod-filter"
            value={selectedMod}
            onChange={(e) => setSelectedMod(e.target.value === '' ? '' : parseInt(e.target.value))}
          >
            <option value="">Todos los mods</option>
            {mods.map(mod => (
              <option key={mod.id} value={mod.id}>
                {mod.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="class-filter">Clase:</label>
          <select
            id="class-filter"
            value={selectedCharClass}
            onChange={(e) => setSelectedCharClass(e.target.value)}
          >
            <option value="">Todas las clases</option>
            <option value="">Sin clase</option>
            {uniqueCharClasses.map(charClass => (
              <option key={charClass} value={charClass}>
                {getCharClassDisplayName(charClass)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="search-filter">Buscar:</label>
          <input
            id="search-filter"
            type="text"
            placeholder="Nombre, descripción o *ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button onClick={clearFilters} className="clear-filters-button">
          Limpiar filtros
        </button>
      </div>

      {/* Lista de habilidades */}
      <div className="skills-list">
        {filteredSkills.length === 0 ? (
          <div className="no-skills">
            <p>No se encontraron habilidades con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="skills-grid">
            {filteredSkills.map(skill => (
              <div key={skill.id} className="skill-card">
                <div className="skill-header">
                  <h3 className="skill-name">{skill.skill}</h3>
                  <span className="skill-star-id">*{skill.starId}</span>
                </div>
                
                <div className="skill-details">
                  <div className="skill-description">
                    {skill.skilldesc || 'Sin descripción'}
                  </div>
                  
                  <div className="skill-meta">
                    <div className="skill-class">
                      <strong>Clase:</strong> {
                        skill.charclass ? 
                        getCharClassDisplayName(skill.charclass) : 
                        <span className="no-class">Sin clase</span>
                      }
                    </div>
                    <div className="skill-mod">
                      <strong>Mod:</strong> {skill.modName}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

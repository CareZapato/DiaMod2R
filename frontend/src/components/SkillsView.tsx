import React, { useState, useEffect } from 'react';
import { Skill, Mod } from '../types';
import { skillService } from '../services/skillService';
import './SkillsView.css';

interface SkillsViewProps {
  mods: Mod[];
}

interface SkillEdit {
  reqlevel: number;
  maxlvl: number;
}

export const SkillsView: React.FC<SkillsViewProps> = ({ mods }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSkills, setEditingSkills] = useState<{ [skillId: number]: SkillEdit }>({});
  const [savingSkills, setSavingSkills] = useState<Set<number>>(new Set());
  const [generatingFile, setGeneratingFile] = useState(false);
  
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

  const startEditing = (skill: Skill) => {
    setEditingSkills(prev => ({
      ...prev,
      [skill.id]: {
        reqlevel: skill.reqlevel,
        maxlvl: skill.maxlvl
      }
    }));
  };

  const cancelEditing = (skillId: number) => {
    setEditingSkills(prev => {
      const newState = { ...prev };
      delete newState[skillId];
      return newState;
    });
  };

  const updateEditingValue = (skillId: number, field: keyof SkillEdit, value: number) => {
    setEditingSkills(prev => ({
      ...prev,
      [skillId]: {
        ...prev[skillId],
        [field]: value
      }
    }));
  };

  const saveSkill = async (skillId: number) => {
    const edits = editingSkills[skillId];
    if (!edits) return;

    try {
      setSavingSkills(prev => new Set(prev).add(skillId));
      
      const updatedSkill = await skillService.updateSkill(skillId, edits);
      
      // Actualizar la skill en la lista local
      setSkills(prev => prev.map(skill => 
        skill.id === skillId ? updatedSkill : skill
      ));
      
      // Limpiar el estado de edición
      cancelEditing(skillId);
      
    } catch (error) {
      console.error('Error saving skill:', error);
      alert('Error al guardar la skill. Por favor, intenta de nuevo.');
    } finally {
      setSavingSkills(prev => {
        const newSet = new Set(prev);
        newSet.delete(skillId);
        return newSet;
      });
    }
  };

  const generateModifiedFile = async () => {
    if (selectedMod === '') return;
    
    try {
      setGeneratingFile(true);
      const result = await skillService.generateModifiedSkillsFile(selectedMod as number);
      alert(`Archivo skillsmod.txt generado exitosamente en:\n${result.filePath}`);
    } catch (error) {
      console.error('Error generating modified skills file:', error);
      alert('Error al generar el archivo modificado. Por favor, intenta de nuevo.');
    } finally {
      setGeneratingFile(false);
    }
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
        <div className="header-left">
          <h2>Habilidades del Mod</h2>
          <p>Total: {filteredSkills.length} habilidades</p>
        </div>
        <div className="header-right">
          <button 
            onClick={generateModifiedFile}
            disabled={generatingFile || selectedMod === '' || filteredSkills.length === 0}
            className="generate-file-button"
          >
            {generatingFile ? 'Generando...' : '📄 Generar Archivo'}
          </button>
        </div>
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
            {filteredSkills.map(skill => {
              const isEditing = editingSkills[skill.id];
              const isSaving = savingSkills.has(skill.id);
              
              return (
                <div key={skill.id} className="skill-card">
                  <div className="skill-header">
                    <h3 className="skill-name">{skill.skill}</h3>
                    <span className="skill-star-id">*{skill.starId}</span>
                  </div>
                  
                  <div className="skill-details">
                    <div className="skill-description">
                      {skill.skilldesc || 'Sin descripción'}
                    </div>
                    
                    <div className="skill-requirements">
                      <div className="skill-requirement">
                        <label>Nivel Requerido:</label>
                        {isEditing ? (
                          <div className="value-editor">
                            <button 
                              onClick={() => updateEditingValue(skill.id, 'reqlevel', Math.max(0, isEditing.reqlevel - 1))}
                              disabled={isSaving}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={isEditing.reqlevel}
                              onChange={(e) => updateEditingValue(skill.id, 'reqlevel', parseInt(e.target.value) || 0)}
                              min="0"
                              max="99"
                              disabled={isSaving}
                            />
                            <button 
                              onClick={() => updateEditingValue(skill.id, 'reqlevel', Math.min(99, isEditing.reqlevel + 1))}
                              disabled={isSaving}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="skill-value">{skill.reqlevel}</span>
                        )}
                      </div>
                      
                      <div className="skill-requirement">
                        <label>Nivel Máximo:</label>
                        {isEditing ? (
                          <div className="value-editor">
                            <button 
                              onClick={() => updateEditingValue(skill.id, 'maxlvl', Math.max(1, isEditing.maxlvl - 1))}
                              disabled={isSaving}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={isEditing.maxlvl}
                              onChange={(e) => updateEditingValue(skill.id, 'maxlvl', parseInt(e.target.value) || 1)}
                              min="1"
                              max="99"
                              disabled={isSaving}
                            />
                            <button 
                              onClick={() => updateEditingValue(skill.id, 'maxlvl', Math.min(99, isEditing.maxlvl + 1))}
                              disabled={isSaving}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="skill-value">{skill.maxlvl}</span>
                        )}
                      </div>
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
                    
                    <div className="skill-actions">
                      {isEditing ? (
                        <>
                          <button 
                            onClick={() => saveSkill(skill.id)}
                            disabled={isSaving}
                            className="save-button"
                          >
                            {isSaving ? 'Guardando...' : 'Guardar'}
                          </button>
                          <button 
                            onClick={() => cancelEditing(skill.id)}
                            disabled={isSaving}
                            className="cancel-button"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => startEditing(skill)}
                          className="edit-button"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

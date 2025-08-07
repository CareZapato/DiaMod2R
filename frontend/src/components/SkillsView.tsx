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

interface SkillChange {
  id: number;
  skill: string;
  field: string;
  oldValue: number;
  newValue: number;
}

interface OriginalSkillValues {
  [skillId: number]: {
    reqlevel: number;
    maxlvl: number;
  };
}

export const SkillsView: React.FC<SkillsViewProps> = ({ mods }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSkills, setEditingSkills] = useState<{ [skillId: number]: SkillEdit }>({});
  const [originalSkillValues, setOriginalSkillValues] = useState<OriginalSkillValues>({});
  const [savingSkills, setSavingSkills] = useState<Set<number>>(new Set());
  const [generatingFile, setGeneratingFile] = useState(false);
  const [skillChanges, setSkillChanges] = useState<SkillChange[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Para el incremento rápido con botones mantenidos
  const [incrementIntervals, setIncrementIntervals] = useState<{ [key: string]: NodeJS.Timeout }>({});
  
  // Estados para paginación y vista
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12); // Cards por página
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  
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

  // Lógica de paginación
  const totalPages = Math.ceil(filteredSkills.length / itemsPerPage);
  const paginatedSkills = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSkills.slice(startIndex, endIndex);
  }, [filteredSkills, currentPage, itemsPerPage]);

  // Resetear página cuando cambian los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedMod, selectedCharClass, searchTerm]);

  useEffect(() => {
    loadSkills();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [skills, selectedMod, selectedCharClass, searchTerm]);

  // Limpiar intervalos al desmontar el componente
  useEffect(() => {
    return () => {
      Object.values(incrementIntervals).forEach(interval => {
        clearTimeout(interval);
      });
    };
  }, [incrementIntervals]);

  // Establecer mod por defecto si solo hay uno, o si todos los skills son del mismo mod
  useEffect(() => {
    if (skills.length > 0 && selectedMod === '') {
      // Si solo hay un mod disponible, seleccionarlo automáticamente
      if (mods.length === 1) {
        setSelectedMod(mods[0].id);
      } else {
        // Si todos los skills cargados son del mismo mod, seleccionarlo
        const uniqueModIds = Array.from(new Set(skills.map(skill => skill.modId)));
        if (uniqueModIds.length === 1) {
          setSelectedMod(uniqueModIds[0]);
        }
      }
    }
  }, [mods, skills, selectedMod]);

  const loadSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const skillsData = await skillService.getSkills();
      setSkills(skillsData);
      
      // Guardar valores originales
      const originalValues: OriginalSkillValues = {};
      skillsData.forEach(skill => {
        originalValues[skill.id] = {
          reqlevel: skill.reqlevel,
          maxlvl: skill.maxlvl
        };
      });
      setOriginalSkillValues(originalValues);
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

  const handleCardClick = (skill: Skill, event: React.MouseEvent) => {
    // No activar edición si se hace click en un botón o input
    const target = event.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT') {
      return;
    }
    
    // Si ya está en edición, no hacer nada
    if (editingSkills[skill.id]) {
      return;
    }
    
    startEditing(skill);
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

  // Funciones para incremento rápido
  const startIncrement = (skillId: number, field: keyof SkillEdit, direction: 'up' | 'down') => {
    const intervalKey = `${skillId}-${field}-${direction}`;
    
    // Limpiar cualquier intervalo existente
    if (incrementIntervals[intervalKey]) {
      clearTimeout(incrementIntervals[intervalKey]);
    }
    
    const increment = () => {
      const currentValue = editingSkills[skillId]?.[field] || 0;
      const newValue = direction === 'up' 
        ? Math.min(99, currentValue + 1)
        : Math.max(field === 'maxlvl' ? 1 : 0, currentValue - 1);
      
      updateEditingValue(skillId, field, newValue);
      
      // Configurar el siguiente incremento más rápido (100ms)
      const newInterval = setTimeout(increment, 100);
      setIncrementIntervals(prev => ({
        ...prev,
        [intervalKey]: newInterval
      }));
    };
    
    // Primer incremento después de 300ms
    const initialInterval = setTimeout(increment, 300);
    setIncrementIntervals(prev => ({
      ...prev,
      [intervalKey]: initialInterval
    }));
  };

  const stopIncrement = (skillId: number, field: keyof SkillEdit, direction: 'up' | 'down') => {
    const intervalKey = `${skillId}-${field}-${direction}`;
    
    if (incrementIntervals[intervalKey]) {
      clearTimeout(incrementIntervals[intervalKey]);
      setIncrementIntervals(prev => {
        const newState = { ...prev };
        delete newState[intervalKey];
        return newState;
      });
    }
  };

  const saveSkill = async (skillId: number) => {
    const edits = editingSkills[skillId];
    if (!edits) return;

    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    try {
      setSavingSkills(prev => new Set(prev).add(skillId));
      
      const response = await skillService.updateSkill(skillId, edits);
      if (response.success && response.data) {
        const updatedSkill = response.data;
        
        // Actualizar la skill en la lista local, preservando modName si no viene en la respuesta
        setSkills(prev => prev.map(s => 
          s.id === skillId ? {
            ...updatedSkill,
            modName: updatedSkill.modName || s.modName // Preservar modName original si no viene
          } : s
        ));

        // Trackear cambios
        const changes: SkillChange[] = [];
        if (skill.reqlevel !== edits.reqlevel) {
          changes.push({
            id: skillId,
            skill: skill.skill,
            field: 'reqlevel',
            oldValue: skill.reqlevel,
            newValue: edits.reqlevel
          });
        }
        if (skill.maxlvl !== edits.maxlvl) {
          changes.push({
            id: skillId,
            skill: skill.skill,
            field: 'maxlvl',
            oldValue: skill.maxlvl,
            newValue: edits.maxlvl
          });
        }

        if (changes.length > 0) {
          setSkillChanges(prev => {
            // Remover cambios anteriores para esta skill y estos campos
            const filtered = prev.filter(change => 
              !(change.id === skillId && changes.some(c => c.field === change.field))
            );
            return [...filtered, ...changes];
          });
          setHasUnsavedChanges(true);
        }
        
        // Limpiar el estado de edición
        cancelEditing(skillId);
      }
      
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

  const generateFile = async () => {
    if (skillChanges.length === 0) return;

    // Determinar el mod para exportar
    let modToExport: number | null = null;
    
    // Si hay un mod seleccionado y es un número válido, usarlo
    if (typeof selectedMod === 'number') {
      modToExport = selectedMod;
    }
    
    // Si no hay mod seleccionado, usar el mod de los cambios
    if (!modToExport) {
      const changedSkillIds = skillChanges.map(change => change.id);
      const changedSkills = skills.filter(skill => changedSkillIds.includes(skill.id));
      
      if (changedSkills.length === 0) return;
      
      // Verificar que todos los cambios son del mismo mod
      const modIds = changedSkills.map(skill => skill.modId);
      const uniqueModIds = Array.from(new Set(modIds));
      
      if (uniqueModIds.length > 1) {
        alert('Los cambios pertenecen a múltiples mods. Por favor, selecciona un mod específico para exportar.');
        return;
      }
      
      modToExport = uniqueModIds[0];
    }

    if (!modToExport) return;

    try {
      setGeneratingFile(true);
      const response = await skillService.generateModifiedSkillsFile(modToExport);
      
      if (response.success && response.data) {
        alert(`Archivo skillsmod.txt generado exitosamente en: ${response.data.filePath}`);
        setHasUnsavedChanges(false);
        // Limpiar cambios relacionados con este mod
        setSkillChanges(prev => {
          const modSkills = skills.filter(skill => skill.modId === modToExport).map(skill => skill.id);
          return prev.filter(change => !modSkills.includes(change.id));
        });
      } else {
        alert('Error generando archivo: ' + response.error);
      }
    } catch (error) {
      console.error('Error generating file:', error);
      alert('Error al generar el archivo. Por favor, intenta de nuevo.');
    } finally {
      setGeneratingFile(false);
    }
  };

  const clearChanges = async () => {
    try {
      // Restaurar valores originales de las skills que han cambiado
      const changedSkillIds = Array.from(new Set(skillChanges.map(change => change.id)));
      
      for (const skillId of changedSkillIds) {
        const originalValues = originalSkillValues[skillId];
        if (originalValues) {
          // Restaurar en la base de datos
          await skillService.updateSkill(skillId, originalValues);
          
          // Actualizar en el estado local
          setSkills(prev => prev.map(skill => 
            skill.id === skillId 
              ? { ...skill, ...originalValues }
              : skill
          ));
        }
      }
      
      // Limpiar cambios y estado de edición
      setSkillChanges([]);
      setHasUnsavedChanges(false);
      setEditingSkills({});
      
      alert('Se han restaurado los valores originales de las skills modificadas.');
    } catch (error) {
      console.error('Error restaurando valores originales:', error);
      alert('Error al restaurar los valores originales. Por favor, intenta de nuevo.');
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

  // Funciones de paginación
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
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
          <p>
            Total: {filteredSkills.length} habilidades
            {filteredSkills.length > 0 && (
              <span className="pagination-info">
                {' '} | Página {currentPage} de {totalPages} | Mostrando {paginatedSkills.length} de {filteredSkills.length}
              </span>
            )}
          </p>
          {skillChanges.length > 0 && (
            <p className="changes-info">
              ✏️ {skillChanges.length} cambio{skillChanges.length !== 1 ? 's' : ''} sin exportar
            </p>
          )}
        </div>
        <div className="header-right">
          <div className="view-controls">
            <div className="view-mode-selector">
              <button 
                onClick={() => setViewMode('cards')}
                className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
                title="Vista de tarjetas"
              >
                📄
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                title="Vista de lista"
              >
                📋
              </button>
            </div>
            <div className="items-per-page">
              <label>Por página:</label>
              <select 
                value={itemsPerPage} 
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>
          </div>
          <button 
            onClick={generateFile}
            disabled={generatingFile || skillChanges.length === 0}
            className="generate-file-button"
          >
            {generatingFile ? 'Generando...' : '📄 Exportar Cambios'}
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

      {/* Lista de cambios */}
      {skillChanges.length > 0 && (
        <div className="changes-summary">
          <div className="changes-header">
            <h3>📝 Cambios Realizados ({skillChanges.length})</h3>
            <button onClick={clearChanges} className="clear-changes-button">
              Limpiar cambios
            </button>
          </div>
          <div className="changes-list">
            {skillChanges.map((change, index) => (
              <div key={index} className="change-item">
                <span className="skill-name">{change.skill}</span>
                <span className="change-field">{change.field}</span>
                <span className="change-values">
                  {change.oldValue} → {change.newValue}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de habilidades */}
      <div className="skills-list">
        {filteredSkills.length === 0 ? (
          <div className="no-skills">
            <p>No se encontraron habilidades con los filtros aplicados.</p>
          </div>
        ) : (
          <>
            {/* Vista de Cards */}
            {viewMode === 'cards' && (
              <div className="skills-grid">
                {paginatedSkills.map(skill => {
                  const isEditing = editingSkills[skill.id];
                  const isSaving = savingSkills.has(skill.id);
                  
                  return (
                    <div 
                      key={skill.id} 
                      className={`skill-card compact ${isEditing ? 'editing' : ''}`}
                      onClick={(e) => handleCardClick(skill, e)}
                      style={{ cursor: isEditing ? 'default' : 'pointer' }}
                    >
                      <div className="skill-header">
                        <div className="skill-title">
                          <span className="skill-star-id">*{skill.starId}</span>
                          <h4 className="skill-name">{skill.skill}</h4>
                        </div>
                      </div>
                      
                      <div className="skill-details">
                        <div className="skill-requirements">
                          <div className="skill-requirement">
                            <label>Nivel requerido:</label>
                            {isEditing ? (
                              <div className="value-editor">
                                <button 
                                  onClick={() => updateEditingValue(skill.id, 'reqlevel', Math.max(0, isEditing.reqlevel - 1))}
                                  onMouseDown={() => startIncrement(skill.id, 'reqlevel', 'down')}
                                  onMouseUp={() => stopIncrement(skill.id, 'reqlevel', 'down')}
                                  onMouseLeave={() => stopIncrement(skill.id, 'reqlevel', 'down')}
                                  disabled={isSaving}
                                  className="increment-button"
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
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button 
                                  onClick={() => updateEditingValue(skill.id, 'reqlevel', Math.min(99, isEditing.reqlevel + 1))}
                                  onMouseDown={() => startIncrement(skill.id, 'reqlevel', 'up')}
                                  onMouseUp={() => stopIncrement(skill.id, 'reqlevel', 'up')}
                                  onMouseLeave={() => stopIncrement(skill.id, 'reqlevel', 'up')}
                                  disabled={isSaving}
                                  className="increment-button"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <span className="skill-value">{skill.reqlevel}</span>
                            )}
                          </div>
                          
                          <div className="skill-requirement">
                            <label>Nivel máximo:</label>
                            {isEditing ? (
                              <div className="value-editor">
                                <button 
                                  onClick={() => updateEditingValue(skill.id, 'maxlvl', Math.max(1, isEditing.maxlvl - 1))}
                                  onMouseDown={() => startIncrement(skill.id, 'maxlvl', 'down')}
                                  onMouseUp={() => stopIncrement(skill.id, 'maxlvl', 'down')}
                                  onMouseLeave={() => stopIncrement(skill.id, 'maxlvl', 'down')}
                                  disabled={isSaving}
                                  className="increment-button"
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
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button 
                                  onClick={() => updateEditingValue(skill.id, 'maxlvl', Math.min(99, isEditing.maxlvl + 1))}
                                  onMouseDown={() => startIncrement(skill.id, 'maxlvl', 'up')}
                                  onMouseUp={() => stopIncrement(skill.id, 'maxlvl', 'up')}
                                  onMouseLeave={() => stopIncrement(skill.id, 'maxlvl', 'up')}
                                  disabled={isSaving}
                                  className="increment-button"
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
                            {skill.charclass ? getCharClassDisplayName(skill.charclass) : 'Sin clase'}
                          </div>
                        </div>
                        
                        <div className="skill-actions">
                          {isEditing ? (
                            <>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveSkill(skill.id);
                                }}
                                disabled={isSaving}
                                className="save-button"
                              >
                                {isSaving ? '💾' : '✓'}
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelEditing(skill.id);
                                }}
                                disabled={isSaving}
                                className="cancel-button"
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(skill);
                              }}
                              className="edit-button"
                            >
                              ✏️
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Vista de Lista */}
            {viewMode === 'list' && (
              <div className="skills-list-view">
                {paginatedSkills.map(skill => {
                  const isEditing = editingSkills[skill.id];
                  const isSaving = savingSkills.has(skill.id);
                  
                  return (
                    <div 
                      key={skill.id} 
                      className={`skill-row ${isEditing ? 'editing' : ''}`}
                      onClick={(e) => handleCardClick(skill, e)}
                      style={{ cursor: isEditing ? 'default' : 'pointer' }}
                    >
                      <div className="skill-row-main">
                        <div className="skill-info">
                          <span className="skill-star-id">*{skill.starId}</span>
                          <h4 className="skill-name">{skill.skill}</h4>
                          <span className="skill-class">
                            {skill.charclass ? getCharClassDisplayName(skill.charclass) : 'Sin clase'}
                          </span>
                        </div>
                        
                        <div className="skill-values">
                          <div className="skill-requirement">
                            <label>Nivel requerido:</label>
                            {isEditing ? (
                              <div className="value-editor">
                                <button 
                                  onClick={() => updateEditingValue(skill.id, 'reqlevel', Math.max(0, isEditing.reqlevel - 1))}
                                  onMouseDown={() => startIncrement(skill.id, 'reqlevel', 'down')}
                                  onMouseUp={() => stopIncrement(skill.id, 'reqlevel', 'down')}
                                  onMouseLeave={() => stopIncrement(skill.id, 'reqlevel', 'down')}
                                  disabled={isSaving}
                                  className="increment-button"
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
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button 
                                  onClick={() => updateEditingValue(skill.id, 'reqlevel', Math.min(99, isEditing.reqlevel + 1))}
                                  onMouseDown={() => startIncrement(skill.id, 'reqlevel', 'up')}
                                  onMouseUp={() => stopIncrement(skill.id, 'reqlevel', 'up')}
                                  onMouseLeave={() => stopIncrement(skill.id, 'reqlevel', 'up')}
                                  disabled={isSaving}
                                  className="increment-button"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <span className="skill-value">{skill.reqlevel}</span>
                            )}
                          </div>
                          
                          <div className="skill-requirement">
                            <label>Nivel máximo:</label>
                            {isEditing ? (
                              <div className="value-editor">
                                <button 
                                  onClick={() => updateEditingValue(skill.id, 'maxlvl', Math.max(1, isEditing.maxlvl - 1))}
                                  onMouseDown={() => startIncrement(skill.id, 'maxlvl', 'down')}
                                  onMouseUp={() => stopIncrement(skill.id, 'maxlvl', 'down')}
                                  onMouseLeave={() => stopIncrement(skill.id, 'maxlvl', 'down')}
                                  disabled={isSaving}
                                  className="increment-button"
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
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button 
                                  onClick={() => updateEditingValue(skill.id, 'maxlvl', Math.min(99, isEditing.maxlvl + 1))}
                                  onMouseDown={() => startIncrement(skill.id, 'maxlvl', 'up')}
                                  onMouseUp={() => stopIncrement(skill.id, 'maxlvl', 'up')}
                                  onMouseLeave={() => stopIncrement(skill.id, 'maxlvl', 'up')}
                                  disabled={isSaving}
                                  className="increment-button"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <span className="skill-value">{skill.maxlvl}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="skill-actions">
                          {isEditing ? (
                            <>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveSkill(skill.id);
                                }}
                                disabled={isSaving}
                                className="save-button"
                              >
                                {isSaving ? 'Guardando...' : 'Guardar'}
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelEditing(skill.id);
                                }}
                                disabled={isSaving}
                                className="cancel-button"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(skill);
                              }}
                              className="edit-button"
                            >
                              Editar
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {isEditing && skill.skilldesc && (
                        <div className="skill-description">
                          {skill.skilldesc}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ⏮️
                </button>
                <button 
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ⏪
                </button>
                
                {getPageNumbers().map((pageNum, index) => (
                  pageNum === '...' ? (
                    <span key={index} className="pagination-dots">...</span>
                  ) : (
                    <button
                      key={index}
                      onClick={() => goToPage(pageNum as number)}
                      className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                    >
                      {pageNum}
                    </button>
                  )
                ))}
                
                <button 
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  ⏩
                </button>
                <button 
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  ⏭️
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Mod, CharStat } from '../types';
import { modService } from '../services/modService';

interface ModListProps {
  mods: Mod[];
  onRefresh: () => void;
}

const ModList: React.FC<ModListProps> = ({ mods, onRefresh }) => {
  const [selectedModId, setSelectedModId] = useState<number | null>(null);
  const [charStats, setCharStats] = useState<CharStat[]>([]);
  const [loading, setLoading] = useState(false);

  const handleViewCharStats = async (modId: number) => {
    if (selectedModId === modId) {
      setSelectedModId(null);
      setCharStats([]);
      return;
    }

    setLoading(true);
    try {
      const response = await modService.getCharStatsByModId(modId);
      if (response.success && response.data) {
        setCharStats(response.data);
        setSelectedModId(modId);
      }
    } catch (error) {
      console.error('Error cargando CharStats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mod-list">
      {mods.length === 0 ? (
        <div className="empty-state">
          <p>No hay mods en la base de datos</p>
          <button onClick={onRefresh} className="refresh-button">
            🔄 Actualizar
          </button>
        </div>
      ) : (
        <>
          <div className="mod-list-header">
            <span>Mods encontrados: {mods.length}</span>
            <button onClick={onRefresh} className="refresh-button">
              🔄 Actualizar
            </button>
          </div>
          
          <div className="mods-grid">
            {mods.map((mod) => (
              <div key={mod.id} className="mod-card">
                <div className="mod-header">
                  <h4>{mod.name}</h4>
                  <span className="mod-id">ID: {mod.id}</span>
                </div>
                
                <div className="mod-details">
                  <p><strong>Ruta:</strong> {mod.folderPath}</p>
                  <p><strong>Creado:</strong> {formatDate(mod.createdAt)}</p>
                  <p><strong>Actualizado:</strong> {formatDate(mod.updatedAt)}</p>
                </div>

                <div className="mod-actions">
                  <button
                    onClick={() => handleViewCharStats(mod.id)}
                    disabled={loading}
                    className={`view-stats-button ${selectedModId === mod.id ? 'active' : ''}`}
                  >
                    {loading && selectedModId === mod.id ? 
                      'Cargando...' : 
                      selectedModId === mod.id ? 'Ocultar CharStats' : 'Ver CharStats'
                    }
                  </button>
                </div>

                {selectedModId === mod.id && charStats.length > 0 && (
                  <div className="char-stats-section">
                    <h5>CharStats ({charStats.length} clases)</h5>
                    <div className="char-stats-grid">
                      {charStats.map((cs, index) => (
                        <div key={cs.id} className="char-stat-card">
                          <div className="char-stat-header">
                            <span className="class-name">{cs.class}</span>
                            {cs.expansion && <span className="expansion-badge">EXP</span>}
                          </div>
                          <div className="char-stat-attributes">
                            <div className="stat-row">
                              <span>STR: {cs.str}</span>
                              <span>DEX: {cs.dex}</span>
                              <span>INT: {cs.int}</span>
                              <span>VIT: {cs.vit}</span>
                            </div>
                            <div className="stat-row">
                              <span>HP: {cs.hpadd}</span>
                              <span>Mana Regen: {cs.ManaRegen}</span>
                              <span>Stamina: {cs.stamina}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ModList;

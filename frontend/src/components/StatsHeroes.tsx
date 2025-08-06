import React, { useState, useEffect } from 'react';
import { useModContext } from '../context/ModContext';
import { CharStat } from '../types';
import { modService } from '../services/modService';
import MainLayout from './MainLayout';
import HeroCarousel from './HeroCarousel';

const StatsHeroes: React.FC = () => {
  const { selectedMod } = useModContext();
  const [charStats, setCharStats] = useState<CharStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (selectedMod) {
      loadCharStats();
    }
  }, [selectedMod]);

  const loadCharStats = async () => {
    if (!selectedMod) return;

    setLoading(true);
    setError('');

    try {
      const response = await modService.getCharStatsByModId(selectedMod.id);
      if (response.success && response.data) {
        setCharStats(response.data);
      } else {
        setError(response.error || 'Error cargando CharStats');
      }
    } catch (error) {
      setError('Error de conexión');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCharStatUpdate = (updatedCharStat: CharStat) => {
    setCharStats(prev => prev.map(cs => 
      cs.id === updatedCharStat.id ? updatedCharStat : cs
    ));
  };

  if (!selectedMod) {
    return (
      <MainLayout title="Stats Héroes" subtitle="Gestiona las estadísticas de los personajes">
        <div className="empty-state">
          <div className="empty-icon">🏃‍♂️</div>
          <h3>No hay mod seleccionado</h3>
          <p>Selecciona un mod desde la sección "Selección de Mod" para ver las estadísticas de los héroes.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Stats Héroes" 
      subtitle={`Estadísticas de personajes del mod: ${selectedMod.name}`}
    >
      <div className="stats-heroes-container">
        {loading && (
          <div className="loading-state">
            <span className="spinner large"></span>
            <p>Cargando estadísticas...</p>
          </div>
        )}

        {error && (
          <div className="card error-card">
            <div className="card-content">
              <div className="error-message">
                <h4>❌ Error</h4>
                <p>{error}</p>
                <button onClick={loadCharStats} className="btn btn-primary">
                  🔄 Reintentar
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && charStats.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No hay estadísticas disponibles</h3>
            <p>No se encontraron CharStats para este mod. Asegúrate de que el archivo charstats.txt fue procesado correctamente.</p>
            <button onClick={loadCharStats} className="btn btn-primary">
              🔄 Recargar
            </button>
          </div>
        )}

        {!loading && charStats.length > 0 && (
          <>
            <div className="stats-summary">
              <div className="summary-card">
                <div className="summary-icon">🏆</div>
                <div className="summary-info">
                  <div className="summary-number">{charStats.length}</div>
                  <div className="summary-label">Total Héroes</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">⚡</div>
                <div className="summary-info">
                  <div className="summary-number">{charStats.filter(cs => cs.expansion).length}</div>
                  <div className="summary-label">Héroes Expansión</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">🛡️</div>
                <div className="summary-info">
                  <div className="summary-number">{charStats.filter(cs => !cs.expansion).length}</div>
                  <div className="summary-label">Héroes Clásicos</div>
                </div>
              </div>
            </div>

            <HeroCarousel 
              charStats={charStats}
              onCharStatUpdate={handleCharStatUpdate}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default StatsHeroes;

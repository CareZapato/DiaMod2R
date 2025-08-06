import React, { useState, useEffect } from 'react';
import { useModContext } from '../context/ModContext';
import { ProcessModResponse, Mod } from '../types';
import { modService } from '../services/modService';
import MainLayout from './MainLayout';

const ModSelection: React.FC = () => {
  const { setSelectedMod } = useModContext();
  const [folderPath, setFolderPath] = useState<string>('');
  const [processingResult, setProcessingResult] = useState<ProcessModResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [existingMods, setExistingMods] = useState<Mod[]>([]);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    checkBackendStatus();
    loadExistingMods();
  }, []);

  const checkBackendStatus = async () => {
    try {
      await modService.healthCheck();
      setBackendStatus('online');
    } catch (error) {
      setBackendStatus('offline');
      setError('Backend no disponible. Asegúrate de que el servidor esté ejecutándose en puerto 3001.');
    }
  };

  const loadExistingMods = async () => {
    try {
      const response = await modService.getAllMods();
      if (response.success && response.data) {
        setExistingMods(response.data);
      }
    } catch (error) {
      console.error('Error cargando mods existentes:', error);
    }
  };

  const handleFolderSelect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderPath.trim()) {
      setError('Por favor ingresa una ruta válida');
      return;
    }

    setLoading(true);
    setError('');
    setProcessingResult(null);

    try {
      const result = await modService.processMod(folderPath.trim());
      setProcessingResult(result);

      if (result.success && result.data) {
        // Establecer el mod como seleccionado
        setSelectedMod(result.data.mod);
        // Recargar la lista de mods
        await loadExistingMods();
      } else {
        setError(result.error || 'Error procesando el mod');
      }
    } catch (error) {
      setError('Error procesando el mod');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExistingMod = (mod: Mod) => {
    setSelectedMod(mod);
    setProcessingResult(null);
    setError('');
  };

  return (
    <MainLayout 
      title="Selección de Mod" 
      subtitle="Selecciona o procesa un mod de Diablo 2 para comenzar"
    >
      <div className="mod-selection-container">
        {/* Estado del Backend */}
        <div className={`status-card ${backendStatus}`}>
          <div className="status-indicator">
            <span className={`status-dot ${backendStatus}`}></span>
            <span className="status-text">
              {backendStatus === 'checking' ? 'Verificando conexión...' : 
               backendStatus === 'online' ? 'Conectado al servidor' : 'Sin conexión al servidor'}
            </span>
          </div>
        </div>

        {/* Formulario para nueva carpeta */}
        <div className="card">
          <div className="card-header">
            <h3>📁 Procesar Nueva Carpeta</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleFolderSelect} className="folder-form">
              <div className="form-group">
                <label htmlFor="folderPath">Ruta de la carpeta del mod:</label>
                <input
                  type="text"
                  id="folderPath"
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  placeholder="Ej: C:\MiMod o D:\Diablo2\Mods\MiMod"
                  className="form-input"
                  disabled={loading || backendStatus !== 'online'}
                />
              </div>
              <button
                type="submit"
                disabled={loading || backendStatus !== 'online' || !folderPath.trim()}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Procesando...
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    Buscar y Procesar Mod
                  </>
                )}
              </button>
            </form>

            {/* Instrucciones */}
            <div className="instructions">
              <h4>📋 Estructura Requerida:</h4>
              <div className="structure-example">
                <pre>{`MiMod/
  └── MiMod.mpq/
      └── data/
          └── global/
              └── excel/
                  ├── charstats.txt  ✅ Requerido
                  ├── skills.txt
                  ├── runes.txt
                  └── otros archivos...`}</pre>
              </div>
              <ul className="requirements-list">
                <li>✅ La carpeta debe contener una subcarpeta con el mismo nombre + ".mpq"</li>
                <li>✅ Debe existir la ruta: data/global/excel</li>
                <li>✅ Debe contener el archivo "charstats.txt"</li>
                <li>✅ Otros archivos .txt serán detectados automáticamente</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Resultados del procesamiento */}
        {error && (
          <div className="card error-card">
            <div className="card-content">
              <div className="error-message">
                <h4>❌ Error</h4>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {processingResult && processingResult.success && (
          <div className="card success-card">
            <div className="card-content">
              <div className="success-message">
                <h4>✅ Mod Procesado Exitosamente</h4>
                <p>{processingResult.message}</p>
                {processingResult.data && (
                  <div className="processing-details">
                    <div className="detail-item">
                      <strong>Mod:</strong> {processingResult.data.mod.name}
                    </div>
                    <div className="detail-item">
                      <strong>Archivos encontrados:</strong> {processingResult.data.filesFound}
                    </div>
                    <div className="detail-item">
                      <strong>CharStats procesados:</strong> {processingResult.data.charStatsProcessed}
                    </div>
                    <div className="detail-item">
                      <strong>Skills procesadas:</strong> {processingResult.data.skillsProcessed || 0}
                    </div>
                  </div>
                )}
              </div>

              {processingResult.data && processingResult.data.files.length > 0 && (
                <div className="files-section">
                  <h4>📄 Archivos .txt encontrados:</h4>
                  <div className="files-grid">
                    {processingResult.data.files.map((fileName, index) => (
                      <div 
                        key={index} 
                        className={`file-badge ${
                          fileName.toLowerCase() === 'charstats.txt' || fileName.toLowerCase() === 'skills.txt' 
                            ? 'processed' : ''
                        }`}
                      >
                        <span className="file-icon">📄</span>
                        <span className="file-name">{fileName}</span>
                        {fileName.toLowerCase() === 'charstats.txt' && (
                          <span className="processed-indicator">✅ CharStats</span>
                        )}
                        {fileName.toLowerCase() === 'skills.txt' && (
                          <span className="processed-indicator">✅ Skills</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mods existentes */}
        {existingMods.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3>📚 Mods en la Base de Datos</h3>
              <button onClick={loadExistingMods} className="btn btn-secondary btn-small">
                🔄 Actualizar
              </button>
            </div>
            <div className="card-content">
              <div className="mods-list">
                {existingMods.map((mod) => (
                  <div key={mod.id} className="mod-item">
                    <div className="mod-info">
                      <div className="mod-name">{mod.name}</div>
                      <div className="mod-path">{mod.folderPath}</div>
                      <div className="mod-date">
                        Creado: {new Date(mod.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectExistingMod(mod)}
                      className="btn btn-outline"
                    >
                      Seleccionar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ModSelection;

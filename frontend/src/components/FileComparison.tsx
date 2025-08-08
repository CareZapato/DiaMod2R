import React, { useState, useEffect } from 'react';
import { useModContext } from '../context/ModContext';
import { fileService } from '../services/fileService';
import './FileComparison.css';

interface FileData {
  headers: string[];
  rows: Array<{ [key: string]: string }>;
}

interface ComparisonData {
  modData: FileData;
  baseData: FileData;
  differences: { [key: string]: { row: number; col: string; isHigher: boolean } };
}

const FileComparison: React.FC = () => {
  const { selectedMod } = useModContext();
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modifiedData, setModifiedData] = useState<FileData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [availableFiles, setAvailableFiles] = useState<Array<{ value: string; label: string }>>([]);

  // Load available files when mod is selected
  useEffect(() => {
    if (selectedMod) {
      loadAvailableFiles();
    } else {
      setAvailableFiles([]);
      setSelectedFile('');
      setComparisonData(null);
    }
  }, [selectedMod]);

  const loadAvailableFiles = async () => {
    if (!selectedMod) return;

    try {
      const response = await fileService.getAvailableFiles(selectedMod.name);
      if (response.success && response.data) {
        setAvailableFiles(response.data);
      } else {
        // If no files found via API, fall back to default list
        setAvailableFiles([
          { value: 'charstats', label: 'Character Stats (charstats.txt)' },
          { value: 'skills', label: 'Skills (skills.txt)' },
          { value: 'itemtypes', label: 'Item Types (itemtypes.txt)' },
          { value: 'weapons', label: 'Weapons (weapons.txt)' },
          { value: 'armor', label: 'Armor (armor.txt)' },
          { value: 'misc', label: 'Miscellaneous (misc.txt)' }
        ]);
      }
    } catch (err) {
      console.error('Error loading available files:', err);
      // Fall back to default list
      setAvailableFiles([
        { value: 'charstats', label: 'Character Stats (charstats.txt)' },
        { value: 'skills', label: 'Skills (skills.txt)' },
        { value: 'itemtypes', label: 'Item Types (itemtypes.txt)' },
        { value: 'weapons', label: 'Weapons (weapons.txt)' },
        { value: 'armor', label: 'Armor (armor.txt)' },
        { value: 'misc', label: 'Miscellaneous (misc.txt)' }
      ]);
    }
  };

  useEffect(() => {
    if (selectedFile && selectedMod) {
      loadFileComparison();
    }
  }, [selectedFile, selectedMod]);

  const loadFileComparison = async () => {
    if (!selectedFile || !selectedMod) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fileService.getFileComparison(selectedFile, selectedMod.name);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to load file comparison');
      }

      setComparisonData(response.data!);
      setModifiedData(JSON.parse(JSON.stringify(response.data!.modData))); // Deep copy
      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCellChange = (rowIndex: number, column: string, value: string) => {
    if (!modifiedData) return;

    const newData = { ...modifiedData };
    newData.rows[rowIndex][column] = value;
    setModifiedData(newData);
    setHasChanges(true);
  };

  const saveChanges = async () => {
    if (!modifiedData || !selectedFile || !selectedMod) return;

    setLoading(true);
    try {
      const response = await fileService.saveFileChanges(selectedFile, selectedMod.name, modifiedData);

      if (!response.success) {
        throw new Error(response.error || 'Failed to save changes');
      }

      setHasChanges(false);
      await loadFileComparison(); // Reload to get updated comparison
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const resetChanges = () => {
    if (comparisonData) {
      setModifiedData(JSON.parse(JSON.stringify(comparisonData.modData)));
      setHasChanges(false);
    }
  };

  const getCellClassName = (rowIndex: number, column: string, isModTable: boolean) => {
    if (!comparisonData) return '';
    
    const key = `${rowIndex}-${column}`;
    const diff = comparisonData.differences[key];
    
    if (!diff) return '';

    if (isModTable) {
      return diff.isHigher ? 'cell-higher' : 'cell-lower';
    } else {
      return 'cell-different';
    }
  };

  const renderTable = (data: FileData, isModTable: boolean, isEditable: boolean = false) => {
    if (!data || !data.headers || !data.rows) return null;

    return (
      <div className="comparison-table-container">
        <table className="comparison-table">
          <thead>
            <tr>
              {data.headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {data.headers.map((header, colIndex) => (
                  <td 
                    key={colIndex}
                    className={getCellClassName(rowIndex, header, isModTable)}
                  >
                    {isEditable ? (
                      <input
                        type="text"
                        value={row[header] || ''}
                        onChange={(e) => handleCellChange(rowIndex, header, e.target.value)}
                        className="cell-input"
                      />
                    ) : (
                      <span className={!isModTable && getCellClassName(rowIndex, header, false) ? 'bold-text' : ''}>
                        {row[header] || ''}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (!selectedMod) {
    return (
      <div className="file-comparison">
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>Comparación de Archivos</h3>
          <p>Selecciona un mod para comenzar a comparar archivos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-comparison">
      <div className="comparison-header">
        <h2>Comparación de Archivos Base vs Mod</h2>
        <p className="subtitle">
          Compara y edita archivos del mod contra los archivos base del juego
        </p>
      </div>

      <div className="comparison-controls">
        <div className="file-selector">
          <label htmlFor="file-select">Seleccionar Archivo:</label>
          <select
            id="file-select"
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="form-input"
          >
            <option value="">-- Selecciona un archivo --</option>
            {availableFiles.map((file) => (
              <option key={file.value} value={file.value}>
                {file.label}
              </option>
            ))}
          </select>
        </div>

        {hasChanges && (
          <div className="action-buttons">
            <button
              onClick={saveChanges}
              disabled={loading}
              className="btn btn-primary save-button"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
            <button
              onClick={resetChanges}
              disabled={loading}
              className="btn btn-secondary"
            >
              Descartar Cambios
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <h4>Error</h4>
          <p>{error}</p>
        </div>
      )}

      {loading && !comparisonData && (
        <div className="loading-state">
          <div className="spinner large"></div>
          <p>Cargando comparación de archivos...</p>
        </div>
      )}

      {comparisonData && modifiedData && (
        <div className="comparison-content">
          <div className="comparison-section">
            <div className="section-header mod-section">
              <h3>📝 Archivo del Mod (Editable)</h3>
              <div className="legend">
                <span className="legend-item">
                  <span className="legend-color higher"></span>
                  Valor mayor que base
                </span>
                <span className="legend-item">
                  <span className="legend-color lower"></span>
                  Valor menor que base
                </span>
              </div>
            </div>
            {renderTable(modifiedData, true, true)}
          </div>

          <div className="comparison-section">
            <div className="section-header base-section">
              <h3>🎮 Archivo Base del Juego</h3>
              <div className="legend">
                <span className="legend-item">
                  <span className="legend-text bold-text">Texto en negrita</span>
                  = Diferente al mod
                </span>
              </div>
            </div>
            {renderTable(comparisonData.baseData, false, false)}
          </div>
        </div>
      )}

      {selectedFile && !loading && !comparisonData && !error && (
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <h3>No se encontraron datos</h3>
          <p>No se pudieron cargar los datos de comparación para este archivo</p>
        </div>
      )}
    </div>
  );
};

export default FileComparison;

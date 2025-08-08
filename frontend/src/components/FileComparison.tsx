import React, { useState, useEffect, useRef } from 'react';
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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [loadingSteps, setLoadingSteps] = useState<Array<{ id: string; label: string; status: 'pending' | 'current' | 'completed' }>>([]);

  // Refs for synchronized scrolling
  const modTableRef = useRef<HTMLDivElement>(null);
  const baseTableRef = useRef<HTMLDivElement>(null);

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
      // Clear previous state when changing files
      setComparisonData(null);
      setModifiedData(null);
      setError(null);
      setHasChanges(false);
      setLoadingProgress(0);
      setLoadingSteps([]);
      setLoadingStep('');
      
      loadFileComparison();
    } else {
      // Clear state when no file is selected
      setComparisonData(null);
      setModifiedData(null);
      setError(null);
      setHasChanges(false);
      setLoading(false);
      setLoadingProgress(0);
      setLoadingSteps([]);
      setLoadingStep('');
    }
  }, [selectedFile, selectedMod]);

  const loadFileComparison = async () => {
    if (!selectedFile || !selectedMod) return;

    setLoading(true);
    setError(null);
    setLoadingProgress(0);
    setLoadingStep('Iniciando carga...');
    setComparisonData(null); // Clear previous data

    // Initialize loading steps
    const steps = [
      { id: 'validate', label: 'Validando parámetros', status: 'current' as const },
      { id: 'fetch-mod', label: 'Obteniendo datos del mod', status: 'pending' as const },
      { id: 'fetch-base', label: 'Cargando archivo base', status: 'pending' as const },
      { id: 'compare', label: 'Comparando datos', status: 'pending' as const },
      { id: 'render', label: 'Preparando visualización', status: 'pending' as const }
    ];
    setLoadingSteps([...steps]); // Force new array reference

    try {
      // Step 1: Validate
      setLoadingProgress(10);
      setLoadingStep('Validando parámetros...');
      await new Promise(resolve => setTimeout(resolve, 200)); // Small delay for UX
      
      const updatedSteps1 = steps.map(step => 
        step.id === 'validate' ? { ...step, status: 'completed' as const } :
        step.id === 'fetch-mod' ? { ...step, status: 'current' as const } : step
      );
      setLoadingSteps([...updatedSteps1]);

      // Step 2: Fetch mod data
      setLoadingProgress(25);
      setLoadingStep('Obteniendo datos del mod desde la base de datos...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updatedSteps2 = steps.map(step => 
        step.id === 'validate' ? { ...step, status: 'completed' as const } :
        step.id === 'fetch-mod' ? { ...step, status: 'completed' as const } :
        step.id === 'fetch-base' ? { ...step, status: 'current' as const } : step
      );
      setLoadingSteps([...updatedSteps2]);

      // Step 3: Fetch base file
      setLoadingProgress(50);
      setLoadingStep('Cargando y parseando archivo base del juego...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const updatedSteps3 = steps.map(step => 
        step.id === 'validate' || step.id === 'fetch-mod' ? { ...step, status: 'completed' as const } :
        step.id === 'fetch-base' ? { ...step, status: 'completed' as const } :
        step.id === 'compare' ? { ...step, status: 'current' as const } : step
      );
      setLoadingSteps([...updatedSteps3]);

      // Step 4: Make API call
      setLoadingProgress(75);
      setLoadingStep('Realizando comparación de datos...');
      
      const response = await fileService.getFileComparison(selectedFile, selectedMod.name);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to load file comparison');
      }

      const updatedSteps4 = steps.map(step => 
        ['validate', 'fetch-mod', 'fetch-base', 'compare'].includes(step.id) ? { ...step, status: 'completed' as const } :
        step.id === 'render' ? { ...step, status: 'current' as const } : step
      );
      setLoadingSteps([...updatedSteps4]);

      // Step 5: Process and render
      setLoadingProgress(90);
      setLoadingStep('Preparando visualización...');
      await new Promise(resolve => setTimeout(resolve, 200));

      setComparisonData(response.data!);
      setModifiedData(JSON.parse(JSON.stringify(response.data!.modData))); // Deep copy
      setHasChanges(false);

      // Complete
      setLoadingProgress(100);
      setLoadingStep('¡Completado!');
      
      const finalSteps = steps.map(step => ({ ...step, status: 'completed' as const }));
      setLoadingSteps([...finalSteps]);

      // Hide loading immediately when data is ready
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
        setLoadingSteps([]);
        setLoadingStep('');
      }, 100); // Very short delay to show completion

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setLoading(false);
      setLoadingProgress(0);
      setLoadingSteps([]);
      setLoadingStep('');
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

  // Synchronized scrolling handlers
  const handleModTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (baseTableRef.current && modTableRef.current) {
      baseTableRef.current.scrollLeft = e.currentTarget.scrollLeft;
      baseTableRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleBaseTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (modTableRef.current && baseTableRef.current) {
      modTableRef.current.scrollLeft = e.currentTarget.scrollLeft;
      modTableRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const getCellClassName = (rowIndex: number, column: string, isModTable: boolean) => {
    if (!comparisonData) return '';
    
    const key = `${rowIndex}-${column}`;
    const diff = comparisonData.differences[key];
    
    if (!diff) return '';

    if (isModTable) {
      // For mod table: green if higher, red if lower, blue if different non-numeric
      if (typeof diff.isHigher === 'boolean') {
        return diff.isHigher ? 'cell-higher' : 'cell-lower';
      } else {
        return 'cell-different';
      }
    } else {
      // For base table: just bold and black for different values
      return 'cell-base-different';
    }
  };

  const renderTable = (data: FileData, isModTable: boolean, isEditable: boolean = false) => {
    if (!data || !data.headers || !data.rows) return null;

    const tableRef = isModTable ? modTableRef : baseTableRef;
    const scrollHandler = isModTable ? handleModTableScroll : handleBaseTableScroll;

    return (
      <div className="table-section">
        <div className={`table-header ${isModTable ? 'mod-table' : 'base-table'}`}>
          {isModTable ? '📊 Datos del Mod (Base de Datos)' : '📋 Datos Base del Juego'}
        </div>
        <div 
          className="data-table-container"
          ref={tableRef}
          onScroll={scrollHandler}
        >
          <table className="data-table">
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
                        row[header] || ''
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
          <div className="spinner"></div>
          <h3>Cargando comparación de archivos</h3>
          <p>{loadingStep}</p>
          
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {loadingProgress}% completado
          </div>

          {loadingSteps.length > 0 && (
            <div className="loading-steps">
              {loadingSteps.map((step) => (
                <div key={step.id} className={`loading-step ${step.status}`}>
                  <div className="loading-step-icon">
                    {step.status === 'completed' ? '✓' : 
                     step.status === 'current' ? '●' : '○'}
                  </div>
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {comparisonData && (
        <div className="tables-container">
          <div className="synchronized-tables">
            {/* Mod Data Table */}
            {renderTable(comparisonData.modData, true, false)}
            
            {/* Visual separator */}
            <div className="table-separator"></div>
            
            {/* Base Data Table */}
            {renderTable(comparisonData.baseData, false, false)}
          </div>
        </div>
      )}

      {selectedFile && !loading && !comparisonData && !error && (
        <div className="no-data-state">
          <h3>No se encontraron datos</h3>
          <p>No se pudieron cargar los datos de comparación para este archivo</p>
        </div>
      )}
    </div>
  );
};

export default FileComparison;

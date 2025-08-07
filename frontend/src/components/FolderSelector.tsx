import React, { useState } from 'react';

interface FolderSelectorProps {
  onFolderSelect: (folderPath: string) => void;
  selectedFolder: string;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({ onFolderSelect, selectedFolder }) => {
  const [inputPath, setInputPath] = useState(selectedFolder);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPath.trim()) {
      onFolderSelect(inputPath.trim());
    }
  };

  const handleBrowseFolder = async () => {
    try {
      // @ts-ignore - showDirectoryPicker is not yet in TypeScript definitions
      if ('showDirectoryPicker' in window) {
        // @ts-ignore
        const directoryHandle = await window.showDirectoryPicker();
        // Para obtener la ruta real necesitamos usar File System Access API
        // Por ahora, usaremos el nombre del directorio
        setInputPath(directoryHandle.name);
        onFolderSelect(directoryHandle.name);
      } else {
        // Fallback para navegadores que no soportan File System Access API
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.style.display = 'none';
        
        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            // Obtener la ruta del primer archivo para extraer la carpeta
            const firstFile = files[0];
            const pathParts = firstFile.webkitRelativePath.split('/');
            const folderPath = pathParts[0];
            setInputPath(folderPath);
            onFolderSelect(folderPath);
          }
        };
        
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
      }
    } catch (error) {
      console.error('Error seleccionando carpeta:', error);
      alert('Error al seleccionar carpeta. Por favor, ingresa la ruta manualmente.');
    }
  };

  return (
    <div className="folder-selector">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="folderPath">
            Ruta de la carpeta del mod:
          </label>
          <div className="input-with-buttons">
            <input
              type="text"
              id="folderPath"
              value={inputPath}
              onChange={(e) => setInputPath(e.target.value)}
              placeholder="Ej: C:\MiMod"
              className="folder-input"
            />
            <button 
              type="button"
              onClick={handleBrowseFolder}
              className="browse-button"
              title="Navegar carpetas"
            >
              📁 Navegar
            </button>
            <button type="submit" className="select-button">
              Seleccionar
            </button>
          </div>
        </div>
      </form>
      
      {selectedFolder && (
        <div className="selected-folder">
          <strong>Carpeta seleccionada:</strong> {selectedFolder}
        </div>
      )}
      
      <div className="folder-help">
        <h4>Instrucciones:</h4>
        <ol>
          <li>La carpeta debe contener una subcarpeta con el mismo nombre + ".mpq"</li>
          <li>Dentro de esa subcarpeta debe existir la ruta: data/global/excel</li>
          <li>En la carpeta excel deben estar los archivos .txt del mod</li>
          <li>Debe existir específicamente el archivo "charstats.txt" (obligatorio)</li>
          <li>Debe existir específicamente el archivo "skills.txt" (obligatorio)</li>
        </ol>
        <p><strong>Ejemplo de estructura:</strong></p>
        <pre>
{`MiMod/
  └── MiMod.mpq/
      └── data/
          └── global/
              └── excel/
                  ├── charstats.txt  ✅ Requerido
                  ├── skills.txt     ✅ Requerido
                  └── otros archivos...`}
        </pre>
      </div>
    </div>
  );
};

export default FolderSelector;

import React from 'react';

interface FileListProps {
  files: string[];
}

const FileList: React.FC<FileListProps> = ({ files }) => {
  if (!files || files.length === 0) {
    return (
      <div className="file-list">
        <h3>Archivos encontrados</h3>
        <p>No se encontraron archivos .txt</p>
      </div>
    );
  }

  return (
    <div className="file-list">
      <h3>Archivos .txt encontrados ({files.length})</h3>
      <div className="files-grid">
        {files.map((fileName, index) => (
          <div key={index} className={`file-item ${fileName.toLowerCase() === 'charstats.txt' ? 'highlight' : ''}`}>
            <span className="file-icon">📄</span>
            <span className="file-name">{fileName}</span>
            {fileName.toLowerCase() === 'charstats.txt' && (
              <span className="processed-badge">✅ Procesado</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;

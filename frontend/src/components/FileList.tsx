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
        {files.map((fileName, index) => {
          const isCharStats = fileName.toLowerCase() === 'charstats.txt';
          const isSkills = fileName.toLowerCase() === 'skills.txt';
          const isRequired = isCharStats || isSkills;
          
          return (
            <div key={index} className={`file-item ${isRequired ? 'highlight' : ''}`}>
              <span className="file-icon">📄</span>
              <span className="file-name">{fileName}</span>
              {isCharStats && (
                <span className="processed-badge">✅ CharStats</span>
              )}
              {isSkills && (
                <span className="processed-badge">✅ Skills</span>
              )}
              {!isRequired && fileName.toLowerCase().endsWith('.txt') && (
                <span className="optional-badge">📋 Opcional</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FileList;

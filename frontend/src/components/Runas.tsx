import React from 'react';
import { useModContext } from '../context/ModContext';
import MainLayout from './MainLayout';

const Runas: React.FC = () => {
  const { selectedMod } = useModContext();

  if (!selectedMod) {
    return (
      <MainLayout title="Runas" subtitle="Gestiona runas y runewords">
        <div className="empty-state">
          <div className="empty-icon">🗿</div>
          <h3>No hay mod seleccionado</h3>
          <p>Selecciona un mod desde la sección "Selección de Mod" para gestionar las runas.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Runas" 
      subtitle={`Gestión de runas del mod: ${selectedMod.name}`}
    >
      <div className="coming-soon">
        <div className="coming-soon-icon">🗿</div>
        <h3>Próximamente</h3>
        <p>La gestión de runas estará disponible en una próxima versión.</p>
        <div className="features-preview">
          <h4>Funcionalidades planeadas:</h4>
          <ul>
            <li>✨ Editor de runas individuales</li>
            <li>✨ Creación y edición de runewords</li>
            <li>✨ Configuración de efectos y propiedades</li>
            <li>✨ Importar/exportar configuraciones</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default Runas;

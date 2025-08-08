import React from 'react';
import './Changelog.css';

interface ChangelogProps {}

const Changelog: React.FC<ChangelogProps> = () => {
  const versions = [
    {
      version: '0.3.0',
      date: '2025-08-08',
      title: 'Menús Avanzados y Comparación de Archivos',
      status: 'current',
      changes: {
        added: [
          'Menú con subcategorías y navegación mejorada',
          'Plantillas para cambios globales en habilidades y estadísticas',
          'Sección de tablas comparativas para archivos de configuración',
          'Sistema de comparación lado a lado (mod vs base)',
          'Indicadores visuales de diferencias en valores',
          'Scrolling sincronizado entre tablas',
          'Barras de progreso para carga de archivos',
          'Mejoras significativas en UX y navegación'
        ],
        improved: [
          'Arquitectura del menú lateral con soporte para subcategorías',
          'Gestión de estado global mejorada',
          'Sistema de validación de archivos',
          'Interfaz responsive y adaptativa',
          'Rendimiento general de la aplicación'
        ],
        technical: [
          'Implementación de parsers especializados para archivos del juego',
          'Sistema de sincronización de filas basado en claves primarias',
          'API RESTful expandida para comparación de archivos',
          'Mejoras en el manejo de errores y estados de carga',
          'Optimización de consultas a base de datos'
        ]
      }
    },
    {
      version: '0.2.0',
      date: '2025-08-07',
      title: 'Sistema Completo de Habilidades',
      status: 'released',
      changes: {
        added: [
          'Sistema completo de gestión de habilidades (skills.txt)',
          'Vista dual: tarjetas compactas y lista horizontal',
          'Editor inteligente con click-to-edit',
          'Botones de incremento con repetición rápida',
          'Sistema de paginación inteligente',
          'Filtrado avanzado por mod, clase y términos de búsqueda',
          'Exportación a archivos skillsmod.txt',
          'Seguimiento de cambios con valores antes/después'
        ],
        improved: [
          'Validación en tiempo real con límites min/max',
          'Diseño responsive que se adapta al tamaño de pantalla',
          'Estados visuales de edición con bordes codificados por color',
          'Transiciones suaves entre modos de vista'
        ],
        technical: [
          'Entidad Skill con 293 columnas de skills.txt',
          'Relaciones de clave foránea con mods',
          'Procesamiento por lotes para grandes conjuntos de datos',
          'Optimización de parámetros PostgreSQL',
          'Parser completo de skills.txt con seguimiento de progreso'
        ]
      }
    },
    {
      version: '0.1.0',
      date: '2025-08-06',
      title: 'Lanzamiento Inicial',
      status: 'released',
      changes: {
        added: [
          'Sistema base de gestión de estadísticas de personajes',
          'Integración con PostgreSQL',
          'Interfaz web React con TypeScript',
          'Carrusel de héroes para navegación',
          'Editor de estadísticas con controles +/-',
          'Sistema de cambios visuales en tiempo real',
          'Guardado individual por héroe',
          'Detección automática de expansión vs clásico'
        ],
        technical: [
          'Backend Node.js + Express + TypeORM',
          'Frontend React + TypeScript + Axios',
          'Base de datos PostgreSQL con modelos Mod y CharStat',
          'API RESTful para gestión de mods y estadísticas',
          'Sistema de archivos para lectura de charstats.txt'
        ]
      }
    }
  ];

  const futureVersions = [
    {
      version: '0.4.0',
      title: 'Edición y Testing Avanzado',
      eta: 'Q4 2025',
      features: [
        'Edición de archivos en el apartado comparativo',
        'Testing de propuestas en mejoras globales',
        'Funcionalidad para reemplazar archivos mod por originales',
        'Sección completa de runas y runewords',
        'Sistema de backup automático',
        'Validación avanzada de cambios'
      ]
    },
    {
      version: '0.5.0',
      title: 'Gestión Completa de Contenido',
      eta: 'Q1 2026',
      features: [
        'Gestión de items y equipamiento (armor.txt, weapons.txt)',
        'Editor de monstruos y niveles',
        'Sistema de tesoros y drops',
        'Import/Export de configuraciones completas',
        'Historial de cambios y versionado'
      ]
    },
    {
      version: '1.0.0',
      title: 'Plataforma Completa',
      eta: 'Q2 2026',
      features: [
        'Soporte para múltiples idiomas',
        'Sistema de plugins para extensiones',
        'Interfaz de scripting avanzada',
        'Colaboración multi-usuario',
        'Comparador de mods side-by-side completo'
      ]
    }
  ];

  return (
    <div className="changelog">
      <div className="changelog-header">
        <h2>📝 Historial de Versiones</h2>
        <p>Seguimiento completo de características, mejoras y correcciones</p>
      </div>

      <div className="changelog-content">
        {/* Versiones Lanzadas */}
        <section className="released-versions">
          <h3>🚀 Versiones Lanzadas</h3>
          {versions.map((version) => (
            <div 
              key={version.version} 
              className={`version-card ${version.status === 'current' ? 'current-version' : ''}`}
            >
              <div className="version-header">
                <div className="version-info">
                  <h4>
                    v{version.version}
                    {version.status === 'current' && <span className="current-badge">ACTUAL</span>}
                  </h4>
                  <span className="version-date">{version.date}</span>
                </div>
                <h5 className="version-title">{version.title}</h5>
              </div>

              <div className="version-changes">
                {version.changes.added && (
                  <div className="change-section">
                    <h6>✨ Nuevas Características</h6>
                    <ul>
                      {version.changes.added.map((change, index) => (
                        <li key={index}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {version.changes.improved && (
                  <div className="change-section">
                    <h6>🔧 Mejoras</h6>
                    <ul>
                      {version.changes.improved.map((change, index) => (
                        <li key={index}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {version.changes.technical && (
                  <div className="change-section">
                    <h6>⚙️ Cambios Técnicos</h6>
                    <ul>
                      {version.changes.technical.map((change, index) => (
                        <li key={index}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Roadmap Futuro */}
        <section className="future-versions">
          <h3>🗺️ Roadmap Futuro</h3>
          {futureVersions.map((version) => (
            <div key={version.version} className="future-version-card">
              <div className="future-version-header">
                <h4>v{version.version}</h4>
                <span className="eta-badge">{version.eta}</span>
              </div>
              <h5 className="future-version-title">{version.title}</h5>
              <div className="future-features">
                <ul>
                  {version.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>

        {/* Información Adicional */}
        <section className="changelog-footer">
          <div className="version-info-card">
            <h4>🔄 Política de Versionado</h4>
            <p>
              DiaMod2R sigue el estándar de <strong>Versionado Semántico</strong>:
            </p>
            <ul>
              <li><strong>MAJOR</strong> (X.y.z): Cambios incompatibles en la API</li>
              <li><strong>MINOR</strong> (x.Y.z): Nuevas funcionalidades compatibles</li>
              <li><strong>PATCH</strong> (x.y.Z): Correcciones de errores compatibles</li>
            </ul>
          </div>

          <div className="feedback-card">
            <h4>💬 Feedback y Sugerencias</h4>
            <p>
              ¿Tienes ideas para nuevas características o encontraste algún problema? 
              ¡Tu feedback es valioso para el desarrollo continuo de DiaMod2R!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Changelog;

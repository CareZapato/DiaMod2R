# DiaMod2R - Diablo 2 Mod Character Stats Manager

![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.9.2-blue.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-12%2B-blue.svg)

Aplicación web para gestionar y editar estadísticas de personajes en mods de Diablo 2, construida con Node.js/TypeScript backend y React/TypeScript frontend.

## � Descripción

DiaMod2R es una herramienta especializada que permite a los desarrolladores de mods de Diablo 2 gestionar y editar las estadísticas de personajes de manera intuitiva y eficiente. La aplicación lee archivos `charstats.txt` de mods, los almacena en una base de datos PostgreSQL, y proporciona una interfaz web moderna para editarlos.

### 🎯 Características Principales

- **📁 Exploración de Mods**: Navega y selecciona carpetas de mods con validación automática de estructura
- **📊 Carrusel de Héroes**: Interfaz tipo carrusel para navegar entre clases de personajes
- **✏️ Editor Avanzado**: Edita estadísticas con controles +/- e inputs directos
- **🎨 Indicadores Visuales**: Cambios mostrados en tiempo real con colores (verde/rojo)
- **💾 Guardado Individual**: Guarda cambios por héroe de forma independiente
- **🔄 Detección de Expansión**: Reconoce automáticamente personajes clásicos vs expansión
- **🖥️ Interfaz Backoffice**: Diseño profesional con sidebar de navegación

### 🏗️ Arquitectura

```
DiaMod2R/
├── backend/           # API REST Node.js + Express + TypeORM
│   ├── src/
│   │   ├── models/    # Entidades de base de datos (Mod, CharStat)
│   │   ├── services/  # Lógica de negocio (FileService, ModService)
│   │   ├── routes/    # Endpoints REST API
│   │   └── repositories/ # Acceso a datos
├── frontend/          # React + TypeScript SPA
│   ├── src/
│   │   ├── components/ # Componentes React (Carrusel, Editor, etc.)
│   │   ├── context/   # Context API para estado global
│   │   ├── services/  # Cliente HTTP (Axios)
│   │   └── types/     # Definiciones TypeScript
└── package.json       # Scripts de gestión del monorepo
```

## 🚀 Inicio Rápido

### Pre-requisitos

- **Node.js** 18+ 
- **PostgreSQL** 12+
- **NPM** 8+

### Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/tu-usuario/DiaMod2R.git
cd DiaMod2R
```

2. **Instalar todas las dependencias:**
```bash
npm run install:all
```

3. **Configurar base de datos PostgreSQL:**
   - Crear base de datos: `diamod2BD`
   - Usuario: `postgres`
   - Contraseña: `123456`
   - Puerto: `5432`

4. **Ejecutar la aplicación:**
```bash
npm start
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 📖 Comandos Disponibles

### 🔄 Comandos principales
- `npm start` - Ejecuta frontend y backend simultáneamente
- `npm run dev` - Ejecuta en modo desarrollo con recarga automática
- `npm run build` - Compila frontend y backend
- `npm run install:all` - Instala dependencias en todos los proyectos

### 🎯 Comandos específicos
- `npm run start:backend` - Solo backend (puerto 3001)
- `npm run start:frontend` - Solo frontend (puerto 3000)
- `npm run build:backend` - Solo compilar backend
- `npm run build:frontend` - Solo compilar frontend
- `npm run dev:backend` - Backend con nodemon
- `npm run dev:frontend` - Frontend en modo desarrollo

## 🗂️ Estructura de Mod Soportada

La aplicación espera que los mods sigan esta estructura:

```
MiMod/
└── MiMod.mpq/
    └── data/
        └── global/
            └── excel/
                ├── charstats.txt     # Archivo principal requerido
                ├── skills.txt
                ├── armor.txt
                └── otros archivos...
```

### 📄 Formato charstats.txt

El archivo debe contener:
- **Header**: Primera línea con nombres de columnas separadas por tabs
- **Datos de héroes**: Una línea por clase de personaje
- **Línea "Expansion"**: Separa personajes clásicos de expansión
- **Personajes de expansión**: Después de la línea "Expansion"

## �️ Tecnologías Utilizadas

### Backend
- **Node.js** + **Express.js** - Servidor web
- **TypeScript** - Tipado estático
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos relacional
- **CORS** - Gestión de peticiones cross-origin

### Frontend
- **React 18** - Librería de UI
- **TypeScript** - Tipado estático
- **Axios** - Cliente HTTP
- **CSS Modules** - Estilos encapsulados
- **Context API** - Gestión de estado

### DevOps
- **Concurrently** - Ejecución paralela de scripts
- **Nodemon** - Recarga automática en desarrollo
- **TSC** - Compilador TypeScript

## 🎮 Flujo de Uso

1. **Seleccionar Mod**: Usa el navegador de carpetas o escribe la ruta manualmente
2. **Procesar Archivo**: La aplicación lee y valida `charstats.txt`
3. **Navegar Héroes**: Usa el carrusel para moverte entre personajes
4. **Editar Stats**: Modifica valores con inputs o botones +/-
5. **Ver Cambios**: Observa diferencias en tiempo real (verde/rojo)
6. **Guardar**: Confirma cambios individualmente por héroe

## 🔧 Funcionalidades Implementadas (v0.0.1)

- ✅ Lectura y parseo de archivos charstats.txt
- ✅ Detección automática de estructura de mod
- ✅ Distinción entre personajes clásicos y de expansión
- ✅ Interfaz de carrusel para navegación de héroes
- ✅ Editor de estadísticas con controles avanzados
- ✅ Indicadores visuales de cambios pendientes
- ✅ Sistema de guardado por héroe individual
- ✅ API REST completa para gestión de datos
- ✅ Interfaz backoffice profesional
- ✅ Navegador de carpetas integrado

## � Roadmap Futuro

- 🔄 Editor de skills y habilidades
- 🔄 Gestión de items y equipamiento
- 🔄 Import/Export de configuraciones
- 🔄 Validación avanzada de datos
- 🔄 Historial de cambios
- 🔄 Backup automático
- � Soporte para múltiples idiomas

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa los [Issues existentes](https://github.com/tu-usuario/DiaMod2R/issues)
2. Crea un nuevo Issue con detalles del problema
3. Incluye logs de error y pasos para reproducir

## 👨‍💻 Autor

Desarrollado con ❤️ para la comunidad de modding de Diablo 2.

---

**Versión**: 0.0.1  
**Última actualización**: Agosto 2025 - Gestor de Mods de Diablo 2

Aplicación web para gestionar modificaciones de archivos de mods de Diablo 2. Permite leer, escribir y crear archivos dentro de rutas específicas para hacer variaciones automáticas a los archivos de un mod.

## Características

- 🔍 **Exploración de Mods**: Busca y analiza carpetas de mods de Diablo 2
- 📊 **Análisis de CharStats**: Lee y parsea automáticamente archivos `charstats.txt`
- 💾 **Base de Datos**: Almacena información de mods y estadísticas de personajes en PostgreSQL
- 🖥️ **Interfaz Web**: Frontend React para gestión visual de mods
- 🔧 **API REST**: Backend Node.js/TypeScript con endpoints para todas las operaciones

## Arquitectura

```
DiaMod2R/
├── backend/          # Servidor Node.js/TypeScript
│   ├── src/
│   │   ├── models/   # Modelos de datos (TypeORM)
│   │   ├── routes/   # Rutas de la API
│   │   ├── services/ # Lógica de negocio
│   │   └── repositories/ # Acceso a datos
├── frontend/         # Aplicación React/TypeScript
│   └── src/
│       ├── components/
│       ├── services/
│       └── types/
```

## Estructura Esperada del Mod

La aplicación espera que los mods tengan la siguiente estructura:

```
MiMod/
└── MiMod.mpq/
    └── data/
        └── global/
            └── excel/
                ├── charstats.txt  # Archivo principal que se procesa
                ├── skills.txt
                └── otros archivos...
```

## Instalación y Configuración

### Prerrequisitos

- Node.js (v16 o superior)
- PostgreSQL
- npm o yarn

### Base de Datos

1. Crea una base de datos PostgreSQL llamada `diamod2BD`
2. Usuario: `postgres`
3. Contraseña: `123456`

```sql
CREATE DATABASE diamod2BD;
```

### Backend

1. Navega a la carpeta backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno editando `.env` si es necesario

4. Ejecuta en modo desarrollo:
```bash
npm run dev
```

El backend estará disponible en `http://localhost:3001`

### Frontend

1. Navega a la carpeta frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta en modo desarrollo:
```bash
npm start
```

El frontend estará disponible en `http://localhost:3000`

## Uso

1. **Seleccionar Carpeta**: Introduce la ruta de la carpeta del mod
2. **Procesar Mod**: La aplicación:
   - Verifica la estructura de carpetas
   - Busca archivos .txt en `data/global/excel`
   - Lee y parsea `charstats.txt`
   - Guarda el mod y sus CharStats en la base de datos
3. **Ver Resultados**: Consulta los mods procesados y sus estadísticas

## Modelo de Datos

### Mod
- ID, nombre, ruta de carpeta, fechas de creación y actualización

### CharStat
- Todas las columnas del archivo `charstats.txt`:
  - Atributos básicos: class, str, dex, int, vit, stamina, etc.
  - Habilidades: Skill1-10, StartSkill, etc.
  - Items: item1-10 con sus ubicaciones, cantidades y calidades
  - Indicador de expansión

## API Endpoints

- `GET /health` - Health check del servidor
- `POST /api/mods/process` - Procesar una carpeta de mod
- `GET /api/mods` - Obtener todos los mods
- `GET /api/mods/:id` - Obtener un mod específico
- `GET /api/mods/:id/charstats` - Obtener CharStats de un mod

## Desarrollo

### Scripts Disponibles

#### Backend
- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Compilar TypeScript
- `npm start` - Ejecutar versión compilada

#### Frontend  
- `npm start` - Ejecutar en modo desarrollo
- `npm run build` - Compilar para producción
- `npm test` - Ejecutar pruebas

## Tecnologías Utilizadas

### Backend
- **Node.js**: Runtime de JavaScript
- **TypeScript**: Tipado estático
- **Express**: Framework web
- **TypeORM**: ORM para base de datos
- **PostgreSQL**: Base de datos relacional

### Frontend
- **React**: Biblioteca de UI
- **TypeScript**: Tipado estático
- **Axios**: Cliente HTTP
- **CSS3**: Estilos con gradientes y efectos modernos

## Próximas Funcionalidades

- [ ] Editor visual de CharStats
- [ ] Soporte para más archivos de configuración del mod
- [ ] Exportación e importación de configuraciones
- [ ] Validación avanzada de archivos
- [ ] Historial de cambios
- [ ] Backup automático antes de modificaciones

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu funcionalidad (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

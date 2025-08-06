# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2025-08-06

### Added
- 🎉 Initial release of DiaMod2R
- 📁 Mod folder browser with automatic structure validation
- 🎠 Hero carousel interface for character navigation
- ✏️ Advanced statistics editor with multiple input methods:
  - Direct number input fields
  - Increment/decrement buttons (+/-)
  - Real-time change indicators (green/red)
- 💾 Individual character save system
- 🔄 Automatic expansion detection from charstats.txt files
- 🎨 Professional backoffice UI design:
  - Responsive sidebar navigation
  - Clean, modern styling
  - Full-width character editor
- 📊 PostgreSQL database integration:
  - Mod entity with metadata
  - CharStat entity with full character data
  - Relational model with foreign keys
- 🏗️ Complete backend API:
  - RESTful endpoints for all operations
  - File parsing and validation
  - CRUD operations for characters
- ⚛️ React frontend with TypeScript:
  - Context API for state management
  - Component-based architecture
  - Type-safe development
- 🛠️ Development tooling:
  - Concurrent frontend/backend execution
  - TypeScript compilation
  - Hot reload for development
  - Monorepo structure

### Technical Details
- **Backend**: Node.js + Express + TypeORM + PostgreSQL
- **Frontend**: React + TypeScript + Axios
- **Database**: PostgreSQL with automatic schema sync
- **File Processing**: Tab-separated charstats.txt parser
- **Character Types**: Automatic Classic/Expansion detection
- **API**: Full REST API with error handling
- **UI**: Responsive design with professional styling

### Database Schema
- `mods` table: Store mod information and metadata
- `charstats` table: Store character statistics with 80+ fields
- Foreign key relationships between mods and characters
- Automatic timestamp tracking (created/updated)

### Supported Features
- Parse charstats.txt files from Diablo 2 mod structures
- Navigate between character classes using carousel interface
- Edit all character statistics with visual feedback
- Save changes per character individually
- Clear pending changes without saving
- Distinguish between Classic and Expansion characters
- Professional file browser integration

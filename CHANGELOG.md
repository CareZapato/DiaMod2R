# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-08-07

### Added - Skills Management System
- 🎯 **Complete Skills Section**: Full-featured skills.txt processing and management
- 📋 **Dual View Modes**: 
  - Card view: Compact, visual skill cards with editing capabilities
  - List view: Horizontal rows for quick navigation and bulk editing
- 🔧 **Advanced Skill Editor**:
  - Edit requirement level (reqlevel) and maximum level (maxlvl)
  - Increment/decrement buttons with rapid-fire capability (hold for continuous change)
  - Click-to-edit: Click anywhere on skill card/row to start editing
  - Real-time validation with min/max constraints
- 📄 **Smart Pagination System**:
  - Configurable items per page (6, 12, 24, 48)
  - Intelligent page navigation with ellipsis
  - First/Previous/Next/Last page controls
  - Auto-reset on filter changes
- 🔍 **Advanced Filtering**:
  - Filter by mod, character class, and search terms
  - Search across skill names, descriptions, and *IDs
  - Case-insensitive character class matching
  - Preserved filters during pagination
- 💾 **Export & Change Tracking**:
  - Track all skill modifications with before/after values
  - Export modified skills to skillsmod.txt files
  - Smart mod detection for mixed-mod changes
  - Restore original values functionality
- 🎨 **Professional UI Design**:
  - *ID positioned before skill name for better identification
  - Full labels: "Nivel requerido" and "Nivel máximo"
  - Responsive design adapting to screen size
  - Visual editing states with color-coded borders
  - Smooth transitions between view modes

### Enhanced Backend
- 📊 **Skills Database Integration**:
  - Skill entity with 293 columns from skills.txt
  - Foreign key relationships with mods
  - Batch processing for large skill datasets
  - PostgreSQL parameter optimization
- 🔄 **Skills File Processing**:
  - Complete skills.txt parser with progress tracking
  - Star field conversion (star_* → * format)
  - Comprehensive field mapping and validation
  - Detailed error logging and recovery
- 🚀 **Skills API Endpoints**:
  - GET /api/skills - Retrieve all skills with filtering
  - GET /api/mods/:id/skills - Get skills by mod
  - PUT /api/mods/skills/:id - Update individual skills
  - POST /api/mods/:id/generate-modified-skills-file - Export changes
- ⚡ **Performance Optimizations**:
  - Batch skill updates to avoid PostgreSQL limits
  - Efficient pagination with database queries
  - Optimized skill loading with mod relationships

### Fixed
- 🔧 **Mod Name Preservation**: Fixed issue where mod names were lost after skill updates
- 🎯 **Auto Mod Selection**: Intelligent mod selection when only one mod is available
- 📱 **Mobile Responsiveness**: Improved mobile layout for both view modes
- 🔄 **State Management**: Better handling of editing states and change tracking

### Technical Improvements
- **Skills Entity**: Complete TypeORM entity with all skill fields
- **Skill Repository**: Optimized queries and batch operations
- **File Service**: Enhanced file generation with proper column ordering
- **Frontend Components**: Modular skill components with reusable logic
- **CSS Architecture**: Responsive grid layouts and modern styling
- **Type Safety**: Full TypeScript coverage for skill operations

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

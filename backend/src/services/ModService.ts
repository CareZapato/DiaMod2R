import { ModRepository } from '../repositories/ModRepository';
import { CharStatRepository } from '../repositories/CharStatRepository';
import { SkillRepository } from '../repositories/SkillRepository';
import { FileService, FileInfo } from './FileService';
import { Mod } from '../models/Mod';
import { CharStat } from '../models/CharStat';
import { Skill } from '../models/Skill';
import * as path from 'path';

export class ModService {
  private modRepository: ModRepository;
  private charStatRepository: CharStatRepository;
  private skillRepository: SkillRepository;
  private fileService: FileService;

  constructor() {
    this.modRepository = new ModRepository();
    this.charStatRepository = new CharStatRepository();
    this.skillRepository = new SkillRepository();
    this.fileService = new FileService();
  }

  /**
   * Procesa una carpeta de mod: la escanea, busca skills.txt y charstats.txt, y guarda en BD
   */
  async processModFolder(modFolderPath: string): Promise<{ mod: Mod; files: FileInfo[]; charStats: CharStat[]; skills: Skill[] }> {
    try {
      console.log(`🚀 Iniciando procesamiento de mod en: ${modFolderPath}`);
      const modName = path.basename(modFolderPath);
      console.log(`📝 Nombre del mod: ${modName}`);
      
      // 1. Verificar si el mod ya existe en la BD
      console.log(`🔍 Verificando si el mod "${modName}" ya existe en la base de datos...`);
      let existingMod = await this.modRepository.findByName(modName);
      
      if (existingMod) {
        console.log(`✅ Mod "${modName}" encontrado en BD con ID: ${existingMod.id}`);
      } else {
        console.log(`ℹ️ Mod "${modName}" no existe en BD, se creará uno nuevo`);
      }
      
      // 2. Escanear archivos en la carpeta
      console.log(`📁 Escaneando archivos en la carpeta del mod...`);
      const files = await this.fileService.scanModFolder(modFolderPath);
      console.log(`📊 Resumen del escaneo:`);
      console.log(`   📄 Total archivos .txt encontrados: ${files.length}`);
      console.log(`   📋 Lista de archivos:`, files.map(f => f.name));

      // 3. Buscar archivos requeridos
      console.log(`🔍 Buscando archivos obligatorios...`);
      const skillsFile = files.find(f => f.name.toLowerCase() === 'skills.txt');
      const charStatsFile = files.find(f => f.name.toLowerCase() === 'charstats.txt');
      
      console.log(`📋 Verificación de archivos obligatorios:`);
      console.log(`   charstats.txt: ${charStatsFile ? '✅ ENCONTRADO en ' + charStatsFile.path : '❌ NO ENCONTRADO'}`);
      console.log(`   skills.txt: ${skillsFile ? '✅ ENCONTRADO en ' + skillsFile.path : '❌ NO ENCONTRADO'}`);
      
      if (!charStatsFile) {
        const availableFiles = files.map(f => f.name).join(', ');
        throw new Error(`❌ No se encontró el archivo charstats.txt en la carpeta excel. Archivos disponibles: ${availableFiles}`);
      }
      
      if (!skillsFile) {
        const availableFiles = files.map(f => f.name).join(', ');
        throw new Error(`❌ No se encontró el archivo skills.txt en la carpeta excel. Archivos disponibles: ${availableFiles}`);
      }

      console.log(`✅ Todos los archivos obligatorios han sido encontrados`);

      // 4. Crear o actualizar el mod
      console.log(`💾 Preparando datos del mod para la base de datos...`);
      if (!existingMod) {
        const newMod = new Mod();
        newMod.name = modName;
        newMod.folderPath = modFolderPath;
        existingMod = await this.modRepository.save(newMod);
        console.log(`✅ Mod "${modName}" guardado en la base de datos con ID: ${existingMod.id}`);
      } else {
        console.log(`🔄 Mod "${modName}" ya existe en la base de datos con ID: ${existingMod.id}`);
        console.log(`🗑️ Eliminando datos existentes para reemplazarlos...`);
        // Eliminar datos existentes para reemplazarlos
        await this.charStatRepository.deleteByModId(existingMod.id);
        await this.skillRepository.deleteByModId(existingMod.id);
        console.log(`✅ Datos anteriores eliminados`);
      }

      // 5. Procesar skills.txt PRIMERO
      let skills: Skill[] = [];
      let skillsMap = new Map<string, number>(); // Mapeo de skill name a skill.id de BD
      
      console.log(`📖 Iniciando procesamiento de skills.txt...`);
      console.log(`   📁 Archivo: ${skillsFile.path}`);
      try {
        skills = await this.fileService.parseSkillsFile(skillsFile.path);
        console.log(`✅ Skills parseadas exitosamente: ${skills.length} registros`);
      } catch (error) {
        console.error(`❌ Error parseando skills.txt:`, error);
        throw new Error(`Error procesando skills.txt: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
      
      // Asociar skills con el mod y guardar en BD
      console.log(`🔗 Asociando skills con el mod...`);
      skills.forEach(skill => {
        skill.modId = existingMod!.id;
        skill.mod = existingMod!;
      });

      console.log(`💾 Guardando skills en la base de datos...`);
      try {
        const savedSkills = await this.skillRepository.saveMany(skills);
        console.log(`✅ ${savedSkills.length} Skills guardadas en la base de datos para el mod "${modName}"`);
        
        // Crear mapeo de nombre de skill a ID de BD para usar en charstats
        savedSkills.forEach(skill => {
          skillsMap.set(skill.skill.toLowerCase(), skill.id);
        });
        console.log(`📋 Mapa de skills creado con ${skillsMap.size} entradas`);
      } catch (error) {
        console.error(`❌ Error guardando skills en BD:`, error);
        throw new Error(`Error guardando skills en la base de datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }

      // 6. Parsear charstats.txt
      console.log(`📖 Iniciando procesamiento de charstats.txt...`);
      console.log(`   📁 Archivo: ${charStatsFile.path}`);
      let charStats: CharStat[] = [];
      try {
        charStats = await this.fileService.parseCharStatsFile(charStatsFile.path);
        console.log(`✅ CharStats parseados exitosamente: ${charStats.length} registros`);
      } catch (error) {
        console.error(`❌ Error parseando charstats.txt:`, error);
        throw new Error(`Error procesando charstats.txt: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
      
      // 7. Asociar charStats con el mod y establecer skill_id si existe StartSkill
      console.log(`🔗 Asociando CharStats con el mod y skills...`);
      let skillAssociations = 0;
      charStats.forEach(cs => {
        cs.modId = existingMod!.id;
        cs.mod = existingMod!;
        
        // Si tiene StartSkill y existe en skills, asociar el skillId (comparación en minúsculas)
        if (cs.StartSkill && skillsMap.has(cs.StartSkill.toLowerCase())) {
          const skillId = skillsMap.get(cs.StartSkill.toLowerCase());
          if (skillId !== undefined) {
            cs.skillId = skillId;
            skillAssociations++;
            console.log(`   🔗 CharStat "${cs.class}" - StartSkill "${cs.StartSkill}" asociado con skillId: ${cs.skillId}`);
          }
        } else if (cs.StartSkill) {
          console.log(`   ⚠️ CharStat "${cs.class}" - StartSkill "${cs.StartSkill}" no encontrado en skills`);
        }
      });
      
      console.log(`📊 Resumen de asociaciones de skills: ${skillAssociations} de ${charStats.length} CharStats`);

      console.log(`💾 Guardando CharStats en la base de datos...`);
      let savedCharStats: CharStat[] = [];
      try {
        savedCharStats = await this.charStatRepository.saveMany(charStats);
        console.log(`✅ ${savedCharStats.length} CharStats guardados en la base de datos para el mod "${modName}"`);
      } catch (error) {
        console.error(`❌ Error guardando CharStats en BD:`, error);
        throw new Error(`Error guardando CharStats en la base de datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }

      console.log(`🎉 Procesamiento del mod "${modName}" completado exitosamente`);
      console.log(`📊 Resumen final:`);
      console.log(`   📁 Archivos encontrados: ${files.length}`);
      console.log(`   🏃‍♂️ CharStats procesados: ${savedCharStats.length}`);
      console.log(`   ✨ Skills procesadas: ${skills.length}`);
      console.log(`   🔗 Asociaciones de skills: ${skillAssociations}`);

      return {
        mod: existingMod,
        files: files,
        charStats: savedCharStats,
        skills: skills
      };

    } catch (error) {
      console.error(`❌ Error procesando carpeta del mod "${modFolderPath}":`, error);
      throw error;
    }
  }

  /**
   * Obtiene todos los mods de la BD
   */
  async getAllMods(): Promise<Mod[]> {
    return await this.modRepository.findAll();
  }

  /**
   * Obtiene un mod por ID con sus charStats
   */
  async getModById(id: number): Promise<Mod | null> {
    return await this.modRepository.findById(id);
  }

  /**
   * Obtiene los charStats de un mod
   */
  async getCharStatsByModId(modId: number): Promise<CharStat[]> {
    return await this.charStatRepository.findByModId(modId);
  }

  /**
   * Obtiene las skills de un mod
   */
  async getSkillsByModId(modId: number): Promise<Skill[]> {
    return await this.skillRepository.findByModId(modId);
  }

  /**
   * Actualiza un CharStat específico
   */
  async updateCharStat(id: number, updateData: Partial<CharStat>): Promise<CharStat> {
    const existingCharStat = await this.charStatRepository.findById(id);
    if (!existingCharStat) {
      throw new Error(`CharStat con ID ${id} no encontrado`);
    }

    // Actualizar solo los campos proporcionados
    Object.assign(existingCharStat, updateData);
    
    return await this.charStatRepository.save(existingCharStat);
  }

  /**
   * Genera el archivo charstatsmod.txt con los cambios aplicados
   */
  async generateModifiedCharStatsFile(modId: number): Promise<string> {
    try {
      // 1. Obtener el mod y verificar que existe
      const mod = await this.modRepository.findById(modId);
      if (!mod) {
        throw new Error(`Mod con ID ${modId} no encontrado`);
      }

      // 2. Obtener todos los charStats del mod
      const charStats = await this.charStatRepository.findByModId(modId);
      if (charStats.length === 0) {
        throw new Error(`No se encontraron charStats para el mod ${mod.name}`);
      }

      // 3. Construir la ruta del archivo original charstats.txt
      const modName = path.basename(mod.folderPath);
      const originalFilePath = path.join(
        mod.folderPath,
        `${modName}.mpq`,
        'data',
        'global',
        'excel',
        'charstats.txt'
      );

      // 4. Generar el archivo modificado
      const modFilePath = await this.fileService.generateModifiedCharStatsFile(charStats, originalFilePath);
      
      console.log(`✅ Archivo charstatsmod.txt generado para el mod "${mod.name}"`);
      return modFilePath;
    } catch (error) {
      console.error('❌ Error en generateModifiedCharStatsFile:', error);
      throw error;
    }
  }

  /**
   * Genera el archivo skillsmod.txt con los cambios aplicados
   */
  async generateModifiedSkillsFile(modId: number): Promise<string> {
    try {
      // 1. Obtener el mod y verificar que existe
      const mod = await this.modRepository.findById(modId);
      if (!mod) {
        throw new Error(`Mod con ID ${modId} no encontrado`);
      }

      // 2. Obtener todas las skills del mod
      const skills = await this.skillRepository.findByModId(modId);
      if (skills.length === 0) {
        throw new Error(`No se encontraron skills para el mod ${mod.name}`);
      }

      // 3. Construir la ruta del archivo original skills.txt
      const modName = path.basename(mod.folderPath);
      const originalFilePath = path.join(
        mod.folderPath,
        `${modName}.mpq`,
        'data',
        'global',
        'excel',
        'skills.txt'
      );

      // 4. Generar el archivo modificado
      const modFilePath = await this.fileService.generateModifiedSkillsFile(skills, originalFilePath);
      
      console.log(`✅ Archivo skillsmod.txt generado para el mod "${mod.name}"`);
      return modFilePath;
    } catch (error) {
      console.error('❌ Error en generateModifiedSkillsFile:', error);
      throw error;
    }
  }
}

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
      const modName = path.basename(modFolderPath);
      
      // 1. Verificar si el mod ya existe en la BD
      let existingMod = await this.modRepository.findByName(modName);
      
      // 2. Escanear archivos en la carpeta
      const files = await this.fileService.scanModFolder(modFolderPath);
      console.log(`Archivos encontrados en ${modName}:`, files.map(f => f.name));

      // 3. Buscar archivos requeridos
      const skillsFile = files.find(f => f.name.toLowerCase() === 'skills.txt');
      const charStatsFile = files.find(f => f.name.toLowerCase() === 'charstats.txt');
      
      if (!charStatsFile) {
        throw new Error('No se encontró el archivo charstats.txt en la carpeta excel');
      }

      // 4. Crear o actualizar el mod
      if (!existingMod) {
        const newMod = new Mod();
        newMod.name = modName;
        newMod.folderPath = modFolderPath;
        existingMod = await this.modRepository.save(newMod);
        console.log(`Mod "${modName}" guardado en la base de datos con ID: ${existingMod.id}`);
      } else {
        console.log(`Mod "${modName}" ya existe en la base de datos con ID: ${existingMod.id}`);
        // Eliminar datos existentes para reemplazarlos
        await this.charStatRepository.deleteByModId(existingMod.id);
        await this.skillRepository.deleteByModId(existingMod.id);
      }

      // 5. Procesar skills.txt PRIMERO (si existe)
      let skills: Skill[] = [];
      let skillsMap = new Map<string, number>(); // Mapeo de *Id a skill.id de BD
      
      if (skillsFile) {
        console.log('📖 Procesando skills.txt...');
        skills = await this.fileService.parseSkillsFile(skillsFile.path);
        
        // Asociar skills con el mod y guardar en BD
        skills.forEach(skill => {
          skill.modId = existingMod!.id;
          skill.mod = existingMod!;
        });

        const savedSkills = await this.skillRepository.saveMany(skills);
        console.log(`✅ ${savedSkills.length} Skills guardadas en la base de datos para el mod "${modName}"`);
        
        // Crear mapeo de nombre de skill a ID de BD para usar en charstats
        savedSkills.forEach(skill => {
          skillsMap.set(skill.skill.toLowerCase(), skill.id);
        });
      } else {
        console.log('⚠️ No se encontró skills.txt - continuando sin procesar skills');
      }

      // 6. Parsear charstats.txt
      console.log('📖 Procesando charstats.txt...');
      const charStats = await this.fileService.parseCharStatsFile(charStatsFile.path);
      
      // 7. Asociar charStats con el mod y establecer skill_id si existe StartSkill
      charStats.forEach(cs => {
        cs.modId = existingMod!.id;
        cs.mod = existingMod!;
        
        // Si tiene StartSkill y existe en skills, asociar el skillId (comparación en minúsculas)
        if (cs.StartSkill && skillsMap.has(cs.StartSkill.toLowerCase())) {
          const skillId = skillsMap.get(cs.StartSkill.toLowerCase());
          if (skillId !== undefined) {
            cs.skillId = skillId;
            console.log(`🔗 CharStat "${cs.class}" - StartSkill "${cs.StartSkill}" asociado con skillId: ${cs.skillId}`);
          }
        }
      });

      const savedCharStats = await this.charStatRepository.saveMany(charStats);
      console.log(`✅ ${savedCharStats.length} CharStats guardados en la base de datos para el mod "${modName}"`);

      return {
        mod: existingMod,
        files: files,
        charStats: savedCharStats,
        skills: skills
      };

    } catch (error) {
      console.error('Error procesando carpeta del mod:', error);
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
}

import { ModRepository } from '../repositories/ModRepository';
import { CharStatRepository } from '../repositories/CharStatRepository';
import { FileService, FileInfo } from './FileService';
import { Mod } from '../models/Mod';
import { CharStat } from '../models/CharStat';
import * as path from 'path';

export class ModService {
  private modRepository: ModRepository;
  private charStatRepository: CharStatRepository;
  private fileService: FileService;

  constructor() {
    this.modRepository = new ModRepository();
    this.charStatRepository = new CharStatRepository();
    this.fileService = new FileService();
  }

  /**
   * Procesa una carpeta de mod: la escanea, busca charstats.txt, y guarda en BD
   */
  async processModFolder(modFolderPath: string): Promise<{ mod: Mod; files: FileInfo[]; charStats: CharStat[] }> {
    try {
      const modName = path.basename(modFolderPath);
      
      // 1. Verificar si el mod ya existe en la BD
      let existingMod = await this.modRepository.findByName(modName);
      
      // 2. Escanear archivos en la carpeta
      const files = await this.fileService.scanModFolder(modFolderPath);
      console.log(`Archivos encontrados en ${modName}:`, files.map(f => f.name));

      // 3. Buscar charstats.txt
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
        // Eliminar charStats existentes para reemplazarlos
        await this.charStatRepository.deleteByModId(existingMod.id);
      }

      // 5. Parsear charstats.txt
      const charStats = await this.fileService.parseCharStatsFile(charStatsFile.path);
      
      // 6. Asociar charStats con el mod y guardar en BD
      charStats.forEach(cs => {
        cs.modId = existingMod!.id;
        cs.mod = existingMod!;
      });

      const savedCharStats = await this.charStatRepository.saveMany(charStats);
      console.log(`${savedCharStats.length} CharStats guardados en la base de datos para el mod "${modName}"`);

      return {
        mod: existingMod,
        files: files,
        charStats: savedCharStats
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

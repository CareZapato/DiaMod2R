import * as fs from 'fs';
import * as path from 'path';
import { CharStat } from '../models/CharStat';
import { Mod } from '../models/Mod';

export interface FileInfo {
  name: string;
  path: string;
}

export class FileService {
  
  /**
   * Busca la carpeta .mpq dentro de la carpeta del mod
   * y navega a data/global/excel para encontrar archivos .txt
   */
  async scanModFolder(modFolderPath: string): Promise<FileInfo[]> {
    try {
      const modFolderName = path.basename(modFolderPath);
      const mpqFolderPath = path.join(modFolderPath, `${modFolderName}.mpq`);
      
      // Verificar que existe la carpeta .mpq
      if (!fs.existsSync(mpqFolderPath)) {
        throw new Error(`No se encontró la carpeta ${modFolderName}.mpq en ${modFolderPath}`);
      }

      const excelFolderPath = path.join(mpqFolderPath, 'data', 'global', 'excel');
      
      // Verificar que existe la carpeta excel
      if (!fs.existsSync(excelFolderPath)) {
        throw new Error(`No se encontró la carpeta data/global/excel en ${mpqFolderPath}`);
      }

      // Leer archivos .txt en la carpeta excel
      const files = fs.readdirSync(excelFolderPath);
      const txtFiles = files
        .filter(file => file.endsWith('.txt'))
        .map(file => ({
          name: file,
          path: path.join(excelFolderPath, file)
        }));

      return txtFiles;
    } catch (error) {
      console.error('Error escaneando carpeta del mod:', error);
      throw error;
    }
  }

  /**
   * Lee y parsea el archivo charstats.txt
   */
  async parseCharStatsFile(filePath: string): Promise<CharStat[]> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length === 0) {
        throw new Error('El archivo charstats.txt está vacío');
      }

      // La primera línea debería ser el header con los nombres de las columnas
      const headers = lines[0].split('\t');
      const charStats: CharStat[] = [];
      let isExpansion = false;

      // Procesar cada línea después del header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Verificar si es la línea "Expansion"
        if (line.toLowerCase() === 'expansion') {
          isExpansion = true;
          continue;
        }

        // Dividir la línea por tabs
        const values = line.split('\t');
        
        // Verificar si la línea tiene el formato esperado (debe tener al menos algunas columnas básicas)
        if (values.length < 10 || !values[0] || values[0] === '' || values[0].toLowerCase().includes('comment')) {
          continue; // Saltar líneas informativas o incompletas
        }

        // Crear objeto CharStat
        const charStat = new CharStat();
        
        try {
          charStat.class = values[0] || '';
          charStat.str = parseInt(values[1]) || 0;
          charStat.dex = parseInt(values[2]) || 0;
          charStat.int = parseInt(values[3]) || 0;
          charStat.vit = parseInt(values[4]) || 0;
          charStat.stamina = parseInt(values[5]) || 0;
          charStat.hpadd = parseInt(values[6]) || 0;
          charStat.ManaRegen = parseInt(values[7]) || 0;
          charStat.ToHitFactor = parseInt(values[8]) || 0;
          charStat.WalkVelocity = parseInt(values[9]) || 0;
          charStat.RunVelocity = parseInt(values[10]) || 0;
          charStat.RunDrain = parseInt(values[11]) || 0;
          charStat.Comment = values[12] || '';
          charStat.LifePerLevel = parseInt(values[13]) || 0;
          charStat.StaminaPerLevel = parseInt(values[14]) || 0;
          charStat.ManaPerLevel = parseInt(values[15]) || 0;
          charStat.LifePerVitality = parseInt(values[16]) || 0;
          charStat.StaminaPerVitality = parseInt(values[17]) || 0;
          charStat.ManaPerMagic = parseInt(values[18]) || 0;
          charStat.StatPerLevel = parseInt(values[19]) || 0;
          charStat.SkillsPerLevel = parseInt(values[20]) || 0;
          charStat.LightRadius = parseInt(values[21]) || 0;
          charStat.BlockFactor = parseInt(values[22]) || 0;
          charStat.MinimumCastingDelay = parseInt(values[23]) || 0;
          charStat.StartSkill = values[24] || '';
          charStat.Skill1 = values[25] || '';
          charStat.Skill2 = values[26] || '';
          charStat.Skill3 = values[27] || '';
          charStat.Skill4 = values[28] || '';
          charStat.Skill5 = values[29] || '';
          charStat.Skill6 = values[30] || '';
          charStat.Skill7 = values[31] || '';
          charStat.Skill8 = values[32] || '';
          charStat.Skill9 = values[33] || '';
          charStat.Skill10 = values[34] || '';
          charStat.StrAllSkills = values[35] || '';
          charStat.StrSkillTab1 = values[36] || '';
          charStat.StrSkillTab2 = values[37] || '';
          charStat.StrSkillTab3 = values[38] || '';
          charStat.StrClassOnly = values[39] || '';
          charStat.HealthPotionPercent = parseInt(values[40]) || 0;
          charStat.ManaPotionPercent = parseInt(values[41]) || 0;
          charStat.baseWClass = values[42] || '';
          charStat.item1 = values[43] || '';
          charStat.item1loc = values[44] || '';
          charStat.item1count = parseInt(values[45]) || 0;
          charStat.item1quality = parseInt(values[46]) || 0;
          charStat.item2 = values[47] || '';
          charStat.item2loc = values[48] || '';
          charStat.item2count = parseInt(values[49]) || 0;
          charStat.item2quality = parseInt(values[50]) || 0;
          charStat.item3 = values[51] || '';
          charStat.item3loc = values[52] || '';
          charStat.item3count = parseInt(values[53]) || 0;
          charStat.item3quality = parseInt(values[54]) || 0;
          charStat.item4 = values[55] || '';
          charStat.item4loc = values[56] || '';
          charStat.item4count = parseInt(values[57]) || 0;
          charStat.item4quality = parseInt(values[58]) || 0;
          charStat.item5 = values[59] || '';
          charStat.item5loc = values[60] || '';
          charStat.item5count = parseInt(values[61]) || 0;
          charStat.item5quality = parseInt(values[62]) || 0;
          charStat.item6 = values[63] || '';
          charStat.item6loc = values[64] || '';
          charStat.item6count = parseInt(values[65]) || 0;
          charStat.item6quality = parseInt(values[66]) || 0;
          charStat.item7 = values[67] || '';
          charStat.item7loc = values[68] || '';
          charStat.item7count = parseInt(values[69]) || 0;
          charStat.item7quality = parseInt(values[70]) || 0;
          charStat.item8 = values[71] || '';
          charStat.item8loc = values[72] || '';
          charStat.item8count = parseInt(values[73]) || 0;
          charStat.item8quality = parseInt(values[74]) || 0;
          charStat.item9 = values[75] || '';
          charStat.item9loc = values[76] || '';
          charStat.item9count = parseInt(values[77]) || 0;
          charStat.item9quality = parseInt(values[78]) || 0;
          charStat.item10 = values[79] || '';
          charStat.item10loc = values[80] || '';
          charStat.item10count = parseInt(values[81]) || 0;
          charStat.item10quality = parseInt(values[82]) || 0;
          
          charStat.expansion = isExpansion;

          charStats.push(charStat);
        } catch (error) {
          console.warn(`Error procesando línea ${i + 1}: ${line}`, error);
          continue;
        }
      }

      console.log(`CharStats parseados exitosamente: ${charStats.length} registros`);
      charStats.forEach((cs, index) => {
        console.log(`${index + 1}. Clase: ${cs.class}, STR: ${cs.str}, DEX: ${cs.dex}, INT: ${cs.int}, VIT: ${cs.vit}, Expansion: ${cs.expansion}`);
      });

      return charStats;
    } catch (error) {
      console.error('Error parseando archivo charstats.txt:', error);
      throw error;
    }
  }
}

import * as fs from 'fs';
import * as path from 'path';
import { CharStat } from '../models/CharStat';
import { Skill } from '../models/Skill';
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
      console.log(`🔍 Iniciando escaneo de carpeta del mod: ${modFolderPath}`);
      
      // Verificar que la ruta del mod existe
      if (!fs.existsSync(modFolderPath)) {
        throw new Error(`❌ La ruta del mod no existe: ${modFolderPath}`);
      }
      
      // Listar contenido de la carpeta del mod
      const modContents = fs.readdirSync(modFolderPath);
      console.log(`📁 Contenido de la carpeta del mod:`, modContents);
      
      const modFolderName = path.basename(modFolderPath);
      console.log(`📝 Nombre del mod extraído: ${modFolderName}`);
      
      const mpqFolderPath = path.join(modFolderPath, `${modFolderName}.mpq`);
      console.log(`🔍 Buscando carpeta .mpq en: ${mpqFolderPath}`);
      
      // Verificar que existe la carpeta .mpq
      if (!fs.existsSync(mpqFolderPath)) {
        console.log(`❌ No se encontró la carpeta .mpq esperada: ${modFolderName}.mpq`);
        console.log(`📁 Carpetas disponibles en ${modFolderPath}:`, 
          modContents.filter(item => {
            const itemPath = path.join(modFolderPath, item);
            return fs.statSync(itemPath).isDirectory();
          })
        );
        throw new Error(`No se encontró la carpeta ${modFolderName}.mpq en ${modFolderPath}`);
      }
      
      console.log(`✅ Carpeta .mpq encontrada: ${mpqFolderPath}`);

      const excelFolderPath = path.join(mpqFolderPath, 'data', 'global', 'excel');
      console.log(`🔍 Buscando carpeta excel en: ${excelFolderPath}`);
      
      // Verificar que existe la carpeta excel
      if (!fs.existsSync(excelFolderPath)) {
        console.log(`❌ No se encontró la carpeta data/global/excel`);
        
        // Verificar qué carpetas existen en .mpq
        const mpqContents = fs.existsSync(mpqFolderPath) ? fs.readdirSync(mpqFolderPath) : [];
        console.log(`📁 Contenido de ${mpqFolderPath}:`, mpqContents);
        
        // Verificar si existe la carpeta data
        const dataPath = path.join(mpqFolderPath, 'data');
        if (fs.existsSync(dataPath)) {
          const dataContents = fs.readdirSync(dataPath);
          console.log(`📁 Contenido de data/:`, dataContents);
          
          // Verificar si existe la carpeta global
          const globalPath = path.join(dataPath, 'global');
          if (fs.existsSync(globalPath)) {
            const globalContents = fs.readdirSync(globalPath);
            console.log(`📁 Contenido de global/:`, globalContents);
          } else {
            console.log(`❌ No se encontró la carpeta global/ en data/`);
          }
        } else {
          console.log(`❌ No se encontró la carpeta data/ en la carpeta .mpq`);
        }
        
        throw new Error(`No se encontró la carpeta data/global/excel en ${mpqFolderPath}`);
      }
      
      console.log(`✅ Carpeta excel encontrada: ${excelFolderPath}`);

      // Leer archivos .txt en la carpeta excel
      const files = fs.readdirSync(excelFolderPath);
      console.log(`📁 Archivos encontrados en excel/:`, files);
      
      const txtFiles = files
        .filter(file => file.endsWith('.txt'))
        .map(file => ({
          name: file,
          path: path.join(excelFolderPath, file)
        }));

      console.log(`📄 Archivos .txt encontrados:`, txtFiles.map(f => f.name));
      
      // Verificar archivos obligatorios
      const hasCharStats = txtFiles.some(f => f.name.toLowerCase() === 'charstats.txt');
      const hasSkills = txtFiles.some(f => f.name.toLowerCase() === 'skills.txt');
      
      console.log(`📋 Verificación de archivos obligatorios:`);
      console.log(`   ✅ charstats.txt: ${hasCharStats ? 'ENCONTRADO' : '❌ NO ENCONTRADO'}`);
      console.log(`   ✅ skills.txt: ${hasSkills ? 'ENCONTRADO' : '❌ NO ENCONTRADO'}`);

      return txtFiles;
    } catch (error) {
      console.error('❌ Error escaneando carpeta del mod:', error);
      throw error;
    }
  }

  /**
   * Lee y parsea el archivo charstats.txt
   */
  async parseCharStatsFile(filePath: string): Promise<CharStat[]> {
    try {
      console.log(`📖 Iniciando parsing de charstats.txt: ${filePath}`);
      
      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        throw new Error(`❌ El archivo charstats.txt no existe en la ruta: ${filePath}`);
      }
      
      // Obtener información del archivo
      const stats = fs.statSync(filePath);
      console.log(`📊 Información del archivo charstats.txt:`);
      console.log(`   📁 Ruta: ${filePath}`);
      console.log(`   📏 Tamaño: ${stats.size} bytes`);
      console.log(`   📅 Última modificación: ${stats.mtime}`);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      console.log(`📄 Archivo leído, contenido: ${content.length} caracteres`);
      
      const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      console.log(`📋 Líneas procesadas: ${lines.length} líneas válidas`);
      
      if (lines.length === 0) {
        throw new Error('❌ El archivo charstats.txt está vacío');
      }

      if (lines.length < 2) {
        throw new Error('❌ El archivo charstats.txt debe tener al menos una línea de headers y una línea de datos');
      }

      // La primera línea debería ser el header con los nombres de las columnas
      const headers = lines[0].split('\t');
      const charStats: CharStat[] = [];
      let isExpansion = false;

      // Procesar cada línea después del header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Saltar líneas vacías
        if (!line) {
          continue;
        }

        // Dividir la línea por tabs
        const values = line.split('\t');
        
        // Verificar si es la línea "Expansion" (primer campo = "Expansion")
        if (values[0] && values[0].toLowerCase().trim() === 'expansion') {
          isExpansion = true;
          console.log('🔄 Detectada línea "Expansion" - Cambiando modo a expansion=true');
          continue; // No guardar este registro, solo cambiar el flag
        }
        
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

  /**
   * Lee y parsea el archivo skills.txt
   */
  async parseSkillsFile(filePath: string): Promise<Skill[]> {
    try {
      console.log(`📖 Iniciando parsing de skills.txt: ${filePath}`);
      
      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        throw new Error(`❌ El archivo skills.txt no existe en la ruta: ${filePath}`);
      }
      
      // Obtener información del archivo
      const stats = fs.statSync(filePath);
      console.log(`📊 Información del archivo skills.txt:`);
      console.log(`   📁 Ruta: ${filePath}`);
      console.log(`   📏 Tamaño: ${stats.size} bytes`);
      console.log(`   📅 Última modificación: ${stats.mtime}`);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      console.log(`📄 Archivo leído, contenido: ${content.length} caracteres`);
      
      const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      console.log(`📋 Líneas procesadas: ${lines.length} líneas válidas`);
      
      if (lines.length === 0) {
        throw new Error('❌ El archivo skills.txt está vacío');
      }

      if (lines.length < 2) {
        throw new Error('❌ El archivo skills.txt debe tener al menos una línea de headers y una línea de datos');
      }

      // La primera línea debería ser el header con los nombres de las columnas
      const headers = lines[0].split('\t');
      const skills: Skill[] = [];
      let isExpansion = false;

      console.log(`📋 Headers encontrados en skills.txt: ${headers.length} columnas`);
      console.log(`📝 Primeras 10 columnas: ${headers.slice(0, 10).join(', ')}`);

      let processedSkills = 0;
      let skippedLines = 0;
      let expansionLineFound = false;

      // Procesar cada línea después del header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Saltar líneas vacías
        if (!line) {
          skippedLines++;
          continue;
        }

        // Dividir la línea por tabs
        const values = line.split('\t');
        
        // Verificar si es la línea "Expansion" (primer campo = "Expansion")
        if (values[0] && values[0].toLowerCase().trim() === 'expansion') {
          isExpansion = true;
          expansionLineFound = true;
          console.log(`🔄 Detectada línea "Expansion" en línea ${i + 1} - Cambiando modo a expansion=true`);
          skippedLines++;
          continue; // No guardar este registro, solo cambiar el flag
        }
        
        // Verificar si la línea tiene el formato esperado
        if (values.length < 10 || !values[0] || values[0] === '' || values[0].toLowerCase().includes('comment')) {
          continue; // Saltar líneas informativas o incompletas
        }

        // Crear objeto Skill
        const skill = new Skill();
        
        try {
          // Asignar el flag de expansion
          
          // Mapear todas las 290 columnas del skills.txt
          skill.skill = values[0] || '';
          skill.starId = values[1] || '';
          skill.charclass = values[2] || '';
          skill.skilldesc = values[3] || '';
          skill.srvstfunc = values[4] || '';
          skill.srvdofunc = values[5] || '';
          skill.srvstopfunc = values[6] || '';
          skill.prgstack = parseInt(values[7]) || 0;
          skill.srvprgfunc1 = values[8] || '';
          skill.srvprgfunc2 = values[9] || '';
          skill.srvprgfunc3 = values[10] || '';
          skill.prgcalc1 = values[11] || '';
          skill.prgcalc2 = values[12] || '';
          skill.prgcalc3 = values[13] || '';
          skill.prgdam = values[14] || '';
          skill.srvmissile = values[15] || '';
          skill.decquant = parseInt(values[16]) || 0;
          skill.lob = parseInt(values[17]) || 0;
          skill.srvmissilea = values[18] || '';
          skill.srvmissileb = values[19] || '';
          skill.srvmissilec = values[20] || '';
          skill.useServerMissilesOnRemoteClients = parseInt(values[21]) || 0;
          skill.srvoverlay = values[22] || '';
          skill.aurafilter = values[23] || '';
          skill.aurastate = values[24] || '';
          skill.auratargetstate = values[25] || '';
          skill.auralencalc = values[26] || '';
          skill.aurarangecalc = values[27] || '';
          skill.aurastat1 = values[28] || '';
          skill.aurastatcalc1 = values[29] || '';
          skill.aurastat2 = values[30] || '';
          skill.aurastatcalc2 = values[31] || '';
          skill.aurastat3 = values[32] || '';
          skill.aurastatcalc3 = values[33] || '';
          skill.aurastat4 = values[34] || '';
          skill.aurastatcalc4 = values[35] || '';
          skill.aurastat5 = values[36] || '';
          skill.aurastatcalc5 = values[37] || '';
          skill.aurastat6 = values[38] || '';
          skill.aurastatcalc6 = values[39] || '';
          skill.auraevent1 = values[40] || '';
          skill.auraeventfunc1 = values[41] || '';
          skill.auraevent2 = values[42] || '';
          skill.auraeventfunc2 = values[43] || '';
          skill.auraevent3 = values[44] || '';
          skill.auraeventfunc3 = values[45] || '';
          skill.passivestate = values[46] || '';
          skill.passiveitype = values[47] || '';
          skill.passivereqweaponcount = parseInt(values[48]) || 0;
          skill.passivestat1 = values[49] || '';
          skill.passivecalc1 = values[50] || '';
          skill.passivestat2 = values[51] || '';
          skill.passivecalc2 = values[52] || '';
          skill.passivestat3 = values[53] || '';
          skill.passivecalc3 = values[54] || '';
          skill.passivestat4 = values[55] || '';
          skill.passivecalc4 = values[56] || '';
          skill.passivestat5 = values[57] || '';
          skill.passivecalc5 = values[58] || '';
          skill.passivestat6 = values[59] || '';
          skill.passivecalc6 = values[60] || '';
          skill.passivestat7 = values[61] || '';
          skill.passivecalc7 = values[62] || '';
          skill.passivestat8 = values[63] || '';
          skill.passivecalc8 = values[64] || '';
          skill.passivestat9 = values[65] || '';
          skill.passivecalc9 = values[66] || '';
          skill.passivestat10 = values[67] || '';
          skill.passivecalc10 = values[68] || '';
          skill.passivestat11 = values[69] || '';
          skill.passivecalc11 = values[70] || '';
          skill.passivestat12 = values[71] || '';
          skill.passivecalc12 = values[72] || '';
          skill.passivestat13 = values[73] || '';
          skill.passivecalc13 = values[74] || '';
          skill.passivestat14 = values[75] || '';
          skill.passivecalc14 = values[76] || '';
          skill.summon = values[77] || '';
          skill.pettype = values[78] || '';
          skill.petmax = parseInt(values[79]) || 0;
          skill.summode = values[80] || '';
          skill.sumskill1 = values[81] || '';
          skill.sumsk1calc = values[82] || '';
          skill.sumskill2 = values[83] || '';
          skill.sumsk2calc = values[84] || '';
          skill.sumskill3 = values[85] || '';
          skill.sumsk3calc = values[86] || '';
          skill.sumskill4 = values[87] || '';
          skill.sumsk4calc = values[88] || '';
          skill.sumskill5 = values[89] || '';
          skill.sumsk5calc = values[90] || '';
          skill.sumumod = values[91] || '';
          skill.sumoverlay = values[92] || '';
          skill.stsuccessonly = parseInt(values[93]) || 0;
          skill.stsound = values[94] || '';
          skill.stsoundclass = values[95] || '';
          skill.stsounddelay = parseInt(values[96]) || 0;
          skill.weaponsnd = values[97] || '';
          skill.dosound = values[98] || '';
          skill.dosoundA = values[99] || '';
          skill.dosoundB = values[100] || '';
          skill.tgtoverlay = values[101] || '';
          skill.tgtsound = values[102] || '';
          skill.prgoverlay = values[103] || '';
          skill.prgsound = values[104] || '';
          skill.castoverlay = values[105] || '';
          skill.cltoverlaya = values[106] || '';
          skill.cltoverlayb = values[107] || '';
          skill.cltstfunc = values[108] || '';
          skill.cltdofunc = values[109] || '';
          skill.cltstopfunc = values[110] || '';
          skill.cltprgfunc1 = values[111] || '';
          skill.cltprgfunc2 = values[112] || '';
          skill.cltprgfunc3 = values[113] || '';
          skill.cltmissile = values[114] || '';
          skill.cltmissilea = values[115] || '';
          skill.cltmissileb = values[116] || '';
          skill.cltmissilec = values[117] || '';
          skill.cltmissiled = values[118] || '';
          skill.cltcalc1 = values[119] || '';
          skill.starCltcalc1Desc = values[120] || '';
          skill.cltcalc2 = values[121] || '';
          skill.starCltcalc2Desc = values[122] || '';
          skill.cltcalc3 = values[123] || '';
          skill.starCltcalc3Desc = values[124] || '';
          skill.warp = parseInt(values[125]) || 0;
          skill.immediate = parseInt(values[126]) || 0;
          skill.enhanceable = parseInt(values[127]) || 0;
          skill.attackrank = parseInt(values[128]) || 0;
          skill.noammo = parseInt(values[129]) || 0;
          skill.range = parseInt(values[130]) || 0;
          skill.weapsel = parseInt(values[131]) || 0;
          skill.itypea1 = values[132] || '';
          skill.itypea2 = values[133] || '';
          skill.itypea3 = values[134] || '';
          skill.etypea1 = values[135] || '';
          skill.etypea2 = values[136] || '';
          skill.itypeb1 = values[137] || '';
          skill.itypeb2 = values[138] || '';
          skill.itypeb3 = values[139] || '';
          skill.etypeb1 = values[140] || '';
          skill.etypeb2 = values[141] || '';
          skill.anim = values[142] || '';
          skill.seqtrans = values[143] || '';
          skill.monanim = values[144] || '';
          skill.seqnum = parseInt(values[145]) || 0;
          skill.seqinput = parseInt(values[146]) || 0;
          skill.durability = parseInt(values[147]) || 0;
          skill.UseAttackRate = parseInt(values[148]) || 0;
          skill.LineOfSight = parseInt(values[149]) || 0;
          skill.TargetableOnly = parseInt(values[150]) || 0;
          skill.SearchEnemyXY = parseInt(values[151]) || 0;
          skill.SearchEnemyNear = parseInt(values[152]) || 0;
          skill.SearchOpenXY = parseInt(values[153]) || 0;
          skill.SelectProc = parseInt(values[154]) || 0;
          skill.TargetCorpse = parseInt(values[155]) || 0;
          skill.TargetPet = parseInt(values[156]) || 0;
          skill.TargetAlly = parseInt(values[157]) || 0;
          skill.TargetItem = parseInt(values[158]) || 0;
          skill.AttackNoMana = parseInt(values[159]) || 0;
          skill.TgtPlaceCheck = parseInt(values[160]) || 0;
          skill.KeepCursorStateOnKill = parseInt(values[161]) || 0;
          skill.ContinueCastUnselected = parseInt(values[162]) || 0;
          skill.ClearSelectedOnHold = parseInt(values[163]) || 0;
          skill.ItemEffect = parseInt(values[164]) || 0;
          skill.ItemCltEffect = parseInt(values[165]) || 0;
          skill.ItemTgtDo = parseInt(values[166]) || 0;
          skill.ItemTarget = parseInt(values[167]) || 0;
          skill.ItemUseRestrict = parseInt(values[168]) || 0;
          skill.ItemCheckStart = parseInt(values[169]) || 0;
          skill.ItemCltCheckStart = parseInt(values[170]) || 0;
          skill.ItemCastSound = values[171] || '';
          skill.ItemCastOverlay = values[172] || '';
          skill.skpoints = parseInt(values[173]) || 0;
          skill.reqlevel = parseInt(values[174]) || 0;
          skill.maxlvl = parseInt(values[175]) || 0;
          skill.reqstr = parseInt(values[176]) || 0;
          skill.reqdex = parseInt(values[177]) || 0;
          skill.reqint = parseInt(values[178]) || 0;
          skill.reqvit = parseInt(values[179]) || 0;
          skill.reqskill1 = values[180] || '';
          skill.reqskill2 = values[181] || '';
          skill.reqskill3 = values[182] || '';
          skill.restrict = values[183] || '';
          skill.State1 = values[184] || '';
          skill.State2 = values[185] || '';
          skill.State3 = values[186] || '';
          skill.localdelay = parseInt(values[187]) || 0;
          skill.globaldelay = parseInt(values[188]) || 0;
          skill.leftskill = parseInt(values[189]) || 0;
          skill.rightskill = parseInt(values[190]) || 0;
          skill.repeat = parseInt(values[191]) || 0;
          skill.alwayshit = parseInt(values[192]) || 0;
          skill.usemanaondo = parseInt(values[193]) || 0;
          skill.startmana = parseInt(values[194]) || 0;
          skill.minmana = parseInt(values[195]) || 0;
          skill.manashift = parseInt(values[196]) || 0;
          skill.mana = parseInt(values[197]) || 0;
          skill.lvlmana = parseInt(values[198]) || 0;
          skill.interrupt = parseInt(values[199]) || 0;
          skill.InTown = parseInt(values[200]) || 0;
          skill.aura = parseInt(values[201]) || 0;
          skill.periodic = parseInt(values[202]) || 0;
          skill.perdelay = parseInt(values[203]) || 0;
          skill.finishing = parseInt(values[204]) || 0;
          skill.prgchargestocast = parseInt(values[205]) || 0;
          skill.prgchargesconsumed = parseInt(values[206]) || 0;
          skill.passive = parseInt(values[207]) || 0;
          skill.progressive = parseInt(values[208]) || 0;
          skill.scroll = parseInt(values[209]) || 0;
          skill.calc1 = values[210] || '';
          skill.starCalc1Desc = values[211] || '';
          skill.calc2 = values[212] || '';
          skill.starCalc2Desc = values[213] || '';
          skill.calc3 = values[214] || '';
          skill.starCalc3Desc = values[215] || '';
          skill.calc4 = values[216] || '';
          skill.starCalc4Desc = values[217] || '';
          skill.calc5 = values[218] || '';
          skill.starCalc5Desc = values[219] || '';
          skill.calc6 = values[220] || '';
          skill.starCalc6Desc = values[221] || '';
          skill.Param1 = values[222] || '';
          skill.starParam1Description = values[223] || '';
          skill.Param2 = values[224] || '';
          skill.starParam2Description = values[225] || '';
          skill.Param3 = values[226] || '';
          skill.starParam3Description = values[227] || '';
          skill.Param4 = values[228] || '';
          skill.starParam4Description = values[229] || '';
          skill.Param5 = values[230] || '';
          skill.starParam5Description = values[231] || '';
          skill.Param6 = values[232] || '';
          skill.starParam6Description = values[233] || '';
          skill.Param7 = values[234] || '';
          skill.starParam7Description = values[235] || '';
          skill.Param8 = values[236] || '';
          skill.starParam8Description = values[237] || '';
          skill.Param9 = values[238] || '';
          skill.starParam9Description = values[239] || '';
          skill.Param10 = values[240] || '';
          skill.starParam10Description2 = values[241] || '';
          skill.Param11 = values[242] || '';
          skill.starParam11Description = values[243] || '';
          skill.Param12 = values[244] || '';
          skill.starParam12Description = values[245] || '';
          skill.InGame = parseInt(values[246]) || 0;
          skill.ToHit = values[247] || '';
          skill.LevToHit = values[248] || '';
          skill.ToHitCalc = values[249] || '';
          skill.ResultFlags = parseInt(values[250]) || 0;
          skill.HitFlags = parseInt(values[251]) || 0;
          skill.HitClass = parseInt(values[252]) || 0;
          skill.Kick = parseInt(values[253]) || 0;
          skill.HitShift = parseInt(values[254]) || 0;
          skill.SrcDam = parseInt(values[255]) || 0;
          skill.MinDam = values[256] || '';
          skill.MinLevDam1 = values[257] || '';
          skill.MinLevDam2 = values[258] || '';
          skill.MinLevDam3 = values[259] || '';
          skill.MinLevDam4 = values[260] || '';
          skill.MinLevDam5 = values[261] || '';
          skill.MaxDam = values[262] || '';
          skill.MaxLevDam1 = values[263] || '';
          skill.MaxLevDam2 = values[264] || '';
          skill.MaxLevDam3 = values[265] || '';
          skill.MaxLevDam4 = values[266] || '';
          skill.MaxLevDam5 = values[267] || '';
          skill.DmgSymPerCalc = values[268] || '';
          skill.EType = values[269] || '';
          skill.EMin = values[270] || '';
          skill.EMinLev1 = values[271] || '';
          skill.EMinLev2 = values[272] || '';
          skill.EMinLev3 = values[273] || '';
          skill.EMinLev4 = values[274] || '';
          skill.EMinLev5 = values[275] || '';
          skill.EMax = values[276] || '';
          skill.EMaxLev1 = values[277] || '';
          skill.EMaxLev2 = values[278] || '';
          skill.EMaxLev3 = values[279] || '';
          skill.EMaxLev4 = values[280] || '';
          skill.EMaxLev5 = values[281] || '';
          skill.EDmgSymPerCalc = values[282] || '';
          skill.ELen = values[283] || '';
          skill.ELevLen1 = values[284] || '';
          skill.ELevLen2 = values[285] || '';
          skill.ELevLen3 = values[286] || '';
          skill.ELenSymPerCalc = values[287] || '';
          skill.aitype = parseInt(values[288]) || 0;
          skill.aibonus = values[289] || '';
          skill.costMult = parseInt(values[290]) || 0;
          skill.costAdd = parseInt(values[291]) || 0;
          skill.starEol = values[292] || '';

          skills.push(skill);
          processedSkills++;

          // Log cada 50 skills procesadas
          if (processedSkills % 50 === 0) {
            console.log(`   📊 Progreso: ${processedSkills} skills procesadas...`);
          }

        } catch (error) {
          console.error(`❌ Error procesando línea ${i + 1} en skills.txt:`, error);
          console.error(`   📄 Línea problemática: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
          console.error(`   🔢 Valores encontrados: ${values.length} de ${headers.length} esperados`);
          skippedLines++;
          continue; // Continuar con la siguiente línea
        }
      }

      console.log(`🎉 Skills.txt parseado exitosamente`);
      console.log(`📊 Resumen del parsing:`);
      console.log(`   ✅ Skills procesadas: ${skills.length}`);
      console.log(`   ⏭️ Líneas omitidas: ${skippedLines}`);
      console.log(`   🔄 Línea Expansion encontrada: ${expansionLineFound ? 'Sí' : 'No'}`);
      console.log(`   📋 Total líneas procesadas: ${lines.length - 1} (excluyendo header)`);
      
      if (skills.length === 0) {
        throw new Error('❌ No se pudo procesar ninguna skill del archivo skills.txt');
      }

      return skills;

    } catch (error) {
      console.error('❌ Error leyendo skills.txt:', error);
      throw error;
    }
  }

  /**
   * Genera el archivo charstats.txt modificado, creando una copia de seguridad del original
   */
  async generateModifiedCharStatsFile(charStats: CharStat[], originalFilePath: string): Promise<string> {
    try {
      // Crear copia de seguridad del archivo original
      const backupFilePath = path.join(path.dirname(originalFilePath), 'charstats_backup.txt');
      if (fs.existsSync(originalFilePath)) {
        fs.copyFileSync(originalFilePath, backupFilePath);
        console.log(`💾 Copia de seguridad creada: ${backupFilePath}`);
      }
      
      // Definir las columnas en el orden correcto (sin incluir 'expansion')
      const columns = [
        'class', 'str', 'dex', 'int', 'vit', 'stamina', 'hpadd', 'ManaRegen', 'ToHitFactor',
        'WalkVelocity', 'RunVelocity', 'RunDrain', 'Comment', 'LifePerLevel', 'StaminaPerLevel',
        'ManaPerLevel', 'LifePerVitality', 'StaminaPerVitality', 'ManaPerMagic', 'StatPerLevel',
        'SkillsPerLevel', 'LightRadius', 'BlockFactor', 'MinimumCastingDelay', 'StartSkill',
        'Skill1', 'Skill2', 'Skill3', 'Skill4', 'Skill5', 'Skill6', 'Skill7', 'Skill8',
        'Skill9', 'Skill10', 'StrAllSkills', 'StrSkillTab1', 'StrSkillTab2', 'StrSkillTab3',
        'StrClassOnly', 'HealthPotionPercent', 'ManaPotionPercent', 'baseWClass',
        'item1', 'item1loc', 'item1count', 'item1quality',
        'item2', 'item2loc', 'item2count', 'item2quality',
        'item3', 'item3loc', 'item3count', 'item3quality',
        'item4', 'item4loc', 'item4count', 'item4quality',
        'item5', 'item5loc', 'item5count', 'item5quality',
        'item6', 'item6loc', 'item6count', 'item6quality',
        'item7', 'item7loc', 'item7count', 'item7quality',
        'item8', 'item8loc', 'item8count', 'item8quality',
        'item9', 'item9loc', 'item9count', 'item9quality',
        'item10', 'item10loc', 'item10count', 'item10quality'
      ];

      // Crear el contenido del archivo
      let content = '';
      
      // Agregar header con nombres de columnas
      content += columns.join('\t') + '\n';
      
      // Separar héroes clásicos y de expansión, manteniendo el orden original por ID
      const classicHeroes = charStats
        .filter(hero => !hero.expansion)
        .sort((a, b) => a.id - b.id); // Ordenar por ID para mantener orden original
      
      const expansionHeroes = charStats
        .filter(hero => hero.expansion)
        .sort((a, b) => a.id - b.id); // Ordenar por ID para mantener orden original
      
      // Función para convertir un CharStat a línea de texto
      const charStatToLine = (charStat: CharStat): string => {
        const values: string[] = [];
        
        for (const column of columns) {
          const value = (charStat as any)[column];
          if (typeof value === 'number') {
            values.push(value.toString());
          } else if (typeof value === 'string') {
            values.push(value);
          } else {
            values.push('');
          }
        }
        
        return values.join('\t');
      };
      
      // Agregar héroes clásicos
      for (const hero of classicHeroes) {
        content += charStatToLine(hero) + '\n';
      }
      
      // Agregar línea "Expansion" si hay héroes de expansión
      if (expansionHeroes.length > 0) {
        const expansionLine = 'Expansion' + '\t'.repeat(columns.length - 1);
        content += expansionLine + '\n';
        
        // Agregar héroes de expansión
        for (const hero of expansionHeroes) {
          content += charStatToLine(hero) + '\n';
        }
      }
      
      // Escribir el archivo (sobrescribir el original)
      fs.writeFileSync(originalFilePath, content, 'utf-8');
      
      console.log(`✅ Archivo charstats.txt modificado exitosamente en: ${originalFilePath}`);
      console.log(`📊 Estadísticas: ${classicHeroes.length} héroes clásicos, ${expansionHeroes.length} héroes de expansión`);
      
      return originalFilePath;
    } catch (error) {
      console.error('❌ Error generando archivo charstatsmod.txt:', error);
      throw error;
    }
  }

  /**
   * Genera el archivo skills.txt modificado, creando una copia de seguridad del original
   */
  async generateModifiedSkillsFile(skills: Skill[], originalFilePath: string): Promise<string> {
    try {
      // Crear copia de seguridad del archivo original
      const backupFilePath = path.join(path.dirname(originalFilePath), 'skills_backup.txt');
      if (fs.existsSync(originalFilePath)) {
        fs.copyFileSync(originalFilePath, backupFilePath);
        console.log(`💾 Copia de seguridad creada: ${backupFilePath}`);
      }
      
      // Definir todas las 293 columnas del archivo skills.txt en el orden correcto
      const columns = [
        'skill', '*Id', 'charclass', 'skilldesc', 'srvstfunc', 'srvdofunc', 'srvstopfunc', 'prgstack',
        'srvprgfunc1', 'srvprgfunc2', 'srvprgfunc3', 'prgcalc1', 'prgcalc2', 'prgcalc3', 'prgdam',
        'srvmissile', 'decquant', 'lob', 'srvmissilea', 'srvmissileb', 'srvmissilec', 'useServerMissilesOnRemoteClients',
        'srvoverlay', 'aurafilter', 'aurastate', 'auratargetstate', 'auralencalc', 'aurarangecalc',
        'aurastat1', 'aurastatcalc1', 'aurastat2', 'aurastatcalc2', 'aurastat3', 'aurastatcalc3',
        'aurastat4', 'aurastatcalc4', 'aurastat5', 'aurastatcalc5', 'aurastat6', 'aurastatcalc6',
        'auraevent1', 'auraeventfunc1', 'auraevent2', 'auraeventfunc2', 'auraevent3', 'auraeventfunc3',
        'passivestate', 'passiveitype', 'passivereqweaponcount', 'passivestat1', 'passivecalc1',
        'passivestat2', 'passivecalc2', 'passivestat3', 'passivecalc3', 'passivestat4', 'passivecalc4',
        'passivestat5', 'passivecalc5', 'passivestat6', 'passivecalc6', 'passivestat7', 'passivecalc7',
        'passivestat8', 'passivecalc8', 'passivestat9', 'passivecalc9', 'passivestat10', 'passivecalc10',
        'passivestat11', 'passivecalc11', 'passivestat12', 'passivecalc12', 'passivestat13', 'passivecalc13',
        'passivestat14', 'passivecalc14', 'summon', 'pettype', 'petmax', 'summode', 'sumskill1', 'sumsk1calc',
        'sumskill2', 'sumsk2calc', 'sumskill3', 'sumsk3calc', 'sumskill4', 'sumsk4calc', 'sumskill5', 'sumsk5calc',
        'sumumod', 'sumoverlay', 'stsuccessonly', 'stsound', 'stsoundclass', 'stsounddelay', 'weaponsnd',
        'dosound', 'dosoundA', 'dosoundB', 'tgtoverlay', 'tgtsound', 'prgoverlay', 'prgsound', 'castoverlay',
        'cltoverlaya', 'cltoverlayb', 'cltstfunc', 'cltdofunc', 'cltstopfunc', 'cltprgfunc1', 'cltprgfunc2',
        'cltprgfunc3', 'cltmissile', 'cltmissilea', 'cltmissileb', 'cltmissilec', 'cltmissiled', 'cltcalc1',
        '*cltcalc1desc', 'cltcalc2', '*cltcalc2desc', 'cltcalc3', '*cltcalc3desc', 'warp', 'immediate',
        'enhanceable', 'attackrank', 'noammo', 'range', 'weapsel', 'itypea1', 'itypea2', 'itypea3',
        'etypea1', 'etypea2', 'itypeb1', 'itypeb2', 'itypeb3', 'etypeb1', 'etypeb2', 'anim', 'seqtrans',
        'monanim', 'seqnum', 'seqinput', 'durability', 'UseAttackRate', 'LineOfSight', 'TargetableOnly',
        'SearchEnemyXY', 'SearchEnemyNear', 'SearchOpenXY', 'SelectProc', 'TargetCorpse', 'TargetPet',
        'TargetAlly', 'TargetItem', 'AttackNoMana', 'TgtPlaceCheck', 'KeepCursorStateOnKill', 'ContinueCastUnselected',
        'ClearSelectedOnHold', 'ItemEffect', 'ItemCltEffect', 'ItemTgtDo', 'ItemTarget', 'ItemUseRestrict',
        'ItemCheckStart', 'ItemCltCheckStart', 'ItemCastSound', 'ItemCastOverlay', 'skpoints', 'reqlevel',
        'maxlvl', 'reqstr', 'reqdex', 'reqint', 'reqvit', 'reqskill1', 'reqskill2', 'reqskill3', 'restrict',
        'State1', 'State2', 'State3', 'localdelay', 'globaldelay', 'leftskill', 'rightskill', 'repeat',
        'alwayshit', 'usemanaondo', 'startmana', 'minmana', 'manashift', 'mana', 'lvlmana', 'interrupt',
        'InTown', 'aura', 'periodic', 'perdelay', 'finishing', 'prgchargestocast', 'prgchargesconsumed',
        'passive', 'progressive', 'scroll', 'calc1', '*calc1desc', 'calc2', '*calc2desc', 'calc3', '*calc3desc',
        'calc4', '*calc4desc', 'calc5', '*calc5desc', 'calc6', '*calc6desc', 'Param1', '*Param1Description',
        'Param2', '*Param2Description', 'Param3', '*Param3Description', 'Param4', '*Param4Description',
        'Param5', '*Param5Description', 'Param6', '*Param6Description', 'Param7', '*Param7Description',
        'Param8', '*Param8Description', 'Param9', '*Param9Description', 'Param10', '*Param10Description2',
        'Param11', '*Param11Description', 'Param12', '*Param12Description', 'InGame', 'ToHit', 'LevToHit',
        'ToHitCalc', 'ResultFlags', 'HitFlags', 'HitClass', 'Kick', 'HitShift', 'SrcDam', 'MinDam',
        'MinLevDam1', 'MinLevDam2', 'MinLevDam3', 'MinLevDam4', 'MinLevDam5', 'MaxDam', 'MaxLevDam1',
        'MaxLevDam2', 'MaxLevDam3', 'MaxLevDam4', 'MaxLevDam5', 'DmgSymPerCalc', 'EType', 'EMin',
        'EMinLev1', 'EMinLev2', 'EMinLev3', 'EMinLev4', 'EMinLev5', 'EMax', 'EMaxLev1', 'EMaxLev2',
        'EMaxLev3', 'EMaxLev4', 'EMaxLev5', 'EDmgSymPerCalc', 'ELen', 'ELevLen1', 'ELevLen2', 'ELevLen3',
        'ELenSymPerCalc', 'aitype', 'aibonus', 'costMult', 'costAdd', '*eol'
      ];

      // Crear el contenido del archivo
      let content = '';
      
      // Agregar header con nombres de columnas
      content += columns.join('\t') + '\n';
      
      // Ordenar skills por ID para mantener el orden original
      const sortedSkills = skills.sort((a, b) => a.id - b.id);
      
      // Función para convertir un Skill a línea de texto
      const skillToLine = (skill: Skill): string => {
        const values: string[] = [];
        
        // Mapear cada columna del skill a su valor correspondiente
        const fieldMap: { [key: string]: string } = {
          'skill': skill.skill,
          '*Id': skill.starId,
          'charclass': skill.charclass,
          'skilldesc': skill.skilldesc,
          'srvstfunc': skill.srvstfunc,
          'srvdofunc': skill.srvdofunc,
          'srvstopfunc': skill.srvstopfunc,
          'prgstack': skill.prgstack.toString(),
          'srvprgfunc1': skill.srvprgfunc1,
          'srvprgfunc2': skill.srvprgfunc2,
          'srvprgfunc3': skill.srvprgfunc3,
          'prgcalc1': skill.prgcalc1,
          'prgcalc2': skill.prgcalc2,
          'prgcalc3': skill.prgcalc3,
          'prgdam': skill.prgdam,
          'srvmissile': skill.srvmissile,
          'decquant': skill.decquant.toString(),
          'lob': skill.lob.toString(),
          'srvmissilea': skill.srvmissilea,
          'srvmissileb': skill.srvmissileb,
          'srvmissilec': skill.srvmissilec,
          'useServerMissilesOnRemoteClients': skill.useServerMissilesOnRemoteClients.toString(),
          'srvoverlay': skill.srvoverlay,
          'aurafilter': skill.aurafilter,
          'aurastate': skill.aurastate,
          'auratargetstate': skill.auratargetstate,
          'auralencalc': skill.auralencalc,
          'aurarangecalc': skill.aurarangecalc,
          'aurastat1': skill.aurastat1,
          'aurastatcalc1': skill.aurastatcalc1,
          'aurastat2': skill.aurastat2,
          'aurastatcalc2': skill.aurastatcalc2,
          'aurastat3': skill.aurastat3,
          'aurastatcalc3': skill.aurastatcalc3,
          'aurastat4': skill.aurastat4,
          'aurastatcalc4': skill.aurastatcalc4,
          'aurastat5': skill.aurastat5,
          'aurastatcalc5': skill.aurastatcalc5,
          'aurastat6': skill.aurastat6,
          'aurastatcalc6': skill.aurastatcalc6,
          'auraevent1': skill.auraevent1,
          'auraeventfunc1': skill.auraeventfunc1,
          'auraevent2': skill.auraevent2,
          'auraeventfunc2': skill.auraeventfunc2,
          'auraevent3': skill.auraevent3,
          'auraeventfunc3': skill.auraeventfunc3,
          'passivestate': skill.passivestate,
          'passiveitype': skill.passiveitype,
          'passivereqweaponcount': skill.passivereqweaponcount.toString(),
          'passivestat1': skill.passivestat1,
          'passivecalc1': skill.passivecalc1,
          'passivestat2': skill.passivestat2,
          'passivecalc2': skill.passivecalc2,
          'passivestat3': skill.passivestat3,
          'passivecalc3': skill.passivecalc3,
          'passivestat4': skill.passivestat4,
          'passivecalc4': skill.passivecalc4,
          'passivestat5': skill.passivestat5,
          'passivecalc5': skill.passivecalc5,
          'passivestat6': skill.passivestat6,
          'passivecalc6': skill.passivecalc6,
          'passivestat7': skill.passivestat7,
          'passivecalc7': skill.passivecalc7,
          'passivestat8': skill.passivestat8,
          'passivecalc8': skill.passivecalc8,
          'passivestat9': skill.passivestat9,
          'passivecalc9': skill.passivecalc9,
          'passivestat10': skill.passivestat10,
          'passivecalc10': skill.passivecalc10,
          'passivestat11': skill.passivestat11,
          'passivecalc11': skill.passivecalc11,
          'passivestat12': skill.passivestat12,
          'passivecalc12': skill.passivecalc12,
          'passivestat13': skill.passivestat13,
          'passivecalc13': skill.passivecalc13,
          'passivestat14': skill.passivestat14,
          'passivecalc14': skill.passivecalc14,
          'summon': skill.summon,
          'pettype': skill.pettype,
          'petmax': skill.petmax.toString(),
          'summode': skill.summode,
          'sumskill1': skill.sumskill1,
          'sumsk1calc': skill.sumsk1calc,
          'sumskill2': skill.sumskill2,
          'sumsk2calc': skill.sumsk2calc,
          'sumskill3': skill.sumskill3,
          'sumsk3calc': skill.sumsk3calc,
          'sumskill4': skill.sumskill4,
          'sumsk4calc': skill.sumsk4calc,
          'sumskill5': skill.sumskill5,
          'sumsk5calc': skill.sumsk5calc,
          'sumumod': skill.sumumod,
          'sumoverlay': skill.sumoverlay,
          'stsuccessonly': skill.stsuccessonly.toString(),
          'stsound': skill.stsound,
          'stsoundclass': skill.stsoundclass,
          'stsounddelay': skill.stsounddelay.toString(),
          'weaponsnd': skill.weaponsnd,
          'dosound': skill.dosound,
          'dosoundA': skill.dosoundA,
          'dosoundB': skill.dosoundB,
          'tgtoverlay': skill.tgtoverlay,
          'tgtsound': skill.tgtsound,
          'prgoverlay': skill.prgoverlay,
          'prgsound': skill.prgsound,
          'castoverlay': skill.castoverlay,
          'cltoverlaya': skill.cltoverlaya,
          'cltoverlayb': skill.cltoverlayb,
          'cltstfunc': skill.cltstfunc,
          'cltdofunc': skill.cltdofunc,
          'cltstopfunc': skill.cltstopfunc,
          'cltprgfunc1': skill.cltprgfunc1,
          'cltprgfunc2': skill.cltprgfunc2,
          'cltprgfunc3': skill.cltprgfunc3,
          'cltmissile': skill.cltmissile,
          'cltmissilea': skill.cltmissilea,
          'cltmissileb': skill.cltmissileb,
          'cltmissilec': skill.cltmissilec,
          'cltmissiled': skill.cltmissiled,
          'cltcalc1': skill.cltcalc1,
          '*cltcalc1desc': skill.starCltcalc1Desc,
          'cltcalc2': skill.cltcalc2,
          '*cltcalc2desc': skill.starCltcalc2Desc,
          'cltcalc3': skill.cltcalc3,
          '*cltcalc3desc': skill.starCltcalc3Desc,
          'warp': skill.warp.toString(),
          'immediate': skill.immediate.toString(),
          'enhanceable': skill.enhanceable.toString(),
          'attackrank': skill.attackrank.toString(),
          'noammo': skill.noammo.toString(),
          'range': skill.range.toString(),
          'weapsel': skill.weapsel.toString(),
          'itypea1': skill.itypea1,
          'itypea2': skill.itypea2,
          'itypea3': skill.itypea3,
          'etypea1': skill.etypea1,
          'etypea2': skill.etypea2,
          'itypeb1': skill.itypeb1,
          'itypeb2': skill.itypeb2,
          'itypeb3': skill.itypeb3,
          'etypeb1': skill.etypeb1,
          'etypeb2': skill.etypeb2,
          'anim': skill.anim,
          'seqtrans': skill.seqtrans,
          'monanim': skill.monanim,
          'seqnum': skill.seqnum.toString(),
          'seqinput': skill.seqinput.toString(),
          'durability': skill.durability.toString(),
          'UseAttackRate': skill.UseAttackRate.toString(),
          'LineOfSight': skill.LineOfSight.toString(),
          'TargetableOnly': skill.TargetableOnly.toString(),
          'SearchEnemyXY': skill.SearchEnemyXY.toString(),
          'SearchEnemyNear': skill.SearchEnemyNear.toString(),
          'SearchOpenXY': skill.SearchOpenXY.toString(),
          'SelectProc': skill.SelectProc.toString(),
          'TargetCorpse': skill.TargetCorpse.toString(),
          'TargetPet': skill.TargetPet.toString(),
          'TargetAlly': skill.TargetAlly.toString(),
          'TargetItem': skill.TargetItem.toString(),
          'AttackNoMana': skill.AttackNoMana.toString(),
          'TgtPlaceCheck': skill.TgtPlaceCheck.toString(),
          'KeepCursorStateOnKill': skill.KeepCursorStateOnKill.toString(),
          'ContinueCastUnselected': skill.ContinueCastUnselected.toString(),
          'ClearSelectedOnHold': skill.ClearSelectedOnHold.toString(),
          'ItemEffect': skill.ItemEffect.toString(),
          'ItemCltEffect': skill.ItemCltEffect.toString(),
          'ItemTgtDo': skill.ItemTgtDo.toString(),
          'ItemTarget': skill.ItemTarget.toString(),
          'ItemUseRestrict': skill.ItemUseRestrict.toString(),
          'ItemCheckStart': skill.ItemCheckStart.toString(),
          'ItemCltCheckStart': skill.ItemCltCheckStart.toString(),
          'ItemCastSound': skill.ItemCastSound,
          'ItemCastOverlay': skill.ItemCastOverlay,
          'skpoints': skill.skpoints.toString(),
          'reqlevel': skill.reqlevel.toString(),
          'maxlvl': skill.maxlvl.toString(),
          'reqstr': skill.reqstr.toString(),
          'reqdex': skill.reqdex.toString(),
          'reqint': skill.reqint.toString(),
          'reqvit': skill.reqvit.toString(),
          'reqskill1': skill.reqskill1,
          'reqskill2': skill.reqskill2,
          'reqskill3': skill.reqskill3,
          'restrict': skill.restrict,
          'State1': skill.State1,
          'State2': skill.State2,
          'State3': skill.State3,
          'localdelay': skill.localdelay.toString(),
          'globaldelay': skill.globaldelay.toString(),
          'leftskill': skill.leftskill.toString(),
          'rightskill': skill.rightskill.toString(),
          'repeat': skill.repeat.toString(),
          'alwayshit': skill.alwayshit.toString(),
          'usemanaondo': skill.usemanaondo.toString(),
          'startmana': skill.startmana.toString(),
          'minmana': skill.minmana.toString(),
          'manashift': skill.manashift.toString(),
          'mana': skill.mana.toString(),
          'lvlmana': skill.lvlmana.toString(),
          'interrupt': skill.interrupt.toString(),
          'InTown': skill.InTown.toString(),
          'aura': skill.aura.toString(),
          'periodic': skill.periodic.toString(),
          'perdelay': skill.perdelay.toString(),
          'finishing': skill.finishing.toString(),
          'prgchargestocast': skill.prgchargestocast.toString(),
          'prgchargesconsumed': skill.prgchargesconsumed.toString(),
          'passive': skill.passive.toString(),
          'progressive': skill.progressive.toString(),
          'scroll': skill.scroll.toString(),
          'calc1': skill.calc1,
          '*calc1desc': skill.starCalc1Desc,
          'calc2': skill.calc2,
          '*calc2desc': skill.starCalc2Desc,
          'calc3': skill.calc3,
          '*calc3desc': skill.starCalc3Desc,
          'calc4': skill.calc4,
          '*calc4desc': skill.starCalc4Desc,
          'calc5': skill.calc5,
          '*calc5desc': skill.starCalc5Desc,
          'calc6': skill.calc6,
          '*calc6desc': skill.starCalc6Desc,
          'Param1': skill.Param1,
          '*Param1Description': skill.starParam1Description,
          'Param2': skill.Param2,
          '*Param2Description': skill.starParam2Description,
          'Param3': skill.Param3,
          '*Param3Description': skill.starParam3Description,
          'Param4': skill.Param4,
          '*Param4Description': skill.starParam4Description,
          'Param5': skill.Param5,
          '*Param5Description': skill.starParam5Description,
          'Param6': skill.Param6,
          '*Param6Description': skill.starParam6Description,
          'Param7': skill.Param7,
          '*Param7Description': skill.starParam7Description,
          'Param8': skill.Param8,
          '*Param8Description': skill.starParam8Description,
          'Param9': skill.Param9,
          '*Param9Description': skill.starParam9Description,
          'Param10': skill.Param10,
          '*Param10Description2': skill.starParam10Description2,
          'Param11': skill.Param11,
          '*Param11Description': skill.starParam11Description,
          'Param12': skill.Param12,
          '*Param12Description': skill.starParam12Description,
          'InGame': skill.InGame.toString(),
          'ToHit': skill.ToHit,
          'LevToHit': skill.LevToHit,
          'ToHitCalc': skill.ToHitCalc,
          'ResultFlags': skill.ResultFlags.toString(),
          'HitFlags': skill.HitFlags.toString(),
          'HitClass': skill.HitClass.toString(),
          'Kick': skill.Kick.toString(),
          'HitShift': skill.HitShift.toString(),
          'SrcDam': skill.SrcDam.toString(),
          'MinDam': skill.MinDam,
          'MinLevDam1': skill.MinLevDam1,
          'MinLevDam2': skill.MinLevDam2,
          'MinLevDam3': skill.MinLevDam3,
          'MinLevDam4': skill.MinLevDam4,
          'MinLevDam5': skill.MinLevDam5,
          'MaxDam': skill.MaxDam,
          'MaxLevDam1': skill.MaxLevDam1,
          'MaxLevDam2': skill.MaxLevDam2,
          'MaxLevDam3': skill.MaxLevDam3,
          'MaxLevDam4': skill.MaxLevDam4,
          'MaxLevDam5': skill.MaxLevDam5,
          'DmgSymPerCalc': skill.DmgSymPerCalc,
          'EType': skill.EType,
          'EMin': skill.EMin,
          'EMinLev1': skill.EMinLev1,
          'EMinLev2': skill.EMinLev2,
          'EMinLev3': skill.EMinLev3,
          'EMinLev4': skill.EMinLev4,
          'EMinLev5': skill.EMinLev5,
          'EMax': skill.EMax,
          'EMaxLev1': skill.EMaxLev1,
          'EMaxLev2': skill.EMaxLev2,
          'EMaxLev3': skill.EMaxLev3,
          'EMaxLev4': skill.EMaxLev4,
          'EMaxLev5': skill.EMaxLev5,
          'EDmgSymPerCalc': skill.EDmgSymPerCalc,
          'ELen': skill.ELen,
          'ELevLen1': skill.ELevLen1,
          'ELevLen2': skill.ELevLen2,
          'ELevLen3': skill.ELevLen3,
          'ELenSymPerCalc': skill.ELenSymPerCalc,
          'aitype': skill.aitype.toString(),
          'aibonus': skill.aibonus,
          'costMult': skill.costMult.toString(),
          'costAdd': skill.costAdd.toString(),
          '*eol': skill.starEol
        };
        
        for (const column of columns) {
          const value = fieldMap[column] || '';
          values.push(value);
        }
        
        return values.join('\t');
      };
      
      // Agregar todas las skills
      for (const skill of sortedSkills) {
        content += skillToLine(skill) + '\n';
      }
      
      // Escribir el archivo (sobrescribir el original)
      fs.writeFileSync(originalFilePath, content, 'utf-8');
      
      console.log(`✅ Archivo skills.txt modificado exitosamente en: ${originalFilePath}`);
      console.log(`📊 Skills modificadas: ${sortedSkills.length} registros`);
      
      return originalFilePath;
    } catch (error) {
      console.error('❌ Error generando archivo skills.txt:', error);
      throw error;
    }
  }

  /**
   * Busca y retorna la ruta del archivo charstats.txt en la carpeta del mod
   */
  async findCharStatsFile(modFolderPath: string): Promise<string | null> {
    try {
      console.log(`🔍 Buscando archivo charstats.txt en: ${modFolderPath}`);
      
      const modFolderName = path.basename(modFolderPath);
      const excelPath = path.join(modFolderPath, `${modFolderName}.mpq`, 'data', 'global', 'excel');
      
      if (!fs.existsSync(excelPath)) {
        console.log(`❌ Ruta excel no existe: ${excelPath}`);
        return null;
      }
      
      const charStatsPath = path.join(excelPath, 'charstats.txt');
      
      if (fs.existsSync(charStatsPath)) {
        console.log(`✅ Archivo charstats.txt encontrado: ${charStatsPath}`);
        return charStatsPath;
      } else {
        console.log(`❌ Archivo charstats.txt no encontrado en: ${charStatsPath}`);
        return null;
      }
    } catch (error) {
      console.error('❌ Error buscando archivo charstats.txt:', error);
      return null;
    }
  }
}

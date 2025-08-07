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
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length === 0) {
        throw new Error('El archivo skills.txt está vacío');
      }

      // La primera línea debería ser el header con los nombres de las columnas
      const headers = lines[0].split('\t');
      const skills: Skill[] = [];
      let isExpansion = false;

      console.log(`📋 Headers encontrados en skills.txt: ${headers.length} columnas`);

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
          console.log('🔄 Detectada línea "Expansion" en skills.txt - Cambiando modo a expansion=true');
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

        } catch (error) {
          console.error(`❌ Error procesando línea ${i + 1} en skills.txt:`, error);
          console.error(`Línea problemática: ${line}`);
          continue; // Continuar con la siguiente línea
        }
      }

      console.log(`✅ Skills.txt parseado exitosamente: ${skills.length} skills procesadas`);
      return skills;

    } catch (error) {
      console.error('❌ Error leyendo skills.txt:', error);
      throw error;
    }
  }

  /**
   * Genera el archivo charstatsmod.txt con los cambios aplicados
   */
  async generateModifiedCharStatsFile(charStats: CharStat[], originalFilePath: string): Promise<string> {
    try {
      const modFilePath = path.join(path.dirname(originalFilePath), 'charstatsmod.txt');
      
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
      
      // Escribir el archivo
      fs.writeFileSync(modFilePath, content, 'utf-8');
      
      console.log(`✅ Archivo charstatsmod.txt generado exitosamente en: ${modFilePath}`);
      console.log(`📊 Estadísticas: ${classicHeroes.length} héroes clásicos, ${expansionHeroes.length} héroes de expansión`);
      
      return modFilePath;
    } catch (error) {
      console.error('❌ Error generando archivo charstatsmod.txt:', error);
      throw error;
    }
  }
}

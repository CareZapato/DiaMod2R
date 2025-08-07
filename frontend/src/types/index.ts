export interface Mod {
  id: number;
  name: string;
  folderPath: string;
  createdAt: string;
  updatedAt: string;
  charStats?: CharStat[];
}

export interface CharStat {
  id: number;
  class: string;
  str: number;
  dex: number;
  int: number;
  vit: number;
  stamina: number;
  hpadd: number;
  ManaRegen: number;
  ToHitFactor: number;
  WalkVelocity: number;
  RunVelocity: number;
  RunDrain: number;
  Comment: string;
  LifePerLevel: number;
  StaminaPerLevel: number;
  ManaPerLevel: number;
  LifePerVitality: number;
  StaminaPerVitality: number;
  ManaPerMagic: number;
  StatPerLevel: number;
  SkillsPerLevel: number;
  LightRadius: number;
  BlockFactor: number;
  MinimumCastingDelay: number;
  StartSkill: string;
  skillId?: number; // ID de la skill inicial
  startSkillReference?: Skill; // Relación con la skill
  Skill1: string;
  Skill2: string;
  Skill3: string;
  Skill4: string;
  Skill5: string;
  Skill6: string;
  Skill7: string;
  Skill8: string;
  Skill9: string;
  Skill10: string;
  StrAllSkills: string;
  StrSkillTab1: string;
  StrSkillTab2: string;
  StrSkillTab3: string;
  StrClassOnly: string;
  HealthPotionPercent: number;
  ManaPotionPercent: number;
  baseWClass: string;
  item1: string;
  item1loc: string;
  item1count: number;
  item1quality: number;
  item2: string;
  item2loc: string;
  item2count: number;
  item2quality: number;
  item3: string;
  item3loc: string;
  item3count: number;
  item3quality: number;
  item4: string;
  item4loc: string;
  item4count: number;
  item4quality: number;
  item5: string;
  item5loc: string;
  item5count: number;
  item5quality: number;
  item6: string;
  item6loc: string;
  item6count: number;
  item6quality: number;
  item7: string;
  item7loc: string;
  item7count: number;
  item7quality: number;
  item8: string;
  item8loc: string;
  item8count: number;
  item8quality: number;
  item9: string;
  item9loc: string;
  item9count: number;
  item9quality: number;
  item10: string;
  item10loc: string;
  item10count: number;
  item10quality: number;
  expansion: boolean;
  modId: number;
}

export interface FileInfo {
  name: string;
  path: string;
}

export interface Skill {
  id: number;
  skill: string;
  starId: string; // *Id del archivo
  charclass: string;
  skilldesc: string;
  modId: number;
  modName: string;
  reqlevel: number; // Nivel requerido
  maxlvl: number; // Nivel máximo
  // Se pueden agregar más campos según necesidad
}

export interface ProcessModResponse {
  success: boolean;
  message?: string;
  data?: {
    mod: Mod;
    filesFound: number;
    charStatsProcessed: number;
    skillsProcessed: number;
    files: string[];
    enabledSections: string[]; // Secciones que deben habilitarse
  };
  error?: string;
  details?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

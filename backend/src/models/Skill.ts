import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Mod } from './Mod';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Mod, { eager: false })
  @JoinColumn({ name: 'mod_id' })
  mod!: Mod;

  @Column({ name: 'mod_id' })
  modId!: number;

  // Todas las columnas del archivo skills.txt (290 columnas)
  // Las columnas con * se nombran con prefijo star_ para PostgreSQL
  
  @Column({ type: 'varchar', length: 255, default: '' })
  skill!: string;

  @Column({ name: 'star_id', type: 'varchar', length: 255, default: '' })
  starId!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  charclass!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  skilldesc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  srvstfunc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  srvdofunc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  srvstopfunc!: string;

  @Column({ type: 'integer', default: 0 })
  prgstack!: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  srvprgfunc1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  srvprgfunc2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  srvprgfunc3!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  prgcalc1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  prgcalc2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  prgcalc3!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  prgdam!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  srvmissile!: string;

  @Column({ type: 'integer', default: 0 })
  decquant!: number;

  @Column({ type: 'integer', default: 0 })
  lob!: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  srvmissilea!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  srvmissileb!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  srvmissilec!: string;

  @Column({ type: 'integer', default: 0 })
  useServerMissilesOnRemoteClients!: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  srvoverlay!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  aurafilter!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  aurastate!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  auratargetstate!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  auralencalc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  aurarangecalc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  aurastat1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  aurastatcalc1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  aurastat2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  aurastatcalc2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  aurastat3!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  aurastatcalc3!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  aurastat4!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  aurastatcalc4!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  aurastat5!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  aurastatcalc5!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  aurastat6!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  aurastatcalc6!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  auraevent1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  auraeventfunc1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  auraevent2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  auraeventfunc2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  auraevent3!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  auraeventfunc3!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivestate!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passiveitype!: string;

  @Column({ type: 'integer', default: 0 })
  passivereqweaponcount!: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivestat1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivecalc1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivestat2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivecalc2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivestat3!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivecalc3!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivestat4!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivecalc4!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivestat5!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivecalc5!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivestat6!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivecalc6!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivestat7!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivecalc7!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivestat8!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivecalc8!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivestat9!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivecalc9!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivestat10!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivecalc10!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivestat11!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivecalc11!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivestat12!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivecalc12!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivestat13!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivecalc13!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivestat14!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  passivecalc14!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  summon!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  pettype!: string;

  @Column({ type: 'integer', default: 0 })
  petmax!: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  summode!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  sumskill1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  sumsk1calc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  sumskill2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  sumsk2calc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  sumskill3!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  sumsk3calc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  sumskill4!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  sumsk4calc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  sumskill5!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  sumsk5calc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  sumumod!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  sumoverlay!: string;

  @Column({ type: 'integer', default: 0 })
  stsuccessonly!: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  stsound!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  stsoundclass!: string;

  @Column({ type: 'integer', default: 0 })
  stsounddelay!: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  weaponsnd!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  dosound!: string;

  @Column({ name: 'dosound_a', type: 'varchar', length: 255, default: '' })
  dosoundA!: string;

  @Column({ name: 'dosound_b', type: 'varchar', length: 255, default: '' })
  dosoundB!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  tgtoverlay!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  tgtsound!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  prgoverlay!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  prgsound!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  castoverlay!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  cltoverlaya!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  cltoverlayb!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  cltstfunc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  cltdofunc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  cltstopfunc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  cltprgfunc1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  cltprgfunc2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  cltprgfunc3!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  cltmissile!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  cltmissilea!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  cltmissileb!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  cltmissilec!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  cltmissiled!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  cltcalc1!: string;

  @Column({ name: 'star_cltcalc1_desc', type: 'varchar', length: 255, default: '' })
  starCltcalc1Desc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  cltcalc2!: string;

  @Column({ name: 'star_cltcalc2_desc', type: 'varchar', length: 255, default: '' })
  starCltcalc2Desc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  cltcalc3!: string;

  @Column({ name: 'star_cltcalc3_desc', type: 'varchar', length: 255, default: '' })
  starCltcalc3Desc!: string;

  @Column({ type: 'integer', default: 0 })
  warp!: number;

  @Column({ type: 'integer', default: 0 })
  immediate!: number;

  @Column({ type: 'integer', default: 0 })
  enhanceable!: number;

  @Column({ type: 'integer', default: 0 })
  attackrank!: number;

  @Column({ type: 'integer', default: 0 })
  noammo!: number;

  @Column({ type: 'integer', default: 0 })
  range!: number;

  @Column({ type: 'integer', default: 0 })
  weapsel!: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  itypea1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  itypea2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  itypea3!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  etypea1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  etypea2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  itypeb1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  itypeb2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  itypeb3!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  etypeb1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  etypeb2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  anim!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  seqtrans!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  monanim!: string;

  @Column({ type: 'integer', default: 0 })
  seqnum!: number;

  @Column({ type: 'integer', default: 0 })
  seqinput!: number;

  @Column({ type: 'integer', default: 0 })
  durability!: number;

  @Column({ type: 'integer', default: 0 })
  UseAttackRate!: number;

  @Column({ type: 'integer', default: 0 })
  LineOfSight!: number;

  @Column({ type: 'integer', default: 0 })
  TargetableOnly!: number;

  @Column({ type: 'integer', default: 0 })
  SearchEnemyXY!: number;

  @Column({ type: 'integer', default: 0 })
  SearchEnemyNear!: number;

  @Column({ type: 'integer', default: 0 })
  SearchOpenXY!: number;

  @Column({ type: 'integer', default: 0 })
  SelectProc!: number;

  @Column({ type: 'integer', default: 0 })
  TargetCorpse!: number;

  @Column({ type: 'integer', default: 0 })
  TargetPet!: number;

  @Column({ type: 'integer', default: 0 })
  TargetAlly!: number;

  @Column({ type: 'integer', default: 0 })
  TargetItem!: number;

  @Column({ type: 'integer', default: 0 })
  AttackNoMana!: number;

  @Column({ type: 'integer', default: 0 })
  TgtPlaceCheck!: number;

  @Column({ type: 'integer', default: 0 })
  KeepCursorStateOnKill!: number;

  @Column({ type: 'integer', default: 0 })
  ContinueCastUnselected!: number;

  @Column({ type: 'integer', default: 0 })
  ClearSelectedOnHold!: number;

  @Column({ type: 'integer', default: 0 })
  ItemEffect!: number;

  @Column({ type: 'integer', default: 0 })
  ItemCltEffect!: number;

  @Column({ type: 'integer', default: 0 })
  ItemTgtDo!: number;

  @Column({ type: 'integer', default: 0 })
  ItemTarget!: number;

  @Column({ type: 'integer', default: 0 })
  ItemUseRestrict!: number;

  @Column({ type: 'integer', default: 0 })
  ItemCheckStart!: number;

  @Column({ type: 'integer', default: 0 })
  ItemCltCheckStart!: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  ItemCastSound!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  ItemCastOverlay!: string;

  @Column({ type: 'integer', default: 0 })
  skpoints!: number;

  @Column({ type: 'integer', default: 0 })
  reqlevel!: number;

  @Column({ type: 'integer', default: 0 })
  maxlvl!: number;

  @Column({ type: 'integer', default: 0 })
  reqstr!: number;

  @Column({ type: 'integer', default: 0 })
  reqdex!: number;

  @Column({ type: 'integer', default: 0 })
  reqint!: number;

  @Column({ type: 'integer', default: 0 })
  reqvit!: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  reqskill1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  reqskill2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  reqskill3!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  restrict!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  State1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  State2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  State3!: string;

  @Column({ type: 'integer', default: 0 })
  localdelay!: number;

  @Column({ type: 'integer', default: 0 })
  globaldelay!: number;

  @Column({ type: 'integer', default: 0 })
  leftskill!: number;

  @Column({ type: 'integer', default: 0 })
  rightskill!: number;

  @Column({ type: 'integer', default: 0 })
  repeat!: number;

  @Column({ type: 'integer', default: 0 })
  alwayshit!: number;

  @Column({ type: 'integer', default: 0 })
  usemanaondo!: number;

  @Column({ type: 'integer', default: 0 })
  startmana!: number;

  @Column({ type: 'integer', default: 0 })
  minmana!: number;

  @Column({ type: 'integer', default: 0 })
  manashift!: number;

  @Column({ type: 'integer', default: 0 })
  mana!: number;

  @Column({ type: 'integer', default: 0 })
  lvlmana!: number;

  @Column({ type: 'integer', default: 0 })
  interrupt!: number;

  @Column({ type: 'integer', default: 0 })
  InTown!: number;

  @Column({ type: 'integer', default: 0 })
  aura!: number;

  @Column({ type: 'integer', default: 0 })
  periodic!: number;

  @Column({ type: 'integer', default: 0 })
  perdelay!: number;

  @Column({ type: 'integer', default: 0 })
  finishing!: number;

  @Column({ type: 'integer', default: 0 })
  prgchargestocast!: number;

  @Column({ type: 'integer', default: 0 })
  prgchargesconsumed!: number;

  @Column({ type: 'integer', default: 0 })
  passive!: number;

  @Column({ type: 'integer', default: 0 })
  progressive!: number;

  @Column({ type: 'integer', default: 0 })
  scroll!: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  calc1!: string;

  @Column({ name: 'star_calc1_desc', type: 'varchar', length: 255, default: '' })
  starCalc1Desc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  calc2!: string;

  @Column({ name: 'star_calc2_desc', type: 'varchar', length: 255, default: '' })
  starCalc2Desc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  calc3!: string;

  @Column({ name: 'star_calc3_desc', type: 'varchar', length: 255, default: '' })
  starCalc3Desc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  calc4!: string;

  @Column({ name: 'star_calc4_desc', type: 'varchar', length: 255, default: '' })
  starCalc4Desc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  calc5!: string;

  @Column({ name: 'star_calc5_desc', type: 'varchar', length: 255, default: '' })
  starCalc5Desc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  calc6!: string;

  @Column({ name: 'star_calc6_desc', type: 'varchar', length: 255, default: '' })
  starCalc6Desc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  Param1!: string;

  @Column({ name: 'star_param1_description', type: 'varchar', length: 255, default: '' })
  starParam1Description!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  Param2!: string;

  @Column({ name: 'star_param2_description', type: 'varchar', length: 255, default: '' })
  starParam2Description!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  Param3!: string;

  @Column({ name: 'star_param3_description', type: 'varchar', length: 255, default: '' })
  starParam3Description!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  Param4!: string;

  @Column({ name: 'star_param4_description', type: 'varchar', length: 255, default: '' })
  starParam4Description!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  Param5!: string;

  @Column({ name: 'star_param5_description', type: 'varchar', length: 255, default: '' })
  starParam5Description!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  Param6!: string;

  @Column({ name: 'star_param6_description', type: 'varchar', length: 255, default: '' })
  starParam6Description!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  Param7!: string;

  @Column({ name: 'star_param7_description', type: 'varchar', length: 255, default: '' })
  starParam7Description!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  Param8!: string;

  @Column({ name: 'star_param8_description', type: 'varchar', length: 255, default: '' })
  starParam8Description!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  Param9!: string;

  @Column({ name: 'star_param9_description', type: 'varchar', length: 255, default: '' })
  starParam9Description!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  Param10!: string;

  @Column({ name: 'star_param10_description2', type: 'varchar', length: 255, default: '' })
  starParam10Description2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  Param11!: string;

  @Column({ name: 'star_param11_description', type: 'varchar', length: 255, default: '' })
  starParam11Description!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  Param12!: string;

  @Column({ name: 'star_param12_description', type: 'varchar', length: 255, default: '' })
  starParam12Description!: string;

  @Column({ type: 'integer', default: 0 })
  InGame!: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  ToHit!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  LevToHit!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  ToHitCalc!: string;

  @Column({ type: 'integer', default: 0 })
  ResultFlags!: number;

  @Column({ type: 'integer', default: 0 })
  HitFlags!: number;

  @Column({ type: 'integer', default: 0 })
  HitClass!: number;

  @Column({ type: 'integer', default: 0 })
  Kick!: number;

  @Column({ type: 'integer', default: 0 })
  HitShift!: number;

  @Column({ type: 'integer', default: 0 })
  SrcDam!: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  MinDam!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  MinLevDam1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  MinLevDam2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  MinLevDam3!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  MinLevDam4!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  MinLevDam5!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  MaxDam!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  MaxLevDam1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  MaxLevDam2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  MaxLevDam3!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  MaxLevDam4!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  MaxLevDam5!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  DmgSymPerCalc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  EType!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  EMin!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  EMinLev1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  EMinLev2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  EMinLev3!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  EMinLev4!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  EMinLev5!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  EMax!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  EMaxLev1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  EMaxLev2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  EMaxLev3!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  EMaxLev4!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  EMaxLev5!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  EDmgSymPerCalc!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  ELen!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  ELevLen1!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  ELevLen2!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  ELevLen3!: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  ELenSymPerCalc!: string;

  @Column({ type: 'integer', default: 0 })
  aitype!: number;

  @Column({ type: 'varchar', length: 255, default: '' })
  aibonus!: string;

  @Column({ name: 'cost_mult', type: 'integer', default: 0 })
  costMult!: number;

  @Column({ name: 'cost_add', type: 'integer', default: 0 })
  costAdd!: number;

  @Column({ name: 'star_eol', type: 'varchar', length: 255, default: '' })
  starEol!: string;
}

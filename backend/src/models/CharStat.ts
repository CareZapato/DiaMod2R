import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Mod } from './Mod';
import { Skill } from './Skill';

@Entity('charstats')
export class CharStat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  class: string;

  @Column('int')
  str: number;

  @Column('int')
  dex: number;

  @Column('int')
  int: number;

  @Column('int')
  vit: number;

  @Column('int')
  stamina: number;

  @Column('int')
  hpadd: number;

  @Column('int')
  ManaRegen: number;

  @Column('int')
  ToHitFactor: number;

  @Column('int')
  WalkVelocity: number;

  @Column('int')
  RunVelocity: number;

  @Column('int')
  RunDrain: number;

  @Column({ nullable: true })
  Comment: string;

  @Column('int')
  LifePerLevel: number;

  @Column('int')
  StaminaPerLevel: number;

  @Column('int')
  ManaPerLevel: number;

  @Column('int')
  LifePerVitality: number;

  @Column('int')
  StaminaPerVitality: number;

  @Column('int')
  ManaPerMagic: number;

  @Column('int')
  StatPerLevel: number;

  @Column('int')
  SkillsPerLevel: number;

  @Column('int')
  LightRadius: number;

  @Column('int')
  BlockFactor: number;

  @Column('int')
  MinimumCastingDelay: number;

  @Column({ nullable: true })
  StartSkill: string;

  @ManyToOne(() => Skill, { eager: false, nullable: true })
  @JoinColumn({ name: 'skill_id' })
  startSkillReference?: Skill;

  @Column({ name: 'skill_id', nullable: true })
  skillId?: number;

  @Column({ nullable: true })
  Skill1: string;

  @Column({ nullable: true })
  Skill2: string;

  @Column({ nullable: true })
  Skill3: string;

  @Column({ nullable: true })
  Skill4: string;

  @Column({ nullable: true })
  Skill5: string;

  @Column({ nullable: true })
  Skill6: string;

  @Column({ nullable: true })
  Skill7: string;

  @Column({ nullable: true })
  Skill8: string;

  @Column({ nullable: true })
  Skill9: string;

  @Column({ nullable: true })
  Skill10: string;

  @Column({ nullable: true })
  StrAllSkills: string;

  @Column({ nullable: true })
  StrSkillTab1: string;

  @Column({ nullable: true })
  StrSkillTab2: string;

  @Column({ nullable: true })
  StrSkillTab3: string;

  @Column({ nullable: true })
  StrClassOnly: string;

  @Column('int')
  HealthPotionPercent: number;

  @Column('int')
  ManaPotionPercent: number;

  @Column({ nullable: true })
  baseWClass: string;

  @Column({ nullable: true })
  item1: string;

  @Column({ nullable: true })
  item1loc: string;

  @Column('int', { nullable: true })
  item1count: number;

  @Column('int', { nullable: true })
  item1quality: number;

  @Column({ nullable: true })
  item2: string;

  @Column({ nullable: true })
  item2loc: string;

  @Column('int', { nullable: true })
  item2count: number;

  @Column('int', { nullable: true })
  item2quality: number;

  @Column({ nullable: true })
  item3: string;

  @Column({ nullable: true })
  item3loc: string;

  @Column('int', { nullable: true })
  item3count: number;

  @Column('int', { nullable: true })
  item3quality: number;

  @Column({ nullable: true })
  item4: string;

  @Column({ nullable: true })
  item4loc: string;

  @Column('int', { nullable: true })
  item4count: number;

  @Column('int', { nullable: true })
  item4quality: number;

  @Column({ nullable: true })
  item5: string;

  @Column({ nullable: true })
  item5loc: string;

  @Column('int', { nullable: true })
  item5count: number;

  @Column('int', { nullable: true })
  item5quality: number;

  @Column({ nullable: true })
  item6: string;

  @Column({ nullable: true })
  item6loc: string;

  @Column('int', { nullable: true })
  item6count: number;

  @Column('int', { nullable: true })
  item6quality: number;

  @Column({ nullable: true })
  item7: string;

  @Column({ nullable: true })
  item7loc: string;

  @Column('int', { nullable: true })
  item7count: number;

  @Column('int', { nullable: true })
  item7quality: number;

  @Column({ nullable: true })
  item8: string;

  @Column({ nullable: true })
  item8loc: string;

  @Column('int', { nullable: true })
  item8count: number;

  @Column('int', { nullable: true })
  item8quality: number;

  @Column({ nullable: true })
  item9: string;

  @Column({ nullable: true })
  item9loc: string;

  @Column('int', { nullable: true })
  item9count: number;

  @Column('int', { nullable: true })
  item9quality: number;

  @Column({ nullable: true })
  item10: string;

  @Column({ nullable: true })
  item10loc: string;

  @Column('int', { nullable: true })
  item10count: number;

  @Column('int', { nullable: true })
  item10quality: number;

  @Column('boolean', { default: false })
  expansion: boolean;

  @ManyToOne(() => Mod, mod => mod.charStats)
  @JoinColumn({ name: 'modId' })
  mod: Mod;

  @Column()
  modId: number;
}

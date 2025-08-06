import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Skill } from '../models/Skill';

export class SkillRepository {
  private repository: Repository<Skill>;

  constructor() {
    this.repository = AppDataSource.getRepository(Skill);
  }

  async save(skill: Skill): Promise<Skill> {
    return await this.repository.save(skill);
  }

  async saveMany(skills: Skill[]): Promise<Skill[]> {
    // PostgreSQL tiene límite de parámetros por consulta (~65k)
    // Con 295 columnas por skill, limitamos a 50 skills por lote para estar seguros
    const BATCH_SIZE = 50;
    const savedSkills: Skill[] = [];

    console.log(`💾 Guardando ${skills.length} skills en lotes de ${BATCH_SIZE}...`);

    for (let i = 0; i < skills.length; i += BATCH_SIZE) {
      const batch = skills.slice(i, i + BATCH_SIZE);
      console.log(`📦 Procesando lote ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(skills.length/BATCH_SIZE)} (${batch.length} skills)`);
      
      try {
        const batchResult = await this.repository.save(batch);
        savedSkills.push(...batchResult);
      } catch (error) {
        console.error(`❌ Error guardando lote ${Math.floor(i/BATCH_SIZE) + 1}:`, error);
        throw error;
      }
    }

    console.log(`✅ Todas las skills guardadas exitosamente: ${savedSkills.length} registros`);
    return savedSkills;
  }

  async findAll(): Promise<Skill[]> {
    return await this.repository.find({
      relations: ['mod']
    });
  }

  async findById(id: number): Promise<Skill | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['mod']
    });
  }

  async findByModId(modId: number): Promise<Skill[]> {
    return await this.repository.find({
      where: { modId },
      relations: ['mod'],
      order: { id: 'ASC' } // Mantener orden original
    });
  }

  async findBySkillName(skillName: string): Promise<Skill | null> {
    return await this.repository
      .createQueryBuilder('skill')
      .where('LOWER(skill.skill) = LOWER(:skillName)', { skillName })
      .getOne();
  }

  async deleteByModId(modId: number): Promise<void> {
    await this.repository.delete({ modId });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

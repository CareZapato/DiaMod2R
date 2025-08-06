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
    return await this.repository.save(skills);
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

  async deleteByModId(modId: number): Promise<void> {
    await this.repository.delete({ modId });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

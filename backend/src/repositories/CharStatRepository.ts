import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { CharStat } from '../models/CharStat';

export class CharStatRepository {
  private repository: Repository<CharStat>;

  constructor() {
    this.repository = AppDataSource.getRepository(CharStat);
  }

  async save(charStat: CharStat): Promise<CharStat> {
    return await this.repository.save(charStat);
  }

  async saveMany(charStats: CharStat[]): Promise<CharStat[]> {
    return await this.repository.save(charStats);
  }

  async findByModId(modId: number): Promise<CharStat[]> {
    return await this.repository.find({ 
      where: { modId },
      relations: ['mod']
    });
  }

  async findById(id: number): Promise<CharStat | null> {
    return await this.repository.findOne({ 
      where: { id },
      relations: ['mod']
    });
  }

  async deleteByModId(modId: number): Promise<void> {
    await this.repository.delete({ modId });
  }
}

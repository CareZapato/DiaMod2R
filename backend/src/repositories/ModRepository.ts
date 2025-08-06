import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Mod } from '../models/Mod';

export class ModRepository {
  private repository: Repository<Mod>;

  constructor() {
    this.repository = AppDataSource.getRepository(Mod);
  }

  async findByName(name: string): Promise<Mod | null> {
    return await this.repository.findOne({ where: { name } });
  }

  async save(mod: Mod): Promise<Mod> {
    return await this.repository.save(mod);
  }

  async findAll(): Promise<Mod[]> {
    return await this.repository.find({ relations: ['charStats'] });
  }

  async findById(id: number): Promise<Mod | null> {
    return await this.repository.findOne({ 
      where: { id },
      relations: ['charStats'] 
    });
  }
}

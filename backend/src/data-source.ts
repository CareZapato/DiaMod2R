import { DataSource } from 'typeorm';
import { Mod } from './models/Mod';
import { CharStat } from './models/CharStat';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '123456',
  database: 'diamod2BD',
  synchronize: true, // Esto creará las tablas automáticamente
  logging: false,
  entities: [Mod, CharStat],
  migrations: [],
  subscribers: [],
});

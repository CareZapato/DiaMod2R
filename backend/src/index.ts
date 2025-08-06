import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import modRoutes from './routes/modRoutes';
import systemRoutes from './routes/systemRoutes';
import skillRoutes from './routes/skillRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/mods', modRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/skills', skillRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'DiaMod2R Backend funcionando correctamente' });
});

// Inicializar base de datos y servidor
async function startServer() {
  try {
    // Inicializar conexión a la base de datos
    await AppDataSource.initialize();
    console.log('✅ Conexión a PostgreSQL establecida exitosamente');
    
    // Forzar sincronización de tablas
    if (AppDataSource.options.synchronize) {
      await AppDataSource.synchronize();
      console.log('✅ Sincronización forzada completada');
    }
    
    // Verificar que las tablas existen
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      const tables = await queryRunner.query(`
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('mods', 'charstats', 'skills')
      `);
      console.log('📋 Tablas encontradas en la BD:', tables.map((t: any) => t.tablename));
      
      if (tables.length < 3) {
        console.log('⚠️ Faltan tablas, forzando recreación...');
        await AppDataSource.synchronize(true); // Forzar drop + create
        console.log('✅ Tablas recreadas exitosamente');
      }
    } finally {
      await queryRunner.release();
    }
    
    console.log('✅ Tablas creadas/sincronizadas automáticamente');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`📊 Health check disponible en http://localhost:${PORT}/health`);
      console.log(`🔌 API de mods disponible en http://localhost:${PORT}/api/mods`);
    });
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
}

startServer();

import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import modRoutes from './routes/modRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/mods', modRoutes);

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

import { Router, Request, Response } from 'express';
import { ModService } from '../services/ModService';

const router = Router();
const modService = new ModService();

// POST /api/mods/process - Procesar una carpeta de mod
router.post('/process', async (req: Request, res: Response) => {
  try {
    const { folderPath } = req.body;
    
    if (!folderPath) {
      return res.status(400).json({ error: 'Se requiere el parámetro folderPath' });
    }

    const result = await modService.processModFolder(folderPath);
    
    res.json({
      success: true,
      message: `Mod "${result.mod.name}" procesado exitosamente`,
      data: {
        mod: result.mod,
        filesFound: result.files.length,
        charStatsProcessed: result.charStats.length,
        files: result.files.map(f => f.name)
      }
    });
  } catch (error) {
    console.error('Error en /api/mods/process:', error);
    res.status(500).json({ 
      error: 'Error procesando la carpeta del mod',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/mods - Obtener todos los mods
router.get('/', async (req: Request, res: Response) => {
  try {
    const mods = await modService.getAllMods();
    res.json({
      success: true,
      data: mods
    });
  } catch (error) {
    console.error('Error en /api/mods/:', error);
    res.status(500).json({ 
      error: 'Error obteniendo mods',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/mods/:id - Obtener un mod por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const mod = await modService.getModById(id);
    if (!mod) {
      return res.status(404).json({ error: 'Mod no encontrado' });
    }

    res.json({
      success: true,
      data: mod
    });
  } catch (error) {
    console.error('Error en /api/mods/:id:', error);
    res.status(500).json({ 
      error: 'Error obteniendo mod',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /api/mods/:id/charstats - Obtener charStats de un mod
router.get('/:id/charstats', async (req: Request, res: Response) => {
  try {
    const modId = parseInt(req.params.id);
    if (isNaN(modId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const charStats = await modService.getCharStatsByModId(modId);
    res.json({
      success: true,
      data: charStats
    });
  } catch (error) {
    console.error('Error en /api/mods/:id/charstats:', error);
    res.status(500).json({ 
      error: 'Error obteniendo charStats',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// PUT /api/mods/charstats/:id - Actualizar un CharStat específico
router.put('/charstats/:id', async (req: Request, res: Response) => {
  try {
    const charStatId = parseInt(req.params.id);
    if (isNaN(charStatId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const updateData = req.body;
    const updatedCharStat = await modService.updateCharStat(charStatId, updateData);
    
    res.json({
      success: true,
      message: 'CharStat actualizado exitosamente',
      data: updatedCharStat
    });
  } catch (error) {
    console.error('Error en /api/mods/charstats/:id:', error);
    res.status(500).json({ 
      error: 'Error actualizando CharStat',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /api/mods/:id/generate-modified-file - Generar archivo charstatsmod.txt
router.post('/:id/generate-modified-file', async (req: Request, res: Response) => {
  try {
    const modId = parseInt(req.params.id);
    if (isNaN(modId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const filePath = await modService.generateModifiedCharStatsFile(modId);
    
    res.json({
      success: true,
      message: 'Archivo charstatsmod.txt generado exitosamente',
      data: {
        filePath
      }
    });
  } catch (error) {
    console.error('Error en /api/mods/:id/generate-modified-file:', error);
    res.status(500).json({ 
      error: 'Error generando archivo modificado',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;

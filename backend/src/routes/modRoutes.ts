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
    
    // Determinar qué secciones habilitar basado en los archivos procesados
    const enabledSections = ['stats-heroes']; // Siempre habilitado
    if (result.skills.length > 0) {
      enabledSections.push('skills');
    }
    
    res.json({
      success: true,
      message: `Mod "${result.mod.name}" procesado exitosamente`,
      data: {
        mod: result.mod,
        filesFound: result.files.length,
        charStatsProcessed: result.charStats.length,
        skillsProcessed: result.skills.length,
        files: result.files.map(f => f.name),
        enabledSections: enabledSections
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

// GET /api/mods/:id/skills - Obtener skills de un mod
router.get('/:id/skills', async (req: Request, res: Response) => {
  try {
    const modId = parseInt(req.params.id);
    if (isNaN(modId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const skills = await modService.getSkillsByModId(modId);
    res.json({
      success: true,
      data: skills
    });
  } catch (error) {
    console.error('Error en /api/mods/:id/skills:', error);
    res.status(500).json({ 
      error: 'Error obteniendo skills',
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

// PUT /api/mods/skills/:id - Actualizar una Skill específica
router.put('/skills/:id', async (req: Request, res: Response) => {
  try {
    const skillId = parseInt(req.params.id);
    if (isNaN(skillId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const updateData = req.body;
    const updatedSkill = await modService.updateSkill(skillId, updateData);
    
    // Mapear la respuesta para incluir modName como en skillRoutes
    const mappedSkill = {
      id: updatedSkill.id,
      skill: updatedSkill.skill,
      starId: updatedSkill.starId,
      charclass: updatedSkill.charclass,
      skilldesc: updatedSkill.skilldesc,
      modId: updatedSkill.modId,
      modName: updatedSkill.mod?.name || 'Unknown',
      reqlevel: updatedSkill.reqlevel,
      maxlvl: updatedSkill.maxlvl
    };
    
    res.json({
      success: true,
      message: 'Skill actualizada exitosamente',
      data: mappedSkill
    });
  } catch (error) {
    console.error('Error en /api/mods/skills/:id:', error);
    res.status(500).json({ 
      error: 'Error actualizando Skill',
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

// POST /api/mods/:id/generate-modified-skills-file - Generar archivo skillsmod.txt
router.post('/:id/generate-modified-skills-file', async (req: Request, res: Response) => {
  try {
    const modId = parseInt(req.params.id);
    if (isNaN(modId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const filePath = await modService.generateModifiedSkillsFile(modId);
    
    res.json({
      success: true,
      message: 'Archivo skillsmod.txt generado exitosamente',
      data: {
        filePath
      }
    });
  } catch (error) {
    console.error('Error en /api/mods/:id/generate-modified-skills-file:', error);
    res.status(500).json({ 
      error: 'Error generando archivo skills modificado',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;

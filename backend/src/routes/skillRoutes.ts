import { Router, Request, Response } from 'express';
import { SkillRepository } from '../repositories/SkillRepository';

const router = Router();
const skillRepository = new SkillRepository();

// Obtener todas las skills con filtros opcionales
router.get('/', async (req: Request, res: Response) => {
  try {
    const { modId, charclass, search } = req.query;
    
    let skills = await skillRepository.findAll();
    
    // Filtrar por mod si se especifica
    if (modId) {
      skills = skills.filter(skill => skill.modId === parseInt(modId as string));
    }
    
    // Filtrar por clase de personaje si se especifica
    if (charclass) {
      skills = skills.filter(skill => 
        skill.charclass.toLowerCase().includes((charclass as string).toLowerCase())
      );
    }
    
    // Filtrar por búsqueda en nombre o descripción
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      skills = skills.filter(skill => 
        skill.skill.toLowerCase().includes(searchTerm) ||
        skill.skilldesc.toLowerCase().includes(searchTerm) ||
        skill.starId.toLowerCase().includes(searchTerm)
      );
    }
    
    // Mapear para incluir información útil para el frontend
    const mappedSkills = skills.map(skill => ({
      id: skill.id,
      skill: skill.skill,
      starId: skill.starId,
      charclass: skill.charclass,
      skilldesc: skill.skilldesc,
      modId: skill.modId,
      modName: skill.mod?.name || 'Unknown',
      reqlevel: skill.reqlevel,
      maxlvl: skill.maxlvl
    }));
    
    res.json(mappedSkills);
  } catch (error) {
    console.error('Error obteniendo skills:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al obtener skills',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Obtener skills por mod ID
router.get('/mod/:modId', async (req: Request, res: Response) => {
  try {
    const { modId } = req.params;
    const skills = await skillRepository.findByModId(parseInt(modId));
    
    const mappedSkills = skills.map(skill => ({
      id: skill.id,
      skill: skill.skill,
      starId: skill.starId,
      charclass: skill.charclass,
      skilldesc: skill.skilldesc,
      modId: skill.modId,
      modName: skill.mod?.name || 'Unknown',
      reqlevel: skill.reqlevel,
      maxlvl: skill.maxlvl
    }));
    
    res.json(mappedSkills);
  } catch (error) {
    console.error('Error obteniendo skills por mod:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al obtener skills por mod',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Obtener skill por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const skill = await skillRepository.findById(parseInt(id));
    
    if (!skill) {
      return res.status(404).json({ error: 'Skill no encontrada' });
    }
    
    const mappedSkill = {
      id: skill.id,
      skill: skill.skill,
      starId: skill.starId,
      charclass: skill.charclass,
      skilldesc: skill.skilldesc,
      modId: skill.modId,
      modName: skill.mod?.name || 'Unknown',
      reqlevel: skill.reqlevel,
      maxlvl: skill.maxlvl
    };
    
    res.json(mappedSkill);
  } catch (error) {
    console.error('Error obteniendo skill por ID:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al obtener skill',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Actualizar skill por ID
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reqlevel, maxlvl } = req.body;
    
    const skill = await skillRepository.findById(parseInt(id));
    
    if (!skill) {
      return res.status(404).json({ error: 'Skill no encontrada' });
    }
    
    // Actualizar solo los campos permitidos
    if (reqlevel !== undefined) {
      skill.reqlevel = parseInt(reqlevel) || 0;
    }
    if (maxlvl !== undefined) {
      skill.maxlvl = parseInt(maxlvl) || 0;
    }
    
    const updatedSkill = await skillRepository.save(skill);
    
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
    
    res.json(mappedSkill);
  } catch (error) {
    console.error('Error actualizando skill:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al actualizar skill',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;

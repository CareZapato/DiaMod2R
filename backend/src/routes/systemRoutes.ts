import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const router = Router();

// POST /api/system/open-folder - Abrir carpeta en el explorador
router.post('/open-folder', async (req: Request, res: Response) => {
  try {
    const { path: folderPath } = req.body;
    
    if (!folderPath) {
      return res.status(400).json({ error: 'Se requiere el parámetro path' });
    }

    // Verificar que la carpeta existe
    if (!fs.existsSync(folderPath)) {
      return res.status(404).json({ error: 'La carpeta no existe' });
    }

    // Abrir carpeta según el sistema operativo
    const platform = process.platform;
    let command: string;

    if (platform === 'win32') {
      // Windows
      command = `explorer "${folderPath}"`;
    } else if (platform === 'darwin') {
      // macOS
      command = `open "${folderPath}"`;
    } else {
      // Linux
      command = `xdg-open "${folderPath}"`;
    }

    exec(command, (error) => {
      if (error) {
        console.error('Error abriendo carpeta:', error);
        return res.status(500).json({ 
          error: 'Error abriendo carpeta',
          details: error.message 
        });
      }
      
      res.json({
        success: true,
        message: 'Carpeta abierta exitosamente'
      });
    });

  } catch (error) {
    console.error('Error en /api/system/open-folder:', error);
    res.status(500).json({ 
      error: 'Error procesando solicitud',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;

import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { parseTabDelimitedFile, generateTabDelimitedFile, FileData } from '../utils/fileUtils';

const router = express.Router();

interface ComparisonResult {
  modData: FileData;
  baseData: FileData;
  differences: { [key: string]: { row: number; col: string; isHigher: boolean } };
}

/**
 * Compare a mod file with its base game equivalent
 */
router.get('/compare/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const { mod } = req.query;

    if (!mod || typeof mod !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Mod name is required'
      });
    }

    // Validate file name to prevent directory traversal
    const validFiles = ['charstats', 'skills', 'itemtypes', 'weapons', 'armor', 'misc'];
    if (!validFiles.includes(fileName)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file name'
      });
    }

    // Construct file paths
    const modFilePath = path.join(process.cwd(), 'mods', mod, 'data', 'global', 'excel', `${fileName}.txt`);
    const baseFilePath = path.join(process.cwd(), 'game-base-files', `${fileName}.txt`);

    // Check if files exist
    try {
      await fs.access(modFilePath);
      await fs.access(baseFilePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: `File not found: ${fileName}.txt`
      });
    }

    // Parse both files
    const [modFileResult, baseFileResult] = await Promise.all([
      parseTabDelimitedFile(modFilePath),
      parseTabDelimitedFile(baseFilePath)
    ]);

    if (!modFileResult.success || !baseFileResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to parse files'
      });
    }

    const modData = modFileResult.data!;
    const baseData = baseFileResult.data!;

    // Calculate differences
    const differences: { [key: string]: { row: number; col: string; isHigher: boolean } } = {};

    // Compare data row by row
    modData.rows.forEach((modRow: { [key: string]: string }, rowIndex: number) => {
      if (rowIndex < baseData.rows.length) {
        const baseRow = baseData.rows[rowIndex];
        
        modData.headers.forEach((header: string) => {
          const modValue = modRow[header] || '';
          const baseValue = baseRow[header] || '';
          
          if (modValue !== baseValue) {
            const key = `${rowIndex}-${header}`;
            
            // Try to compare as numbers if possible
            const modNum = parseFloat(modValue);
            const baseNum = parseFloat(baseValue);
            
            if (!isNaN(modNum) && !isNaN(baseNum)) {
              differences[key] = {
                row: rowIndex,
                col: header,
                isHigher: modNum > baseNum
              };
            } else {
              // For non-numeric values, just mark as different
              differences[key] = {
                row: rowIndex,
                col: header,
                isHigher: false
              };
            }
          }
        });
      }
    });

    const result: ComparisonResult = {
      modData,
      baseData,
      differences
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error comparing files:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Save changes to a mod file
 */
router.post('/save/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const { mod, data } = req.body;

    if (!mod || !data) {
      return res.status(400).json({
        success: false,
        error: 'Mod name and data are required'
      });
    }

    // Validate file name to prevent directory traversal
    const validFiles = ['charstats', 'skills', 'itemtypes', 'weapons', 'armor', 'misc'];
    if (!validFiles.includes(fileName)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file name'
      });
    }

    // Construct file path
    const modFilePath = path.join(process.cwd(), 'mods', mod, 'data', 'global', 'excel', `${fileName}.txt`);

    // Ensure directory exists
    const modDir = path.dirname(modFilePath);
    await fs.mkdir(modDir, { recursive: true });

    // Generate and save file
    const generateResult = await generateTabDelimitedFile(data, modFilePath);

    if (!generateResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to save file'
      });
    }

    res.json({
      success: true,
      message: `File ${fileName}.txt saved successfully`
    });

  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get list of available files for comparison
 */
router.get('/available', async (req, res) => {
  try {
    const { mod } = req.query;

    if (!mod || typeof mod !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Mod name is required'
      });
    }

    const modPath = path.join(process.cwd(), 'mods', mod, 'data', 'global', 'excel');
    const basePath = path.join(process.cwd(), 'game-base-files');

    try {
      const [modFiles, baseFiles] = await Promise.all([
        fs.readdir(modPath).catch(() => []),
        fs.readdir(basePath).catch(() => [])
      ]);

      // Find common files (files that exist in both directories)
      const modTxtFiles = modFiles.filter(file => file.endsWith('.txt'));
      const baseTxtFiles = baseFiles.filter(file => file.endsWith('.txt'));
      
      const commonFiles = modTxtFiles.filter(file => baseTxtFiles.includes(file));

      const availableFiles = commonFiles.map(file => {
        const name = file.replace('.txt', '');
        return {
          value: name,
          label: `${name.charAt(0).toUpperCase() + name.slice(1)} (${file})`,
          modExists: true,
          baseExists: true
        };
      });

      res.json({
        success: true,
        data: availableFiles
      });

    } catch (error) {
      res.json({
        success: true,
        data: []
      });
    }

  } catch (error) {
    console.error('Error getting available files:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;

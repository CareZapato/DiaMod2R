import express from 'express';
import { Router, Request, Response } from 'express';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { parseTabDelimitedFile, generateTabDelimitedFile, FileData } from '../utils/fileUtils';
import { FileService } from '../services/FileService';
import { ModService } from '../services/ModService';

const router = express.Router();
const fileService = new FileService();
const modService = new ModService();

interface ComparisonResult {
  modData: FileData;
  baseData: FileData;
  differences: { [key: string]: { row: number; col: string; isHigher: boolean } };
}

/**
 * Convert parsed data objects to table format for frontend
 */
function convertToTableFormat(data: any[], fileType: string): FileData {
  if (!data || data.length === 0) {
    return { headers: [], rows: [] };
  }

  // Get headers from the first object's keys
  const headers = Object.keys(data[0]).filter(key => key !== 'id' && key !== 'modId' && key !== 'mod');
  
  // Convert objects to row format
  const rows = data.map(item => {
    const row: { [key: string]: string } = {};
    headers.forEach(header => {
      const value = item[header];
      if (value !== null && value !== undefined) {
        row[header] = String(value);
      } else {
        row[header] = '';
      }
    });
    return row;
  });

  return { headers, rows };
}

/**
 * Calculate differences between mod and base data
 */
function calculateDifferences(modData: FileData, baseData: FileData): { [key: string]: { row: number; col: string; isHigher: boolean } } {
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

  return differences;
}

/**
 * Compare a mod file with its base game equivalent using specific parsers
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
    const validFiles = ['charstats', 'skills'];
    if (!validFiles.includes(fileName)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file name. Only charstats and skills are supported.'
      });
    }

    // Construct file paths
    const modFilePath = path.join(process.cwd(), 'mods', mod, 'data', 'global', 'excel', `${fileName}.txt`);
    const baseFilePath = path.join(process.cwd(), 'game-base-files', `${fileName}.txt`);

    // Check if base file exists (required)
    const baseExists = await fsSync.existsSync(baseFilePath);
    if (!baseExists) {
      return res.status(404).json({
        success: false,
        error: `Base file ${fileName}.txt not found`
      });
    }

    // Check if mod file exists (optional)
    const modExists = await fsSync.existsSync(modFilePath);

    let modData: any[] = [];
    let baseData: any[] = [];

    try {
      // Always parse base file
      if (fileName === 'charstats') {
        baseData = await fileService.parseCharStatsFile(baseFilePath);
        if (modExists) {
          modData = await fileService.parseCharStatsFile(modFilePath);
        }
      } else if (fileName === 'skills') {
        baseData = await fileService.parseSkillsFile(baseFilePath);
        if (modExists) {
          modData = await fileService.parseSkillsFile(modFilePath);
        }
      }

      // Convert parsed data to table format for frontend
      const baseTableData = convertToTableFormat(baseData, fileName);
      let modTableData: FileData;

      if (modExists && modData.length > 0) {
        modTableData = convertToTableFormat(modData, fileName);
      } else {
        // Create empty table structure with same headers as base
        modTableData = {
          headers: baseTableData.headers,
          rows: []
        };
      }

      // Calculate differences (only if mod file exists)
      const differences = modExists ? calculateDifferences(modTableData, baseTableData) : {};

      const result: ComparisonResult = {
        modData: modTableData,
        baseData: baseTableData,
        differences
      };

      res.json({
        success: true,
        data: result
      });

    } catch (parseError) {
      console.error('Error parsing files:', parseError);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse files with specific parsers'
      });
    }

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
    const validFiles = ['charstats', 'skills'];
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
      // Get all base files that can be compared
      const baseFiles = await fs.readdir(basePath).catch(() => []);
      const baseTxtFiles = baseFiles.filter(file => file.endsWith('.txt'));

      // Check which ones also exist in the mod
      const modFiles = await fs.readdir(modPath).catch(() => []);
      const modTxtFiles = modFiles.filter(file => file.endsWith('.txt'));

      const availableFiles = baseTxtFiles.map(file => {
        const name = file.replace('.txt', '');
        const modExists = modTxtFiles.includes(file);
        
        return {
          value: name,
          label: `${name.charAt(0).toUpperCase() + name.slice(1)} (${file})`,
          modExists,
          baseExists: true
        };
      });

      // Sort files by name for better UX
      availableFiles.sort((a, b) => a.value.localeCompare(b.value));

      res.json({
        success: true,
        data: availableFiles
      });

    } catch (error) {
      console.error('Error reading directories:', error);
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

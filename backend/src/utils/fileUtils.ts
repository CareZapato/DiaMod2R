import fs from 'fs/promises';

export interface FileData {
  headers: string[];
  rows: Array<{ [key: string]: string }>;
}

export interface FileResult {
  success: boolean;
  data?: FileData;
  error?: string;
}

/**
 * Parse a tab-delimited text file
 */
export async function parseTabDelimitedFile(filePath: string): Promise<FileResult> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      return {
        success: false,
        error: 'File is empty'
      };
    }

    // First line contains headers
    const headers = lines[0].split('\t').map(header => header.trim());
    
    // Parse data rows
    const rows: Array<{ [key: string]: string }> = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t');
      const row: { [key: string]: string } = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] ? values[index].trim() : '';
      });
      
      rows.push(row);
    }

    return {
      success: true,
      data: {
        headers,
        rows
      }
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate a tab-delimited text file from data
 */
export async function generateTabDelimitedFile(data: FileData, filePath: string): Promise<FileResult> {
  try {
    const lines: string[] = [];
    
    // Add headers
    lines.push(data.headers.join('\t'));
    
    // Add data rows
    data.rows.forEach(row => {
      const values = data.headers.map(header => row[header] || '');
      lines.push(values.join('\t'));
    });
    
    const content = lines.join('\n') + '\n';
    await fs.writeFile(filePath, content, 'utf-8');
    
    return {
      success: true
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

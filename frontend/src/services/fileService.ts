// File Service for File Comparison functionality

interface FileData {
  headers: string[];
  rows: Array<{ [key: string]: string }>;
}

interface ComparisonData {
  modData: FileData;
  baseData: FileData;
  differences: { [key: string]: { row: number; col: string; isHigher: boolean } };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const fileService = {
  /**
   * Get comparison data for a specific file
   */
  async getFileComparison(fileName: string, modName: string): Promise<ApiResponse<ComparisonData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/files/compare/${fileName}?mod=${encodeURIComponent(modName)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get file comparison');
      }
      
      return data;
    } catch (error) {
      console.error('Error getting file comparison:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  /**
   * Save changes to a mod file
   */
  async saveFileChanges(fileName: string, modName: string, data: FileData): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/files/save/${fileName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mod: modName,
          data: data
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save file changes');
      }
      
      return result;
    } catch (error) {
      console.error('Error saving file changes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  /**
   * Get list of available files for comparison
   */
  async getAvailableFiles(modName: string): Promise<ApiResponse<Array<{ value: string; label: string; modExists: boolean; baseExists: boolean }>>> {
    try {
      const response = await fetch(`${API_BASE_URL}/files/available?mod=${encodeURIComponent(modName)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get available files');
      }
      
      return data;
    } catch (error) {
      console.error('Error getting available files:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};

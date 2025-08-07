import axios from 'axios';
import { Skill, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const skillService = {
  // Obtener todas las skills con filtros opcionales
  async getSkills(filters?: {
    modId?: number;
    charclass?: string;
    search?: string;
  }): Promise<Skill[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.modId) {
        params.append('modId', filters.modId.toString());
      }
      if (filters?.charclass) {
        params.append('charclass', filters.charclass);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      
      const response = await axios.get<Skill[]>(`${API_BASE_URL}/skills?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo skills:', error);
      throw new Error('No se pudieron obtener las skills');
    }
  },

  // Obtener skills por mod ID
  async getSkillsByMod(modId: number): Promise<Skill[]> {
    try {
      const response = await axios.get<Skill[]>(`${API_BASE_URL}/skills/mod/${modId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo skills por mod:', error);
      throw new Error('No se pudieron obtener las skills del mod');
    }
  },

  // Obtener skill por ID
  async getSkillById(id: number): Promise<Skill> {
    try {
      const response = await axios.get<Skill>(`${API_BASE_URL}/skills/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo skill por ID:', error);
      throw new Error('No se pudo obtener la skill');
    }
  },

  // Actualizar skill
  async updateSkill(id: number, updates: { reqlevel?: number; maxlvl?: number }): Promise<Skill> {
    try {
      const response = await axios.put<Skill>(`${API_BASE_URL}/skills/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error actualizando skill:', error);
      throw new Error('No se pudo actualizar la skill');
    }
  },

  // Generar archivo skills modificado
  async generateModifiedSkillsFile(modId: number): Promise<{ filePath: string }> {
    try {
      const response = await axios.post<{ success: boolean; data: { filePath: string } }>(`${API_BASE_URL}/mods/${modId}/generate-modified-skills-file`);
      return response.data.data;
    } catch (error) {
      console.error('Error generando archivo skills modificado:', error);
      throw new Error('No se pudo generar el archivo skills modificado');
    }
  }
};

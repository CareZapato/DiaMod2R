import axios from 'axios';
import { ProcessModResponse, ApiResponse, Mod, CharStat } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const modService = {
  // Procesar una carpeta de mod
  async processMod(folderPath: string): Promise<ProcessModResponse> {
    try {
      const response = await api.post('/mods/process', { folderPath });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || 'Error de conexión',
          details: error.response?.data?.details || error.message
        };
      }
      return {
        success: false,
        error: 'Error desconocido',
        details: String(error)
      };
    }
  },

  // Obtener todos los mods
  async getAllMods(): Promise<ApiResponse<Mod[]>> {
    try {
      const response = await api.get('/mods');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || 'Error de conexión',
          details: error.response?.data?.details || error.message
        };
      }
      return {
        success: false,
        error: 'Error desconocido',
        details: String(error)
      };
    }
  },

  // Obtener un mod por ID
  async getModById(id: number): Promise<ApiResponse<Mod>> {
    try {
      const response = await api.get(`/mods/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || 'Error de conexión',
          details: error.response?.data?.details || error.message
        };
      }
      return {
        success: false,
        error: 'Error desconocido',
        details: String(error)
      };
    }
  },

  // Obtener charStats de un mod
  async getCharStatsByModId(modId: number): Promise<ApiResponse<CharStat[]>> {
    try {
      const response = await api.get(`/mods/${modId}/charstats`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: error.response?.data?.error || 'Error de conexión',
          details: error.response?.data?.details || error.message
        };
      }
      return {
        success: false,
        error: 'Error desconocido',
        details: String(error)
      };
    }
  },

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response = await axios.get('http://localhost:3001/health');
      return response.data;
    } catch (error) {
      throw new Error('Backend no disponible');
    }
  }
};

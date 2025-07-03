import axios, { AxiosInstance } from 'axios';
import { SaveResponse, SavesResponse } from '../types';

const { hostname, origin } = window.location;

const api: AxiosInstance = axios.create({
  baseURL: hostname === 'localhost' ? 'http://localhost:3200/api' : "https://bingo.bitbase.fr/api",
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Timeout de 10 secondes pour les auto-saves
});

// Intercepteur pour gérer les erreurs de réseau
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.warn('Timeout lors de la sauvegarde automatique');
    } else if (error.response?.status >= 500) {
      console.error('Erreur serveur lors de la sauvegarde:', error.response.status);
    } else if (!error.response) {
      console.warn('Erreur réseau lors de la sauvegarde automatique');
    }
    return Promise.reject(error);
  }
);

export const saveJson = async (data: object): Promise<SaveResponse> => {
  const response = await api.post<SaveResponse>('/save', data);
  return response.data;
};

export const fetchSaves = async (): Promise<SavesResponse[]> => {
  const response = await api.get<SavesResponse[]>('/save');
  return response.data;
};

export const fetchLastSave = async (): Promise<SaveResponse> => {
  const response = await api.get<SaveResponse>('/save/last');
  return response.data;
};

export default {
  saveJson,
  fetchSaves,
  fetchLastSave,
};
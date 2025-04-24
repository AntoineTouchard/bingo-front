import axios, { AxiosInstance } from 'axios';
import { SaveResponse, SavesResponse } from '../types';


const { hostname, origin } = window.location;

const api: AxiosInstance = axios.create({
  baseURL: hostname === 'localhost' ? 'http://localhost:3200/api' : origin+"/api",
  headers: {
    'Content-Type': 'application/json',
  },
});

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
};

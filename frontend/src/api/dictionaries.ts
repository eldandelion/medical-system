import { apiFetch } from './client';

export interface EthnicityDto {
  id: number;
  name: string;
}

export const dictionaryApi = {
  fetchEthnicities: async (): Promise<EthnicityDto[]> => {
    return apiFetch<EthnicityDto[]>('/api/dictionaries/ethnicities');
  },
};

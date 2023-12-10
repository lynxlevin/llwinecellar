import client from './axios';
import { AxiosResponse } from 'axios';

interface GrapeMasterRequestBody {
    name: string;
    abbreviation: string | null;
}

export interface GrapeMasterItem {
    id: string;
    name: string;
    abbreviation: string | null;
}

interface GrapeMasterListResponse {
    grape_masters: GrapeMasterItem[];
}

export const GrapeMasterAPI = {
    BASE_URL: '/api/grape_masters/',

    list: async (): Promise<AxiosResponse<GrapeMasterListResponse>> => {
        const url = GrapeMasterAPI.BASE_URL;
        return await client.get(url);
    },

    create: async (data: GrapeMasterRequestBody): Promise<AxiosResponse<GrapeMasterItem>> => {
        const url = GrapeMasterAPI.BASE_URL;
        return await client.post(url, data, { headers: { 'content-type': 'application/json' } });
    },
};

import { GrapeMaster } from '../contexts/grape-master-context';
import client from './axios';
import { AxiosResponse } from 'axios';

interface GrapeMasterRequestBody {
    name: string;
    abbreviation: string | null;
}

interface GrapeMasterListResponse {
    grape_masters: GrapeMaster[];
}

export const GrapeMasterAPI = {
    BASE_URL: '/api/grape_masters/',

    list: async (): Promise<AxiosResponse<GrapeMasterListResponse>> => {
        const url = GrapeMasterAPI.BASE_URL;
        return await client.get(url);
    },

    create: async (data: GrapeMasterRequestBody): Promise<AxiosResponse<GrapeMaster>> => {
        const url = GrapeMasterAPI.BASE_URL;
        return await client.post(url, data, { headers: { 'content-type': 'application/json' } });
    },

    delete: async (grapeId: string, forceDelete?: boolean): Promise<AxiosResponse<{}>> => {
        let url = `${GrapeMasterAPI.BASE_URL}${grapeId}/`;
        if (forceDelete) url += '?force_delete=true';
        return await client.delete(url);
    },
};

import client from './axios';
import { AxiosResponse } from 'axios';

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
        let url = GrapeMasterAPI.BASE_URL;
        return await client.get(url);
    },
};

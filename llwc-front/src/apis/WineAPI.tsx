import { Cepage, WineData } from '../contexts/wine-context';
import client from './axios';
import { AxiosResponse } from 'axios';

interface WineListResponse {
    wines: WineData[];
}

export interface UpdateWineRequest {
    name: string;
    producer: string;
    country: string;
    region_1: string;
    region_2: string;
    region_3: string;
    region_4: string;
    region_5: string;
    cepages: Cepage[];
    vintage: number | null;
    bought_at: string | null;
    bought_from: string;
    price_with_tax: number | null;
    drunk_at: string | null;
    note: string;
    tag_texts: string[];
    cellar_id?: string | null;
    position?: string | null;
}

export const WineAPI = {
    BASE_URL: '/api/wines/',

    list: async (query?: Object): Promise<AxiosResponse<WineListResponse>> => {
        let url = WineAPI.BASE_URL;
        if (query) {
            url += `?${new URLSearchParams(Object.entries(query)).toString()}`;
        }
        return await client.get(url);
    },
    update: async (id: string, data: UpdateWineRequest): Promise<AxiosResponse<WineData>> => {
        const url = `${WineAPI.BASE_URL}${id}/`;
        return await client.put(url, data, { headers: { 'content-type': 'application/json' } });
    },
};

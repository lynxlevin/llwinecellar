import client from './axios';
import { AxiosResponse } from 'axios';

interface WineRegionListResponse {
    regions: string[];
}

export const WineRegionAPI = {
    BASE_URL: '/api/wine_regions/',

    list: async (): Promise<AxiosResponse<WineRegionListResponse>> => {
        const url = WineRegionAPI.BASE_URL;
        return await client.get(url);
    },
};

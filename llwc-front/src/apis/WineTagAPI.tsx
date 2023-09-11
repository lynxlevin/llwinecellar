import client from './axios';
import { AxiosResponse } from 'axios';

interface WineTagListResponse {
    tag_texts: string[];
}

export const WineTagAPI = {
    BASE_URL: '/api/wine_tags/',

    list: async (): Promise<AxiosResponse<WineTagListResponse>> => {
        let url = WineTagAPI.BASE_URL;
        return await client.get(url);
    },
};

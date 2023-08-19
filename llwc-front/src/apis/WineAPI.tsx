import { WineData } from '../hooks/useWineListPage';
import client from './axios';
import { AxiosResponse } from 'axios';

interface WineListResponse {
    wines: WineData[];
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
};

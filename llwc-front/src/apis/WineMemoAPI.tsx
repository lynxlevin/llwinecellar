import client from './axios';
import { AxiosResponse } from 'axios';

interface WineMemosResponse {
    wine_memos: IWineMemo[];
}

export interface IWineMemo {
    id: string;
    title: string;
    entry: string;
}

export interface WineMemoRequestBody {
    title: string;
    entry: string;
}

export const WineMemoAPI = {
    BASE_URL: '/api/wine_memos/',

    list: async (): Promise<AxiosResponse<WineMemosResponse>> => {
        const url = WineMemoAPI.BASE_URL;
        return await client.get(url);
    },
    create: async (data: WineMemoRequestBody): Promise<AxiosResponse<IWineMemo>> => {
        const url = WineMemoAPI.BASE_URL;
        return await client.post(url, data, { headers: { 'content-type': 'application/json' } });
    },
    update: async (id: string, data: WineMemoRequestBody): Promise<AxiosResponse<IWineMemo>> => {
        const url = `${WineMemoAPI.BASE_URL}${id}/`;
        return await client.put(url, data, { headers: { 'content-type': 'application/json' } });
    },
};

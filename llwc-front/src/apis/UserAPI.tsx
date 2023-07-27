import client from './axios';
import { AxiosResponse } from 'axios';

interface LoginProps {
    email: string;
    password: string;
}

interface SessionResponse {
    is_authenticated: boolean;
}

export const UserAPI = {
    BASE_URL: '/user',

    login: async (data: LoginProps) => {
        const url = `${UserAPI.BASE_URL}/login/`;
        return await client.post(url, data, { headers: { 'content-type': 'application/json' } });
    },
    session: async (): Promise<AxiosResponse<SessionResponse>> => {
        const url = `${UserAPI.BASE_URL}/session/`;
        return await client.get(url);
    },
    logout: async () => {
        const url = `${UserAPI.BASE_URL}/logout/`;
        return await client.get(url);
    },
};

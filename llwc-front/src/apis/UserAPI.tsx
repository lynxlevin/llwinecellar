import client from "./axios";

interface LoginProps {
    email: string;
    password: string;
}

export const UserAPI = {
    BASE_URL: '/user',

    login: async (data: LoginProps) => {
        const url = `${UserAPI.BASE_URL}/login/`;
        return await client.post(url, data, {headers: {'content-type': 'application/json'}});
    },
    session: async () => {
        const url =`${UserAPI.BASE_URL}/session/`;
        return await client.get(url);
    },
    logout: async () => {
        const url = `${UserAPI.BASE_URL}/logout/`;
        return await client.get(url);
    }
}
import axios from 'axios';

interface LoginProps {
    email: string;
    password: string;
}

export const UserAPI = {
    BASE_URL: '/user',

    getCSRF: async () => {
        const url = `${UserAPI.BASE_URL}/csrf/`;
        return await axios.get(url);
    },
    login: async (data: LoginProps, cSRFToken: string) => {
        const url = `${UserAPI.BASE_URL}/login/`;
        return await axios.post(url, data, {headers: {'content-type': 'application/json', 'x-csrftoken': cSRFToken}});
    },
    logout: async () => {
        const url = `${UserAPI.BASE_URL}/logout/`;
        return await axios.get(url);
    }
}
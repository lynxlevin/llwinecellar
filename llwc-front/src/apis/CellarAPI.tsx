import client from './axios';

export const CellarAPI = {
    BASE_URL: '/api/cellars/',

    list: async () => {
        return await client.get(CellarAPI.BASE_URL);
    },
};

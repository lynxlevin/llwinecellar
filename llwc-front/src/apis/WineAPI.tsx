import client from './axios';

export const WineAPI = {
    BASE_URL: '/api/wines/',

    list: async () => {
        return await client.get(WineAPI.BASE_URL);
    },
};

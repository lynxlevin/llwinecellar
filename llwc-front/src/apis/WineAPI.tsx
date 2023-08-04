import client from './axios';

export const WineAPI = {
    BASE_URL: '/api/wines/',

    list: async (query?: Object) => {
        let url = WineAPI.BASE_URL;
        if (query) {
            url += `?${new URLSearchParams(Object.entries(query)).toString()}`;
        }
        return await client.get(url);
    },
};

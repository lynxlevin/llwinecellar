import axios from 'axios';

export const CellarAPI = {
    BASE_URL: '/api/cellars/',

    list: async () => {
        return await axios.get(CellarAPI.BASE_URL);
    },
}
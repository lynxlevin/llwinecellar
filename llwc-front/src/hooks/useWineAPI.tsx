import { FindSameWinesQuery, WineAPI } from '../apis/WineAPI';

const useWineAPI = () => {
    const findSameWines = async (query: FindSameWinesQuery) => {
        const res = await WineAPI.findSameWines(query);
        return res.data.wines;
    };

    return {
        findSameWines,
    };
};

export default useWineAPI;

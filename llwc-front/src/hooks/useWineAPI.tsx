import { ListWineQuery, WineAPI } from '../apis/WineAPI';
import { WineSearchQuery } from '../contexts/wine-context';

export interface FindSameWinesQuery {
    show_drunk: boolean;
    show_stock: boolean;
    name?: string;
    producer?: string;
    name_or_producer?: string;
}

const useWineAPI = () => {
    const listWines = async (searchQuery: WineSearchQuery) => {
        const query: ListWineQuery = {
            show_stock: searchQuery.showStock,
            show_drunk: searchQuery.showDrunk,
        };
        if (searchQuery.cellarId !== '-' && searchQuery.cellarId !== 'NOT_IN_CELLAR') query.cellar_id = searchQuery.cellarId;
        if (searchQuery.cellarId === 'NOT_IN_CELLAR') query.out_of_cellars = true;
        if (searchQuery.nameOrProducer) query.name_or_producer = searchQuery.nameOrProducer;
        if (searchQuery.country) query.country = searchQuery.country;
        if (searchQuery.region_1) query.region_1 = searchQuery.region_1;
        if (searchQuery.region_2) query.region_2 = searchQuery.region_2;
        if (searchQuery.region_3) query.region_3 = searchQuery.region_3;
        if (searchQuery.region_4) query.region_4 = searchQuery.region_4;
        if (searchQuery.region_5) query.region_5 = searchQuery.region_5;
        if (searchQuery.cepages.length > 0) query.cepage_names = searchQuery.cepages.map(cepage => cepage.name);
        const res = await WineAPI.list(query);
        return res;
    };

    const findSameWines = async (query: FindSameWinesQuery) => {
        const res = await WineAPI.list(query);
        return res.data.wines;
    };

    return {
        listWines,
        findSameWines,
    };
};

export default useWineAPI;

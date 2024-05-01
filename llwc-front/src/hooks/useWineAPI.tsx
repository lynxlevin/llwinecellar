import { useContext, useCallback } from 'react';
import { FindSameWinesQuery, WineAPI } from '../apis/WineAPI';
import { WineContext } from '../contexts/wine-context';

interface getWineListQuery {
    is_drunk: boolean;
    out_of_cellars?: boolean;
    cellar_id?: string;
}

const useWineAPI = () => {
    const wineContext = useContext(WineContext);

    const getWineList = useCallback(async () => {
        const cellarId = wineContext.wineListQuery.cellarId;
        const allCellars = cellarId === '';
        const outOfCellars = cellarId === 'NOT_IN_CELLAR';
        const query: getWineListQuery = {
            is_drunk: wineContext.wineListQuery.isDrunk,
            out_of_cellars: outOfCellars,
            cellar_id: cellarId,
        };
        if (allCellars) delete query.out_of_cellars;
        if (allCellars || outOfCellars) delete query.cellar_id;
        const res = await WineAPI.list(query);
        wineContext.setWineList(res.data.wines);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wineContext.wineListQuery]);

    const findSameWines = async (query: FindSameWinesQuery) => {
        const res = await WineAPI.findSameWines(query);
        return res.data.wines;
    }

    return {
        getWineList,
        findSameWines
    };
};

export default useWineAPI;

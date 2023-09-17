import { useContext, useCallback } from 'react';
import { WineAPI } from '../apis/WineAPI';
import { WineContext } from '../contexts/wine-context';

const useWineAPI = () => {
    const wineContext = useContext(WineContext);

    const getWineList = useCallback(async () => {
        const res = await WineAPI.list(wineContext.wineListQuery);
        wineContext.setWineList(res.data.wines);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wineContext.wineListQuery]);

    return {
        getWineList,
    };
};

export default useWineAPI;

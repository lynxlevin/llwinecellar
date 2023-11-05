import { useContext } from 'react';
import { WineRegionContext } from '../contexts/wine-region-context';
import { WineRegionAPI } from '../apis/WineRegionAPI';

const useWineRegionAPI = () => {
    const wineRegionContext = useContext(WineRegionContext);

    const getWineRegionList = async () => {
        const res = await WineRegionAPI.list();
        wineRegionContext.setWineRegionList(res.data.regions);
    };

    return {
        getWineRegionList,
    };
};

export default useWineRegionAPI;

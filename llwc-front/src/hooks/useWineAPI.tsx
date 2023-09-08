import { useContext } from 'react';
import { WineAPI } from '../apis/WineAPI';
import { WineContext } from '../contexts/wine-context';

const useWineAPI = () => {
    const wineContext = useContext(WineContext);

    const getWineList = async () => {
        const query = { is_drunk: false };
        const res = await WineAPI.list(query);
        wineContext.setWineList(res.data.wines);
    };

    return {
        getWineList,
    };
};

export default useWineAPI;

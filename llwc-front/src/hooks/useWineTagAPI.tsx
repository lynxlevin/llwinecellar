import { useContext } from 'react';
import { WineTagContext } from '../contexts/wine-tag-context';
import { WineTagAPI } from '../apis/WineTagAPI';

const useWineTagAPI = () => {
    const wineTagContext = useContext(WineTagContext);

    const getWineTagList = async () => {
        const res = await WineTagAPI.list();
        wineTagContext.setWineTagList(res.data.tag_texts);
    };

    return {
        getWineTagList,
    };
};

export default useWineTagAPI;

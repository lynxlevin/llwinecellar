import { useEffect, useContext } from 'react';
import { UserAPI } from '../apis/UserAPI';
import { CellarContext } from '../contexts/cellar-context';
import { CellarAPI } from '../apis/CellarAPI';
import useWineTagAPI from '../hooks/useWineTagAPI';
import { UserContext } from '../contexts/user-context';
import { WineTagContext } from '../contexts/wine-tag-context';
import { WineRegionContext } from '../contexts/wine-region-context';
import useWineRegionAPI from './useWineRegionAPI';
import { WineContext } from '../contexts/wine-context';

const useUserAPI = () => {
    const userContext = useContext(UserContext);
    const cellarContext = useContext(CellarContext);
    const wineContext = useContext(WineContext);
    const wineTagContext = useContext(WineTagContext);
    const wineRegionContext = useContext(WineRegionContext);

    const { getWineTagList } = useWineTagAPI();
    const { getWineRegionList } = useWineRegionAPI();

    const handleLogout = async () => {
        await UserAPI.logout();
        userContext.setIsLoggedIn(false);
    };

    // MYMEMO(後日): usexxxPage 以外の hook ではuseEffect しないほうがいいかも？
    useEffect(() => {
        const checkSession = async () => {
            const session_res = await UserAPI.session();
            const isAuthenticated = session_res.data.is_authenticated;
            userContext.setIsLoggedIn(isAuthenticated);
            if (isAuthenticated) {
                // MYMEMO(後日): length ではなく、フラグを立てるべき
                if (cellarContext.cellarList.length === 0) {
                    const res = await CellarAPI.list();
                    const cellars = res.data.cellars;
                    cellarContext.setCellarList(cellars);
                    wineContext.setWineListQuery(curr => {
                        return { ...curr, cellarId: cellars[0].id };
                    });
                }
                if (wineTagContext.wineTagList.length === 0) {
                    getWineTagList();
                }
                if (wineRegionContext.wineRegionList.length === 0) {
                    getWineRegionList();
                }
            }
        };
        void checkSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        handleLogout,
    };
};

export default useUserAPI;

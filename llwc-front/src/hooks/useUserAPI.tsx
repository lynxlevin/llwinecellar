import { useEffect, useContext } from 'react';
import { UserAPI } from '../apis/UserAPI';
import { CellarContext } from '../contexts/cellar-context';
import { CellarAPI } from '../apis/CellarAPI';
import useWineTagAPI from '../hooks/useWineTagAPI';
import { UserContext } from '../contexts/user-context';
import { WineTagContext } from '../contexts/wine-tag-context';
import { WineRegionContext } from '../contexts/wine-region-context';
import useWineRegionAPI from './useWineRegionAPI';
import { GrapeMasterContext } from '../contexts/grape-master-context';
import useGrapeMasterAPI from './useGrapeMasterAPI';

const useUserAPI = () => {
    const userContext = useContext(UserContext);
    const cellarContext = useContext(CellarContext);
    const wineTagContext = useContext(WineTagContext);
    const wineRegionContext = useContext(WineRegionContext);
    const grapeMasterContext = useContext(GrapeMasterContext);

    const { getWineTagList } = useWineTagAPI();
    const { getWineRegionList } = useWineRegionAPI();
    const { getGrapeMasterList } = useGrapeMasterAPI();

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
                }
                if (wineTagContext.wineTagList.length === 0) {
                    getWineTagList();
                }
                if (wineRegionContext.wineRegionList.length === 0) {
                    getWineRegionList();
                }
                if (grapeMasterContext.grapeMasterList.length === 0) {
                    getGrapeMasterList();
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

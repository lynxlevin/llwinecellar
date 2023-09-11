import { useEffect, useContext } from 'react';
import { UserAPI } from '../apis/UserAPI';
import { CellarContext } from '../contexts/cellar-context';
import { CellarAPI } from '../apis/CellarAPI';
import useWineTagAPI from '../hooks/useWineTagAPI';
import { UserContext } from '../contexts/user-context';
import { WineTagContext } from '../contexts/wine-tag-context';

const useUserAPI = () => {
    const userContext = useContext(UserContext);
    const cellarContext = useContext(CellarContext);
    const wineTagContext = useContext(WineTagContext);

    const { getWineTagList } = useWineTagAPI();

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
                if (cellarContext.list.length === 0) {
                    const res = await CellarAPI.list();
                    cellarContext.setList(res.data.cellars);
                }
                if (wineTagContext.wineTagList.length === 0) {
                    getWineTagList();
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

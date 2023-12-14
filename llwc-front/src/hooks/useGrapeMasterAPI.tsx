import { useContext } from 'react';
import { GrapeMasterContext } from '../contexts/grape-master-context';
import { GrapeMasterAPI } from '../apis/GrapeMasterAPI';

const useGrapeMasterAPI = () => {
    const grapeMasterContext = useContext(GrapeMasterContext);

    const getGrapeMasterList = async () => {
        const res = await GrapeMasterAPI.list();
        grapeMasterContext.setGrapeMasterList(res.data.grape_masters);
    };

    return {
        getGrapeMasterList,
    };
};

export default useGrapeMasterAPI;

import { createContext } from 'react';

export interface GrapeMaster {
    id: string;
    name: string;
    abbreviation: string | null;
}

interface GrapeMasterContextType {
    grapeMasterList: GrapeMaster[];
    setGrapeMasterList: React.Dispatch<React.SetStateAction<GrapeMaster[]>>;
}

export const GrapeMasterContext = createContext({ grapeMasterList: [], setGrapeMasterList: () => {} } as unknown as GrapeMasterContextType);

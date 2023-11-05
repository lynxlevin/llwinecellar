import { createContext } from 'react';

interface WineRegionContextType {
    wineRegionList: string[];
    setWineRegionList: React.Dispatch<React.SetStateAction<string[]>>;
}

export const WineRegionContext = createContext({ wineRegionList: [], setWineRegionList: () => {} } as unknown as WineRegionContextType);

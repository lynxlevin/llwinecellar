import { createContext } from 'react';

interface WineTagContextType {
    wineTagList: string[];
    setWineTagList: React.Dispatch<React.SetStateAction<string[]>>;
}

export const WineTagContext = createContext({ wineTagList: [], setWineTagList: () => {} } as unknown as WineTagContextType);

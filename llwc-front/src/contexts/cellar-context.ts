import { createContext } from 'react';

export interface Cellar {
    id: string;
    name: string;
    layout: number[];
    hasBasket: boolean;
}

interface CellarContextType {
    list: Cellar[];
    setList: React.Dispatch<React.SetStateAction<Cellar[]>>;
}

export const CellarContext = createContext({ list: [], setList: () => {} } as unknown as CellarContextType);

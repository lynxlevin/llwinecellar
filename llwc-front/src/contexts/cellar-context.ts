import { createContext } from 'react';

export interface Cellar {
    id: string;
    name: string;
    layout: number[];
    hasBasket: boolean;
}

interface CellarContextType {
    cellarList: Cellar[];
    setCellarList: React.Dispatch<React.SetStateAction<Cellar[]>>;
}

export const CellarContext = createContext({
    cellarList: [],
    setCellarList: () => {},
} as unknown as CellarContextType);

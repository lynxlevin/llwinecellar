import { createContext } from 'react';

export interface Cepage {
    name: string;
    abbreviation: string | null;
    percentage: number | null;
}

export interface WineData {
    id: string;
    name: string;
    producer: string;
    country: string;
    region_1: string;
    region_2: string;
    region_3: string;
    region_4: string;
    region_5: string;
    cepages: Cepage[];
    vintage: number;
    bought_at: string | null;
    bought_from: string;
    price_with_tax: number;
    drunk_at: string | null;
    note: string;
    cellar_name: string;
    cellar_id: string | null;
    position: string | null;
    tag_texts: string[];
}

interface WineContextType {
    wineList: WineData[];
    setWineList: React.Dispatch<React.SetStateAction<WineData[]>>;
}

export const WineContext = createContext({ wineList: [], setWineList: () => {} } as unknown as WineContextType);

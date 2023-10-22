import { createContext } from 'react';

export interface Cepage {
    name: string;
    abbreviation: string | null;
    percentage: number | null;
}

const wineDataKeys = [
    'id',
    'name',
    'producer',
    'country',
    'region_1',
    'region_2',
    'region_3',
    'region_4',
    'region_5',
    'cepages',
    'vintage',
    'bought_at',
    'bought_from',
    'price_with_tax',
    'drunk_at',
    'note',
    'tag_texts',
    'cellar_id',
    'position',
] as const;

export type WineDataKeys = (typeof wineDataKeys)[number];

export interface WineData {
    id: string;
    name: string;
    producer: string;
    country: string | null;
    region_1: string;
    region_2: string;
    region_3: string;
    region_4: string;
    region_5: string;
    cepages: Cepage[];
    vintage: number | null;
    bought_at: string | null;
    bought_from: string;
    price_with_tax: number | null;
    drunk_at: string | null;
    note: string;
    tag_texts: string[];
    cellar_id: string | null;
    position: string | null;
}

export interface WineListQuery {
    is_drunk: boolean;
    out_of_cellars?: boolean;
    cellar_id?: string;
}

interface WineContextType {
    wineList: WineData[];
    setWineList: React.Dispatch<React.SetStateAction<WineData[]>>;
    wineListQuery: WineListQuery;
    setWineListQuery: React.Dispatch<React.SetStateAction<WineListQuery>>;
}

export const WineContext = createContext({
    wineList: [],
    setWineList: () => {},
    wineListQuery: {},
} as unknown as WineContextType);

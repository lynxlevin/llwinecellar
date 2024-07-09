import { createContext } from 'react';

export interface Cepage {
    name: string;
    abbreviation: string | null;
    percentage: string | null;
}

const columnKeys = [
    'id',
    'name',
    'producer',
    'regions',
    'cepages',
    'vintage',
    'bought_at',
    'bought_from',
    'price',
    'drunk_at',
    'note',
    'tag_texts',
    'cellar_id',
    'position',
    'value',
] as const;

export type ColumnKeys = (typeof columnKeys)[number];

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
    price: number | null;
    drunk_at: string | null;
    note: string;
    tag_texts: string[];
    cellar_id: string | null;
    position: string | null;
    value: number | null;
}

export interface WineDataWithRegions {
    id: string;
    name: string;
    producer: string;
    country: string | null;
    regions: string;
    region_1: string;
    region_2: string;
    region_3: string;
    region_4: string;
    region_5: string;
    cepages: Cepage[];
    vintage: number | null;
    bought_at: string | null;
    bought_from: string;
    price: number | null;
    drunk_at: string | null;
    note: string;
    tag_texts: string[];
    cellar_id: string | null;
    position: string | null;
    value: number | null;
}

export interface WineSearchQuery {
    cellarId: string;
    showStock: boolean;
    showDrunk: boolean;
    nameOrProducer: string;
    country: string | null;
    region_1: string;
    region_2: string;
    region_3: string;
    region_4: string;
    region_5: string;
    cepages: Cepage[];
    drunkAt: { gte: string | null; lte: string | null };
}

export const ALL_WINES_QUERY: WineSearchQuery = {
    cellarId: '-',
    showStock: true,
    showDrunk: true,
    nameOrProducer: '',
    country: null,
    region_1: '',
    region_2: '',
    region_3: '',
    region_4: '',
    region_5: '',
    cepages: [],
    drunkAt: { gte: null, lte: null },
};

interface WineContextType {
    wineList: WineDataWithRegions[];
    setWineList: React.Dispatch<React.SetStateAction<WineDataWithRegions[]>>;
    wineSearchQuery: WineSearchQuery;
    setWineSearchQuery: React.Dispatch<React.SetStateAction<WineSearchQuery>>;
}

export const WineContext = createContext({
    wineList: [],
    setWineList: () => {},
    wineSearchQuery: {},
    setWineSearchQuery: () => {},
} as unknown as WineContextType);

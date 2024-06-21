import { useCallback, useContext, useState } from 'react';
import { ALL_WINES_QUERY, Cepage, WineContext, ColumnKeys, WineSearchQuery } from '../contexts/wine-context';
import { CellarContext } from '../contexts/cellar-context';
import useWineAPI from './useWineAPI';

export type Order = 'asc' | 'desc';

export interface SortOrder {
    key: ColumnKeys;
    order: Order;
}

const useWineContext = () => {
    const wineContext = useContext(WineContext);
    const cellarContext = useContext(CellarContext);

    const { listWines } = useWineAPI();

    // MYMEMO: Maybe better to move into context, and then this hook can be called from multiple places.
    const [isLoading, setIsLoading] = useState(false);

    const wineCount = wineContext.wineList.length;

    const getCepageAbbreviations = (cepages: Cepage[]) => {
        if (cepages.length === 0) return '';
        return cepages
            .map(c => {
                if (c.abbreviation === '') return c.name;
                return c.abbreviation;
            })
            .join(', ');
    };

    const compare = <T,>(a: T, b: T, orderKey: keyof T) => {
        if (orderKey === 'tag_texts') {
            if ((b[orderKey] as string[]).join(', ') < (a[orderKey] as string[]).join(', ')) return 1;
            if ((b[orderKey] as string[]).join(', ') > (a[orderKey] as string[]).join(', ')) return -1;
            return 0;
        }
        if (orderKey === 'cepages') {
            if (getCepageAbbreviations(b[orderKey] as Cepage[]) < getCepageAbbreviations(a[orderKey] as Cepage[])) return 1;
            if (getCepageAbbreviations(b[orderKey] as Cepage[]) > getCepageAbbreviations(a[orderKey] as Cepage[])) return -1;
            return 0;
        }
        if (b[orderKey] < a[orderKey]) return 1;
        if (b[orderKey] > a[orderKey]) return -1;
        return 0;
    };

    const ascendingComparator = useCallback(<T,>(a: T, b: T, orderKey: keyof T) => {
        if (orderKey === 'tag_texts' || orderKey === 'cepages') {
            if ((a[orderKey] as string[]).length === 0) return 1;
            if ((b[orderKey] as string[]).length === 0) return -1;
            return compare(a, b, orderKey);
        }
        if (!a[orderKey]) return 1;
        if (!b[orderKey]) return -1;
        return compare(a, b, orderKey);
    }, []);

    const descendingComparator = useCallback(<T,>(a: T, b: T, orderKey: keyof T) => {
        if (!a[orderKey]) return 1;
        if (!b[orderKey]) return -1;
        return -compare(a, b, orderKey);
    }, []);

    const getComparator = useCallback(
        <Key extends keyof any>(
            order: Order,
            orderKey: Key,
        ): ((
            a: { [key in Key]: number | string | null | Cepage[] | string[] },
            b: { [key in Key]: number | string | null | Cepage[] | string[] },
        ) => number) => {
            return order === 'desc' ? (a, b) => descendingComparator(a, b, orderKey) : (a, b) => ascendingComparator(a, b, orderKey);
        },
        [ascendingComparator, descendingComparator],
    );

    const getSortedWineList = (sortOrder: SortOrder) => {
        return wineContext.wineList.sort(getComparator(sortOrder.order, sortOrder.key));
    };

    const initializeWineSearch = useCallback(() => {
        if (cellarContext.cellarList.length === 0) return;
        setIsLoading(true);
        const query = { ...ALL_WINES_QUERY, cellarId: cellarContext.cellarList[0].id, showDrunk: false, showStock: true };
        wineContext.setWineSearchQuery(query);
        listWines(query).then(wines => {
            wineContext.setWineList(wines);
            setIsLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cellarContext.cellarList]);

    const searchWine = useCallback(
        (query?: WineSearchQuery) => {
            const params = query ? { ...ALL_WINES_QUERY, ...query } : wineContext.wineSearchQuery;
            if (query) wineContext.setWineSearchQuery(params);
            setIsLoading(true);
            listWines(params).then(wines => {
                wineContext.setWineList(wines);
                setIsLoading(false);
            });
        },
        [listWines, wineContext],
    );

    const setQuery = (query?: Partial<WineSearchQuery>) => {
        if (query) {
            wineContext.setWineSearchQuery({ ...ALL_WINES_QUERY, ...query });
        } else {
            wineContext.setWineSearchQuery(ALL_WINES_QUERY);
        }
    };

    return {
        isLoading,
        wineCount,
        getCepageAbbreviations,
        getSortedWineList,
        initializeWineSearch,
        searchWine,
        setQuery,
    };
};

export default useWineContext;

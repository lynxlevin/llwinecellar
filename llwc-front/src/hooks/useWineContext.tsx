import { useCallback, useContext, useState } from 'react';
import { Cepage, WineContext, WineDataKeys, WineSearchQuery } from '../contexts/wine-context';
import { ListWineQuery, WineAPI } from '../apis/WineAPI';

export type Order = 'asc' | 'desc';

export interface SortOrder {
    key: WineDataKeys;
    order: Order;
}

const useWineContext = () => {
    const wineContext = useContext(WineContext);

    // MYMEMO: Maybe better to move into context, and then this hook can be called at multiple places.
    const [isLoading, setIsLoading] = useState(true);

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
        if (wineContext.wineListQuery.cellarId === undefined) return;
        setIsLoading(true);
        WineAPI.list({ cellar_id: wineContext.wineListQuery.cellarId, show_drunk: false, show_stock: true }).then(res => {
            wineContext.setWineList(res.data.wines);
            setIsLoading(false);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wineContext.wineListQuery.cellarId]);

    const searchWine = useCallback(
        (query?: WineSearchQuery) => {
            const params = query ?? wineContext.wineSearchQuery;
            setIsLoading(true);
            WineAPI.list(params as ListWineQuery).then(res => {
                wineContext.setWineList(res.data.wines);
                setIsLoading(false);
            });
        },
        [wineContext],
    );

    return {
        isLoading,
        wineCount,
        getCepageAbbreviations,
        getSortedWineList,
        initializeWineSearch,
        searchWine,
    };
};

export default useWineContext;

import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UserContext } from '../contexts/user-context';
import { Cepage, WineContext, WineData, WineDataKeys } from '../contexts/wine-context';
import useWineAPI from './useWineAPI';

export type Order = 'asc' | 'desc';
export type WineDialogAction = 'create' | 'edit';

export const COLUMN_ORDER: WineDataKeys[] = [
    'position',
    'tag_texts',
    'name',
    'producer',
    'vintage',
    'price',
    'drunk_at',
    'country',
    'region_1',
    'region_2',
    'region_3',
    'region_4',
    'region_5',
    'cepages',
    'bought_at',
    'bought_from',
]

const useWineSearchPage = () => {
    const userContext = useContext(UserContext);
    const wineContext = useContext(WineContext);

    const { getWineList } = useWineAPI();

    const [sortOrder, setSortOrder] = useState<{ key: WineDataKeys; order: Order }>({ key: 'position', order: 'asc' });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [selectedWine, setSelectedWine] = useState<WineData>();
    const [wineDialogState, setWineDialogState] = useState<{ open: boolean; action: WineDialogAction }>({ open: false, action: 'create' });
    const [isLoading, setIsLoading] = useState(true);

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - wineContext.wineList.length) : 0;

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: WineDataKeys) => {
        const isAsc = sortOrder.key === property && sortOrder.order === 'asc';
        setSortOrder({ key: property, order: isAsc ? 'desc' : 'asc' });
    };

    const handleClickRow = (event: React.MouseEvent<unknown>, row: WineData) => {
        const isFirstClick = selectedWine?.id !== row.id;
        setSelectedWine(row);
        if (isFirstClick) return;
        selectedWine.name === '' ? setWineDialogState({ open: true, action: 'create' }) : setWineDialogState({ open: true, action: 'edit' });
    };

    const closeWineDialog = () => {
        setWineDialogState(current => {
            return { ...current, open: false };
        });
    };

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

    const visibleRows = useMemo(() => {
        return wineContext.wineList.sort(getComparator(sortOrder.order, sortOrder.key)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [getComparator, page, rowsPerPage, sortOrder, wineContext.wineList]);

    useEffect(() => {
        if (userContext.isLoggedIn === true && wineContext.wineListQuery.cellarId !== undefined) {
            getWineList();
            setIsLoading(false);
        }
    }, [getWineList, userContext.isLoggedIn, wineContext.wineListQuery.cellarId]);

    return {
        sortOrder,
        handleRequestSort,
        rowsCount: wineContext.wineList.length,
        visibleRows,
        selectedWine,
        wineDialogState,
        handleClickRow,
        closeWineDialog,
        emptyRows,
        rowsPerPage,
        page,
        handleChangePage,
        handleChangeRowsPerPage,
        getCepageAbbreviations,
        isLoading,
    };
};

export default useWineSearchPage;

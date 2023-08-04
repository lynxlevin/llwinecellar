import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CellarContext } from '../contexts/cellar-context';
import { UserAPI } from '../apis/UserAPI';
import { WineAPI } from '../apis/WineAPI';
import { SelectChangeEvent } from '@mui/material';

export interface WineData {
    id: string;
    drink_when: string;
    name: string;
    producer: string;
    country: string;
    region_1: string;
    region_2: string;
    region_3: string;
    region_4: string;
    region_5: string;
    cepage: string;
    vintage: number;
    bought_at: string;
    bought_from: string;
    price_with_tax: number;
    drunk_at: string;
    note: string;
    cellar_name: string;
    cellar_id: string;
    // MYMEMO: | null をどうするか？
    // row: number | null;
    // column: number | null;
    row: number;
    column: number;
    position: string;
}

export type Order = 'asc' | 'desc';

export interface WineHeadCell {
    id: keyof WineData;
    numeric: boolean;
    disablePadding: boolean;
    label: string;
}

const useWineListPage = () => {
    const cellarContext = useContext(CellarContext);
    const [selectedCellar, setSelectedCellar] = useState<string>('allCellars');
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof WineData>('drink_when');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [wineRows, setWineRows] = useState<WineData[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

    const handleCellarSelect = (event: SelectChangeEvent) => {
        setSelectedCellar(event.target.value);
    };

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof WineData) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleClick = (event: React.MouseEvent<unknown>, row: WineData) => {
        console.log(row.id);
        console.log(row.drunk_at);
        console.log(row.drunk_at === null);
        console.log(typeof row.drunk_at);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const toTitleCase = (text: string): string => {
        return text
            .toLowerCase()
            .split('_')
            .map(function (word: string) {
                return word.replace(word[0], word[0].toUpperCase());
            })
            .join(' ');
    };

    const getWineHeadCell = useCallback((id: keyof WineData, numeric: boolean, disablePadding: boolean): WineHeadCell => {
        const label = toTitleCase(id);
        return {
            id,
            numeric,
            disablePadding,
            label,
        };
    }, []);

    const wineHeadCells: WineHeadCell[] = useMemo(() => {
        return [
            getWineHeadCell('drink_when', false, false),
            ...(selectedCellar === 'allCellars' ? [getWineHeadCell('cellar_name', false, false)] : []),
            getWineHeadCell('position', false, false),
            getWineHeadCell('name', false, false),
            getWineHeadCell('producer', false, false),
            getWineHeadCell('country', false, false),
            getWineHeadCell('region_1', false, false),
            getWineHeadCell('region_2', false, false),
            getWineHeadCell('region_3', false, false),
            getWineHeadCell('region_4', false, false),
            getWineHeadCell('region_5', false, false),
            getWineHeadCell('cepage', false, false),
            getWineHeadCell('vintage', true, false),
            getWineHeadCell('bought_at', false, false),
            getWineHeadCell('bought_from', false, false),
            getWineHeadCell('price_with_tax', true, false),
        ];
    }, [getWineHeadCell, selectedCellar]);

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - wineRows.length) : 0;

    const compare = <T,>(a: T, b: T, orderBy: keyof T) => {
        if (b[orderBy] < a[orderBy]) {
            return 1;
        }
        if (b[orderBy] > a[orderBy]) {
            return -1;
        }
        return 0;
    };

    const ascendingComparator = useCallback(<T,>(a: T, b: T, orderBy: keyof T) => {
        if (!a[orderBy]) {
            return 1;
        }
        if (!b[orderBy]) {
            return -1;
        }
        return compare(a, b, orderBy);
    }, []);

    const descendingComparator = useCallback(<T,>(a: T, b: T, orderBy: keyof T) => {
        if (!a[orderBy]) {
            return 1;
        }
        if (!b[orderBy]) {
            return -1;
        }
        return -compare(a, b, orderBy);
    }, []);

    const getComparator = useCallback(
        <Key extends keyof any>(order: Order, orderBy: Key): ((a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number) => {
            return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => ascendingComparator(a, b, orderBy);
        },
        [ascendingComparator, descendingComparator],
    );

    const visibleRows = useMemo(
        () =>
            wineRows
                .filter(wine => {
                    if (selectedCellar === 'allCellars') {
                        return true;
                    } else {
                        return wine.cellar_id === selectedCellar;
                    }
                })
                .sort(getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [getComparator, order, orderBy, page, rowsPerPage, selectedCellar, wineRows],
    );

    const initializeData = async () => {
        const session_res = await UserAPI.session();
        const isAuthenticated = session_res.data.is_authenticated;
        setIsLoggedIn(isAuthenticated);
        if (isAuthenticated) {
            const query = { is_drunk: false };
            const res = await WineAPI.list(query);
            const wineData = res.data.wines;
            setWineRows(wineData);
        }
    };

    // MYMEMO: fix cellarList being empty on reloading on this page
    // App で useEffect して、session & getCellar?
    // useUserAPI 作って、ログイン後、ログアウト後アクションをまとめる。その関係でリロード直後のアクションも作れそう。 (セッション確認、ログインへのリダイレクトなども一緒に)
    const cellarList = cellarContext.list.map(cellar => [cellar.id, cellar.name]);
    const cellarNames = Object.fromEntries(cellarList);

    useEffect(() => {
        void initializeData();
    }, []);

    return {
        isLoggedIn,
        selectedCellar,
        handleCellarSelect,
        order,
        orderBy,
        handleRequestSort,
        visibleRows,
        handleClick,
        cellarList,
        cellarNames,
        wineHeadCells,
        emptyRows,
        wineRows,
        rowsPerPage,
        page,
        handleChangePage,
        handleChangeRowsPerPage,
    };
};

export default useWineListPage;

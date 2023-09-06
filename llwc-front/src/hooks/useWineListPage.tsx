import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CellarContext } from '../contexts/cellar-context';
import { WineAPI } from '../apis/WineAPI';
import { SelectChangeEvent } from '@mui/material';
import { UserContext } from '../contexts/user-context';

interface Cepage {
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

export type Order = 'asc' | 'desc';

export interface WineHeadCell {
    id: keyof WineData;
    numeric: boolean;
    disablePadding: boolean;
    label: string;
}

const useWineListPage = () => {
    const userContext = useContext(UserContext);
    const cellarContext = useContext(CellarContext);
    const [selectedCellars, setSelectedCellars] = useState<string[]>([]);
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof WineData>('tag_texts');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [wineRows, setWineRows] = useState<WineData[]>([]);

    const handleCellarSelect = (event: SelectChangeEvent) => {
        const {
            target: { value },
        } = event;
        setSelectedCellars(typeof value === 'string' ? value.split(',') : value);
    };

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof WineData) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleClick = (event: React.MouseEvent<unknown>, row: WineData) => {
        console.log(row.id);
        console.log(row.cellar_id);
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
            ...(selectedCellars.length !== 1 ? [getWineHeadCell('cellar_name', false, false)] : []),
            getWineHeadCell('tag_texts', false, false),
            ...(selectedCellars.toString() !== 'null' ? [getWineHeadCell('position', false, false)] : []),
            getWineHeadCell('name', false, false),
            getWineHeadCell('producer', false, false),
            getWineHeadCell('country', false, false),
            getWineHeadCell('region_1', false, false),
            getWineHeadCell('region_2', false, false),
            getWineHeadCell('region_3', false, false),
            getWineHeadCell('region_4', false, false),
            getWineHeadCell('region_5', false, false),
            getWineHeadCell('cepages', false, false),
            getWineHeadCell('vintage', true, false),
            getWineHeadCell('bought_at', false, false),
            getWineHeadCell('bought_from', false, false),
            getWineHeadCell('price_with_tax', true, false),
        ];
    }, [getWineHeadCell, selectedCellars]);

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - wineRows.length) : 0;

    const compare = <T,>(a: T, b: T, orderBy: keyof T) => {
        if (orderBy === 'tag_texts') {
            if ((b[orderBy] as string[]).join(', ') < (a[orderBy] as string[]).join(', ')) return 1;
            if ((b[orderBy] as string[]).join(', ') > (a[orderBy] as string[]).join(', ')) return -1;
            return 0;
        }
        if (orderBy === 'cepages') {
            if (getCepageAbbreviations(b[orderBy] as Cepage[]) < getCepageAbbreviations(a[orderBy] as Cepage[])) return 1;
            if (getCepageAbbreviations(b[orderBy] as Cepage[]) > getCepageAbbreviations(a[orderBy] as Cepage[])) return -1;
            return 0;
        }
        if (b[orderBy] < a[orderBy]) return 1;
        if (b[orderBy] > a[orderBy]) return -1;
        return 0;
    };

    const ascendingComparator = useCallback(<T,>(a: T, b: T, orderBy: keyof T) => {
        if (orderBy === 'tag_texts' || orderBy === 'cepages') {
            if ((a[orderBy] as string[]).length === 0) return 1;
            if ((b[orderBy] as string[]).length === 0) return -1;
            return compare(a, b, orderBy);
        }
        if (!a[orderBy]) return 1;
        if (!b[orderBy]) return -1;
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
        <Key extends keyof any>(
            order: Order,
            orderBy: Key,
        ): ((
            a: { [key in Key]: number | string | null | Cepage[] | string[] },
            b: { [key in Key]: number | string | null | Cepage[] | string[] },
        ) => number) => {
            return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => ascendingComparator(a, b, orderBy);
        },
        [ascendingComparator, descendingComparator],
    );

    const visibleRows = useMemo(() => {
        const cellars: (string | null)[] = selectedCellars.slice();
        if (cellars.includes('null')) {
            const index = cellars.indexOf('null');
            cellars.splice(index, 1);
            cellars.push(null);
        }
        return wineRows
            .filter(wine => cellars.includes(wine.cellar_id))
            .sort(getComparator(order, orderBy))
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [getComparator, order, orderBy, page, rowsPerPage, selectedCellars, wineRows]);

    const getWines = async () => {
        const query = { is_drunk: false };
        const res = await WineAPI.list(query);
        const wineData = res.data.wines;
        setWineRows(wineData);
    };

    const cellarList = cellarContext.list.map(cellar => [cellar.id, cellar.name]);
    const cellarNames = Object.fromEntries(cellarList);

    const getCepageAbbreviations = (cepages: Cepage[]) => {
        if (cepages.length === 0) return '';
        return cepages
            .map(c => {
                if (c.abbreviation === null) return c.name;
                return c.abbreviation;
            })
            .join(', ');
    };

    useEffect(() => {
        if (userContext.isLoggedIn === true) {
            getWines();
            const cellars = cellarContext.list.map(cellar => cellar.id);
            setSelectedCellars([...cellars, 'null']);
        }
    }, [cellarContext.list, userContext.isLoggedIn]);

    return {
        selectedCellars,
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
        rowsPerPage,
        page,
        handleChangePage,
        handleChangeRowsPerPage,
        getCepageAbbreviations,
    };
};

export default useWineListPage;

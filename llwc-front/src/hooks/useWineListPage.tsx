import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CellarContext } from '../contexts/cellar-context';
import { UserContext } from '../contexts/user-context';
import { Cepage, WineContext, WineData } from '../contexts/wine-context';
import useWineAPI from './useWineAPI';

export type Order = 'asc' | 'desc';

const useWineListPage = () => {
    const userContext = useContext(UserContext);
    const cellarContext = useContext(CellarContext);
    const wineContext = useContext(WineContext);

    const { getWineList } = useWineAPI();

    const [selectedCellars, setSelectedCellars] = useState<string[]>([]);
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof WineData>('tag_texts');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [selectedWine, setSelectedWine] = useState<WineData>();
    const [isEditOpen, setIsEditOpen] = useState(false);

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - wineContext.wineList.length) : 0;

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const cellarList = cellarContext.list.map(cellar => [cellar.id, cellar.name]);
    const cellarNames = Object.fromEntries(cellarList);

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof WineData) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleClickRow = (event: React.MouseEvent<unknown>, row: WineData) => {
        if (selectedWine?.id === row.id) {
            setIsEditOpen(true);
        } else {
            setSelectedWine(row);
        }
    };

    const closeEditWineDialog = () => {
        setIsEditOpen(false);
    };

    const getCepageAbbreviations = (cepages: Cepage[]) => {
        if (cepages.length === 0) return '';
        return cepages
            .map(c => {
                if (c.abbreviation === null) return c.name;
                return c.abbreviation;
            })
            .join(', ');
    };

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

    const winesInSelectedCellars = useMemo(() => {
        const cellars: (string | null)[] = selectedCellars.slice();
        if (cellars.includes('null')) {
            const index = cellars.indexOf('null');
            cellars.splice(index, 1);
            cellars.push(null);
        }
        return wineContext.wineList.filter(wine => cellars.includes(wine.cellar_id));
    }, [selectedCellars, wineContext.wineList]);

    const visibleRows = useMemo(() => {
        return winesInSelectedCellars.sort(getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [getComparator, order, orderBy, page, rowsPerPage, winesInSelectedCellars]);

    useEffect(() => {
        if (userContext.isLoggedIn === true) {
            const cellars = cellarContext.list.map(cellar => cellar.id);
            setSelectedCellars([...cellars, 'null']);
        }
    }, [cellarContext.list, userContext.isLoggedIn]);

    useEffect(() => {
        if (userContext.isLoggedIn === true) {
            getWineList();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userContext.isLoggedIn]);

    return {
        selectedCellars,
        setSelectedCellars,
        order,
        orderBy,
        handleRequestSort,
        winesInSelectedCellars,
        visibleRows,
        selectedWine,
        handleClickRow,
        closeEditWineDialog,
        isEditOpen,
        cellarList,
        cellarNames,
        emptyRows,
        rowsPerPage,
        page,
        handleChangePage,
        handleChangeRowsPerPage,
        getCepageAbbreviations,
    };
};

export default useWineListPage;

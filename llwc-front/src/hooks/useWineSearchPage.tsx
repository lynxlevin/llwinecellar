import { useMemo, useState } from 'react';
import { WineData, ColumnKeys } from '../contexts/wine-context';
import useWineContext, { SortOrder } from './useWineContext';

export type WineDialogAction = 'create' | 'edit';

export const COLUMN_ORDER: ColumnKeys[] = [
    'value',
    'position',
    'tag_texts',
    'name',
    'producer',
    'vintage',
    'price',
    'drunk_at',
    'regions',
    'cepages',
    'bought_at',
    'bought_from',
];

const useWineSearchPage = () => {
    const { wineCount, getSortedWineList } = useWineContext();

    const [sortOrder, setSortOrder] = useState<SortOrder>({ key: 'position', order: 'asc' });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(9999);
    const [selectedWine, setSelectedWine] = useState<WineData>();
    const [wineDialogState, setWineDialogState] = useState<{ open: boolean; action: WineDialogAction }>({ open: false, action: 'create' });

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - wineCount) : 0;

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: ColumnKeys) => {
        const isAsc = sortOrder.key === property && sortOrder.order === 'asc';
        setSortOrder({ key: property, order: isAsc ? 'desc' : 'asc' });
    };

    const handleClickRow = (event: React.MouseEvent<unknown>, row: WineData) => {
        const isFirstClick = selectedWine?.id !== row.id;
        setSelectedWine(row);
        if (isFirstClick) return;
        selectedWine.name === '' ? setWineDialogState({ open: true, action: 'create' }) : setWineDialogState({ open: true, action: 'edit' });
    };

    const openCreateWineDialog = () => {
        setSelectedWine(undefined);
        setWineDialogState({ open: true, action: 'create' });
    };

    const closeWineDialog = () => {
        setWineDialogState(current => {
            return { ...current, open: false };
        });
    };

    const visibleRows = useMemo(() => {
        return getSortedWineList(sortOrder).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [getSortedWineList, page, rowsPerPage, sortOrder]);

    return {
        sortOrder,
        handleRequestSort,
        visibleRows,
        selectedWine,
        wineDialogState,
        openCreateWineDialog,
        handleClickRow,
        closeWineDialog,
        emptyRows,
        rowsPerPage,
        page,
        handleChangePage,
        handleChangeRowsPerPage,
    };
};

export default useWineSearchPage;

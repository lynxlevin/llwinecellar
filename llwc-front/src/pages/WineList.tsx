import React, { useState, useEffect, useMemo, useContext } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';
import { WineAPI } from '../apis/WineAPI';
import { Navigate } from 'react-router-dom';
import { UserAPI } from '../apis/UserAPI';
import { CellarContext } from '../contexts/cellar-context';

// Originally copied from https://mui.com/material-ui/react-table/#sorting-amp-selecting

interface WineData {
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

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

interface WineHeadCell {
    id: keyof WineData;
    numeric: boolean;
    disablePadding: boolean;
    label: string;
}

function toTitleCase(text: string): string {
    return text
        .toLowerCase()
        .split('_')
        .map(function (word: string) {
            return word.replace(word[0], word[0].toUpperCase());
        })
        .join(' ');
}

function getWineHeadCell(id: keyof WineData, numeric: boolean, disablePadding: boolean): WineHeadCell {
    const label = toTitleCase(id);
    return {
        id,
        numeric,
        disablePadding,
        label,
    };
}

const wineHeadCells: readonly WineHeadCell[] = [
    getWineHeadCell('cellar_name', false, false),
    getWineHeadCell('position', false, false),
    getWineHeadCell('name', false, false),
    getWineHeadCell('drink_when', false, false),
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
    getWineHeadCell('drunk_at', false, false),
];

interface EnhancedTableHeadProps {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof WineData) => void;
    order: Order;
    orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableHeadProps) {
    const { order, orderBy, onRequestSort } = props;
    // MYMEMO: fix sort on position
    // MYMEMO: make drink_when sortable
    // MYMEMO: prevent null being at the top
    const createSortHandler = (property: keyof WineData) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {wineHeadCells.map(headCell => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

interface EnhancedTableToolbarProps {
    tableTitle: string;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
    const { tableTitle } = props;

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
            }}
        >
            <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
                {tableTitle}
            </Typography>
            {/* MYMEMO: cellar は ドロップダウンで選ぶように */}
            <Tooltip title="Filter list">
                <IconButton>
                    <FilterListIcon />
                </IconButton>
            </Tooltip>
        </Toolbar>
    );
}

export default function WineList() {
    const cellarContext = useContext(CellarContext);
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof WineData>('drink_when');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [wineRows, setWineRows] = useState<WineData[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

    const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof WineData) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleClick = (event: React.MouseEvent<unknown>, id: string, name: string) => {
        console.log(id);
        console.log(name);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - wineRows.length) : 0;

    const visibleRows = useMemo(
        () =>
            wineRows
                .slice()
                .sort(getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [order, orderBy, page, rowsPerPage, wineRows],
    );

    const initializeData = async () => {
        const session_res = await UserAPI.session();
        const isAuthenticated = session_res.data.is_authenticated;
        setIsLoggedIn(isAuthenticated);
        if (isAuthenticated) {
            const res = await WineAPI.list();
            const wineData = res.data.wines;
            setWineRows(wineData);
        }
    };

    // MYMEMO: fix cellarList being empty on reloadin on this page
    // App で useEffect して、session & getCellar?
    // useUserAPI 作って、ログイン後、ログアウト後アクションをまとめる。その関係でリロード直後のアクションも作れそう。 (セッション確認、ログインへのリダイレクトなども一緒に)
    const cellarList = cellarContext.list.map(cellar => [cellar.id, cellar.name]);
    const cellarNames = Object.fromEntries(cellarList);

    useEffect(() => {
        void initializeData();
    }, []);

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }
    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <EnhancedTableToolbar tableTitle="Wine List" />
                <TableContainer>
                    <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="medium">
                        <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
                        <TableBody>
                            {visibleRows.map((row, index) => {
                                const labelId = `enhanced-table-checkbox-${index}`;

                                return (
                                    <TableRow
                                        hover
                                        onClick={event => handleClick(event, row.id, row.name)}
                                        role="checkbox"
                                        tabIndex={-1}
                                        key={row.name}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell>{cellarNames[row.cellar_id]}</TableCell>
                                        <TableCell>
                                            {row.row}-{row.column}
                                        </TableCell>
                                        <TableCell component="th" id={labelId} scope="row">
                                            {row.name}
                                        </TableCell>
                                        <TableCell align="right">{row.drink_when}</TableCell>
                                        <TableCell align="right">{row.producer}</TableCell>
                                        <TableCell align="right">{row.country}</TableCell>
                                        <TableCell align="right">{row.region_1}</TableCell>
                                        <TableCell align="right">{row.region_2}</TableCell>
                                        <TableCell align="right">{row.region_3}</TableCell>
                                        <TableCell align="right">{row.region_4}</TableCell>
                                        <TableCell align="right">{row.region_5}</TableCell>
                                        <TableCell align="right">{row.cepage}</TableCell>
                                        <TableCell align="right">{row.vintage}</TableCell>
                                        <TableCell align="right">{row.bought_at}</TableCell>
                                        <TableCell align="right">{row.bought_from}</TableCell>
                                        <TableCell align="right">{row.price_with_tax}</TableCell>
                                        <TableCell align="right">{row.drunk_at}</TableCell>
                                    </TableRow>
                                );
                            })}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: 53 * emptyRows,
                                    }}
                                >
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={wineRows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
}

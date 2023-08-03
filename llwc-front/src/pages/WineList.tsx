import React from 'react';
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
import { Navigate } from 'react-router-dom';
import useWineListPage, { WineData, WineHeadCell, Order } from '../hooks/useWineListPage';

// Originally copied from https://mui.com/material-ui/react-table/#sorting-amp-selecting

const toTitleCase = (text: string): string => {
    return text
        .toLowerCase()
        .split('_')
        .map(function (word: string) {
            return word.replace(word[0], word[0].toUpperCase());
        })
        .join(' ');
};

const getWineHeadCell = (id: keyof WineData, numeric: boolean, disablePadding: boolean): WineHeadCell => {
    const label = toTitleCase(id);
    return {
        id,
        numeric,
        disablePadding,
        label,
    };
};

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

const EnhancedTableHead = (props: EnhancedTableHeadProps) => {
    const { order, orderBy, onRequestSort } = props;
    // MYMEMO: fix sort on position. It happens because there's no position in wine list from api
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
};

interface EnhancedTableToolbarProps {
    tableTitle: string;
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
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
};

export const WineList = () => {
    const {
        isLoggedIn,
        order,
        orderBy,
        handleRequestSort,
        visibleRows,
        handleClick,
        cellarNames,
        emptyRows,
        wineRows,
        rowsPerPage,
        page,
        handleChangePage,
        handleChangeRowsPerPage,
    } = useWineListPage();

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
                                        onClick={event => handleClick(event, row)}
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
};

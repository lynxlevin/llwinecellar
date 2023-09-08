import React, { useContext } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Toolbar,
    Typography,
    Select,
    MenuItem,
    SelectChangeEvent,
} from '@mui/material';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';
import { Navigate } from 'react-router-dom';
import useWineListPage, { WineHeadCell, Order } from '../../hooks/useWineListPage';
import { WineData } from '../../contexts/wine-context';
import useUserAPI from '../../hooks/useUserAPI';
import { UserContext } from '../../contexts/user-context';
import EditWineDialog from './EditWineDialog';

// Originally copied from https://mui.com/material-ui/react-table/#sorting-amp-selecting

interface EnhancedTableHeadProps {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof WineData) => void;
    order: Order;
    orderBy: string;
    wineHeadCells: WineHeadCell[];
}

const EnhancedTableHead = (props: EnhancedTableHeadProps) => {
    const { order, orderBy, onRequestSort, wineHeadCells } = props;
    const createSortHandler = (property: keyof WineData) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
    };
    // MYMEMO: add filter

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
    handleCellarSelect: (event: SelectChangeEvent) => void;
    selectedCellars: string[];
    cellarList: string[][];
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
    const { tableTitle, handleCellarSelect, selectedCellars, cellarList } = props;

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
            <Select id="cellar-select" multiple value={selectedCellars as unknown as string} onChange={handleCellarSelect}>
                {cellarList.map(cellar => (
                    <MenuItem key={cellar[0]} value={cellar[0]}>
                        {cellar[1]}
                    </MenuItem>
                ))}
                <MenuItem value="null">NOT_IN_CELLAR</MenuItem>
            </Select>
            <Tooltip title="Filter list">
                <IconButton>
                    <FilterListIcon />
                </IconButton>
            </Tooltip>
        </Toolbar>
    );
};

export const WineList = () => {
    const userContext = useContext(UserContext);
    // MYMEMO: 全ページでこれだけするのは違和感
    useUserAPI();
    const {
        selectedCellars,
        handleCellarSelect,
        order,
        orderBy,
        handleRequestSort,
        visibleRows,
        selectedWine,
        handleClick,
        closeEditWineDialog,
        isEditOpen,
        cellarList,
        cellarNames,
        wineHeadCells,
        emptyRows,
        rowsPerPage,
        page,
        handleChangePage,
        handleChangeRowsPerPage,
        getCepageAbbreviations,
    } = useWineListPage();

    const tablePaginationHeight = '52px';

    if (userContext.isLoggedIn === false) {
        return <Navigate to="/login" />;
    }
    return (
        <div>
            <Box sx={{ width: '100%' }}>
                <Paper sx={{ width: '100%', mb: 2 }}>
                    <EnhancedTableToolbar
                        tableTitle="Wine List"
                        handleCellarSelect={handleCellarSelect}
                        selectedCellars={selectedCellars}
                        cellarList={cellarList}
                    />
                    <TableContainer sx={{ maxHeight: `calc(100vh - ${tablePaginationHeight})` }}>
                        <Table stickyHeader sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="medium">
                            <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} wineHeadCells={wineHeadCells} />
                            <TableBody>
                                {visibleRows.map((row, index) => {
                                    const labelId = `enhanced-table-checkbox-${index}`;

                                    return (
                                        <TableRow
                                            hover
                                            onClick={event => handleClick(event, row)}
                                            role="checkbox"
                                            selected={selectedWine?.id === row.id}
                                            tabIndex={-1}
                                            key={row.name}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            {selectedCellars.length !== 1 && (
                                                <TableCell>{row.cellar_id ? cellarNames[row.cellar_id] : cellarNames['null']}</TableCell>
                                            )}
                                            {selectedCellars.toString() !== 'null' && <TableCell>{row.position}</TableCell>}
                                            <TableCell>{row.tag_texts.join(', ')}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row">
                                                {row.name}
                                            </TableCell>
                                            <TableCell align="right">{row.producer}</TableCell>
                                            <TableCell align="right">{row.vintage}</TableCell>
                                            <TableCell align="right">{row.country}</TableCell>
                                            <TableCell align="right">{row.region_1}</TableCell>
                                            <TableCell align="right">{row.region_2}</TableCell>
                                            <TableCell align="right">{row.region_3}</TableCell>
                                            <TableCell align="right">{row.region_4}</TableCell>
                                            <TableCell align="right">{row.region_5}</TableCell>
                                            {/* MYMEMO: make cepages look like tags */}
                                            <TableCell align="right">{getCepageAbbreviations(row.cepages)}</TableCell>
                                            <TableCell align="right">{row.bought_at}</TableCell>
                                            <TableCell align="right">{row.bought_from}</TableCell>
                                            <TableCell align="right">{row.price_with_tax}</TableCell>
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
                        count={visibleRows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </Box>
            {selectedWine && <EditWineDialog isOpen={isEditOpen} handleClose={closeEditWineDialog} selectedWineId={selectedWine.id}></EditWineDialog>}
        </div>
    );
};

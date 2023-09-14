import React, { useContext, useMemo, useCallback } from 'react';
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
import useWineListPage, { Order } from '../../hooks/useWineListPage';
import { WineData } from '../../contexts/wine-context';
import useUserAPI from '../../hooks/useUserAPI';
import { UserContext } from '../../contexts/user-context';
import EditWineDialog from './EditWineDialog';

// Originally copied from https://mui.com/material-ui/react-table/#sorting-amp-selecting

interface WineHeadCell {
    id: keyof WineData;
    numeric: boolean;
}

interface WineListTableHeadProps {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof WineData) => void;
    order: Order;
    orderBy: string;
    selectedCellars: string[];
}

const WineListTableHead = (props: WineListTableHeadProps) => {
    const { order, orderBy, selectedCellars, onRequestSort } = props;
    const createSortHandler = (property: keyof WineData) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
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

    const wineHeadCells: WineHeadCell[] = useMemo(() => {
        return [
            ...(selectedCellars.length !== 1 ? [{ id: 'cellar_name', numeric: false }] : []),
            ...(selectedCellars.toString() !== 'null' ? [{ id: 'position', numeric: false }] : []),
            { id: 'tag_texts', numeric: false },
            { id: 'name', numeric: false },
            { id: 'producer', numeric: false },
            { id: 'vintage', numeric: true },
            { id: 'country', numeric: false },
            { id: 'region_1', numeric: false },
            { id: 'region_2', numeric: false },
            { id: 'region_3', numeric: false },
            { id: 'region_4', numeric: false },
            { id: 'region_5', numeric: false },
            { id: 'cepages', numeric: false },
            { id: 'bought_at', numeric: false },
            { id: 'bought_from', numeric: false },
            { id: 'price_with_tax', numeric: true },
        ] as WineHeadCell[];
    }, [selectedCellars]);
    // MYMEMO(後日): add filter

    return (
        <TableHead>
            <TableRow>
                {wineHeadCells.map(headCell => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding="normal"
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {toTitleCase(headCell.id)}
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

interface WineListToolbarProps {
    selectedCellars: string[];
    setSelectedCellars: React.Dispatch<React.SetStateAction<string[]>>;
    cellarList: string[][];
}

const WineListToolbar = (props: WineListToolbarProps) => {
    const { selectedCellars, setSelectedCellars, cellarList } = props;

    const handleCellarSelect = (event: SelectChangeEvent) => {
        const {
            target: { value },
        } = event;
        setSelectedCellars(typeof value === 'string' ? value.split(',') : value);
    };

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
            }}
        >
            <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
                Wine List
            </Typography>
            <Select id="cellar-select" multiple value={selectedCellars as unknown as string} onChange={handleCellarSelect}>
                {cellarList.map(cellar => (
                    <MenuItem key={cellar[0]} value={cellar[0]}>
                        {cellar[1]}
                    </MenuItem>
                ))}
                <MenuItem value="null">NOT_IN_CELLAR</MenuItem>
            </Select>
            {/* MYMEMO: add create page */}
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
    // MYMEMO(後日): 全ページでこれだけするのは違和感
    useUserAPI();
    const {
        selectedCellars,
        setSelectedCellars,
        order,
        orderBy,
        handleRequestSort,
        rowsCount,
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
    } = useWineListPage();

    if (userContext.isLoggedIn === false) {
        return <Navigate to="/login" />;
    }
    // MYMEMO: create DrunkWineList
    return (
        <div>
            <Box sx={{ width: '100%' }}>
                <Paper sx={{ width: '100%', mb: 2 }}>
                    <WineListToolbar setSelectedCellars={setSelectedCellars} selectedCellars={selectedCellars} cellarList={cellarList} />
                    <TableContainer>
                        <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="medium">
                            <WineListTableHead order={order} orderBy={orderBy} selectedCellars={selectedCellars} onRequestSort={handleRequestSort} />
                            <TableBody>
                                {visibleRows.map((row, index) => {
                                    const labelId = `enhanced-table-checkbox-${index}`;

                                    return (
                                        <TableRow
                                            hover
                                            onClick={event => handleClickRow(event, row)}
                                            role="checkbox"
                                            selected={selectedWine?.id === row.id}
                                            tabIndex={-1}
                                            key={row.id}
                                            sx={
                                                row.id.startsWith('empty-rack(')
                                                    ? { cursor: 'pointer', backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                                                    : { cursor: 'pointer' }
                                            }
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
                                            {/* MYMEMO(後日): make cepages look like tags */}
                                            <TableCell align="right">{getCepageAbbreviations(row.cepages)}</TableCell>
                                            <TableCell align="right">{row.bought_at}</TableCell>
                                            <TableCell align="right">{row.bought_from}</TableCell>
                                            <TableCell align="right">{row.price_with_tax}</TableCell>
                                            {/* MYMEMO(後日): show note: TableContainer を width:max-content にしたらできるけど、全列個別指定が必要になる
                                            https://smartdevpreneur.com/customizing-material-ui-table-cell-width/ */}
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
                        count={rowsCount}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </Box>
            {selectedWine && (
                <EditWineDialog isOpen={isEditOpen} handleClose={closeEditWineDialog} selectedWineId={selectedWine.id} cellarList={cellarList}></EditWineDialog>
            )}
        </div>
    );
};

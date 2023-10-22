import React, { useContext, useState, useRef } from 'react';
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
    Tooltip,
    Typography,
    Select,
    MenuItem,
    SelectChangeEvent,
    IconButton,
    Paper,
} from '@mui/material';
// import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import BookIcon from '@mui/icons-material/Book';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import { visuallyHidden } from '@mui/utils';
import { Navigate } from 'react-router-dom';
import useWineListPage, { Order } from '../../hooks/useWineListPage';
import { WineData } from '../../contexts/wine-context';
import useUserAPI from '../../hooks/useUserAPI';
import { UserContext } from '../../contexts/user-context';
import EditWineDialog from './EditWineDialog';
import CreateWineDialog from './CreateWineDialog';
import { WineContext } from '../../contexts/wine-context';

// Originally copied from https://mui.com/material-ui/react-table/#sorting-amp-selecting

interface WineListToolbarProps {
    selectedCellarId: string;
    setSelectedCellarId: React.Dispatch<React.SetStateAction<string>>;
    cellarList: string[][];
    handleClickAdd: (event: React.MouseEvent<unknown>) => void;
    handleLogout: () => Promise<void>;
}

const WineListToolbar = (props: WineListToolbarProps) => {
    const { selectedCellarId, setSelectedCellarId, cellarList, handleClickAdd, handleLogout } = props;
    const wineContext = useContext(WineContext);

    const [drunkOnly, setDrunkOnly] = useState(false);

    const handleClick = () => {
        const checked = !drunkOnly;
        setDrunkOnly(checked);
        wineContext.setWineListQuery({ is_drunk: checked });
        if (checked) {
            setSelectedCellarId('');
        } else {
            setSelectedCellarId(cellarList[0][0]);
        }
    };

    const handleCellarSelect = (event: SelectChangeEvent) => {
        setSelectedCellarId(event.target.value);
    };

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
            }}
        >
            <IconButton onClick={handleLogout} sx={{ mt: 1, mb: 2 }}>
                <LogoutIcon />
            </IconButton>
            <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
                {drunkOnly ? 'Drunk ' : ''}Wine List
            </Typography>
            <IconButton onClick={handleClick}>{drunkOnly ? <BookIcon /> : <WarehouseIcon />}</IconButton>
            <Select id="cellar-select" value={selectedCellarId} onChange={handleCellarSelect}>
                {cellarList.map(cellar => (
                    <MenuItem key={cellar[0]} value={cellar[0]}>
                        {cellar[1]}
                    </MenuItem>
                ))}
                <MenuItem value="NOT_IN_CELLAR">NOT_IN_CELLAR</MenuItem>
            </Select>
            <Tooltip title="Add new wine" onClick={handleClickAdd}>
                <IconButton>
                    <AddIcon />
                </IconButton>
            </Tooltip>
            {/* <Tooltip title="Filter list">
                <IconButton>
                    <FilterListIcon />
                </IconButton>
            </Tooltip> */}
        </Toolbar>
    );
};

interface WineHeadCell {
    id: keyof WineData;
    numeric: boolean;
}

interface WineListTableHeadProps {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof WineData) => void;
    order: Order;
    orderBy: string;
}

const WineListTableHead = (props: WineListTableHeadProps) => {
    const { order, orderBy, onRequestSort } = props;
    const createSortHandler = (property: keyof WineData) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
    };

    const toTitleCase = (text: string): string => {
        if (text === 'price_with_tax') return 'Price incl.';
        return text
            .toLowerCase()
            .split('_')
            .map(function (word: string) {
                return word.replace(word[0], word[0].toUpperCase());
            })
            .join(' ');
    };

    const wineHeadCells: WineHeadCell[] = [
        { id: 'position', numeric: false },
        { id: 'tag_texts', numeric: false },
        { id: 'name', numeric: false },
        { id: 'price_with_tax', numeric: true },
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
        { id: 'drunk_at', numeric: true },
    ];
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

export const WineList = () => {
    const userContext = useContext(UserContext);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const paginationRef = useRef<HTMLDivElement>(null);
    // MYMEMO(後日): 全ページでこれだけするのは違和感
    const { handleLogout } = useUserAPI();
    const {
        selectedCellarId,
        setSelectedCellarId,
        order,
        orderBy,
        handleRequestSort,
        rowsCount,
        visibleRows,
        selectedWine,
        handleClickAdd,
        closeCreateWineDialog,
        isCreateOpen,
        handleClickRow,
        closeEditWineDialog,
        isEditOpen,
        cellarList,
        emptyRows,
        rowsPerPage,
        page,
        handleChangePage,
        handleChangeRowsPerPage,
        getCepageAbbreviations,
    } = useWineListPage();

    const tableHeight =
        toolbarRef.current && paginationRef.current
            ? `${window.innerHeight - toolbarRef.current!.clientHeight - paginationRef.current!.clientHeight - 16}px`
            : '70vh';

    if (userContext.isLoggedIn === false) {
        return <Navigate to="/login" />;
    }
    return (
        <div>
            <Box sx={{ width: '100%' }}>
                <Paper sx={{ width: '100%', mb: 2 }}>
                    <div ref={toolbarRef}>
                        <WineListToolbar
                            setSelectedCellarId={setSelectedCellarId}
                            selectedCellarId={selectedCellarId}
                            cellarList={cellarList}
                            handleClickAdd={handleClickAdd}
                            handleLogout={handleLogout}
                        />
                    </div>
                    <TableContainer sx={{ maxHeight: tableHeight }}>
                        <Table stickyHeader sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="medium">
                            <WineListTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
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
                                            sx={row.name === '' ? { cursor: 'pointer', backgroundColor: 'rgba(0, 0, 0, 0.2)' } : { cursor: 'pointer' }}
                                        >
                                            <TableCell>{row.position}</TableCell>
                                            <TableCell>{row.tag_texts.join(', ')}</TableCell>
                                            <TableCell component="th" id={labelId} scope="row">
                                                {row.name}
                                            </TableCell>
                                            <TableCell align="right">{row.price_with_tax}</TableCell>
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
                                            <TableCell align="right">{row.drunk_at}</TableCell>
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
                    <div ref={paginationRef}>
                        <TablePagination
                            component="div"
                            count={rowsCount}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </div>
                </Paper>
            </Box>
            {selectedWine && (
                <EditWineDialog isOpen={isEditOpen} handleClose={closeEditWineDialog} selectedWineId={selectedWine.id} cellarList={cellarList}></EditWineDialog>
            )}
            <CreateWineDialog
                isOpen={isCreateOpen}
                handleClose={closeCreateWineDialog}
                selectedWineId={selectedWine?.id}
                cellarList={cellarList}
                selectedCellarId={selectedCellarId}
            ></CreateWineDialog>
        </div>
    );
};

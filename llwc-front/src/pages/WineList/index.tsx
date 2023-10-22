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
    Typography,
    Select,
    Menu,
    MenuList,
    MenuItem,
    ListItemText,
    SelectChangeEvent,
    IconButton,
    Paper,
} from '@mui/material';
// import FilterListIcon from '@mui/icons-material/FilterList';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import BookIcon from '@mui/icons-material/Book';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import { visuallyHidden } from '@mui/utils';
import { Navigate } from 'react-router-dom';
import useWineListPage, { COLUMN_ORDER, Order } from '../../hooks/useWineListPage';
import { WineDataKeys } from '../../contexts/wine-context';
import useUserAPI from '../../hooks/useUserAPI';
import { UserContext } from '../../contexts/user-context';
import EditWineDialog from './EditWineDialog';
import CreateWineDialog from './CreateWineDialog';
import { WineContext } from '../../contexts/wine-context';

// Originally copied from https://mui.com/material-ui/react-table/#sorting-amp-selecting

interface WineListToolbarProps {
    selectedCellarId: string;
    setSelectedCellarId: React.Dispatch<React.SetStateAction<string>>;
    setSortOrder: React.Dispatch<React.SetStateAction<{ key: WineDataKeys; order: Order }>>;
    setOrderedColumn: React.Dispatch<React.SetStateAction<WineDataKeys[]>>;
    cellarList: string[][];
    handleLogout: () => Promise<void>;
}

const WineListToolbar = (props: WineListToolbarProps) => {
    const { selectedCellarId, setSelectedCellarId, setSortOrder, setOrderedColumn, cellarList, handleLogout } = props;
    const wineContext = useContext(WineContext);

    const [drunkOnly, setDrunkOnly] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(menuAnchor);

    const toggleListMode = () => {
        const checked = !drunkOnly;
        setDrunkOnly(checked);
        wineContext.setWineListQuery({ is_drunk: checked });
        if (checked) {
            setSelectedCellarId('');
            setSortOrder({ key: 'drunk_at', order: 'desc' });
            setOrderedColumn(COLUMN_ORDER.drunk);
        } else {
            setSelectedCellarId(cellarList[0][0]);
            setSortOrder({ key: 'position', order: 'asc' });
            setOrderedColumn(COLUMN_ORDER.default);
        }
    };

    const handleCellarSelect = (event: SelectChangeEvent) => {
        setSelectedCellarId(event.target.value);
    };

    const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuAnchor(event.currentTarget);
    };

    const closeMenu = () => {
        setMenuAnchor(null);
    };

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
            }}
        >
            <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
                {drunkOnly ? 'Drunk ' : ''}Wines
            </Typography>
            <IconButton onClick={toggleListMode}>{drunkOnly ? <BookIcon /> : <WarehouseIcon />}</IconButton>
            <Select id="cellar-select" value={selectedCellarId} onChange={handleCellarSelect}>
                {cellarList.map(cellar => (
                    <MenuItem key={cellar[0]} value={cellar[0]}>
                        {cellar[1]}
                    </MenuItem>
                ))}
                <MenuItem value="NOT_IN_CELLAR">NOT_IN_CELLAR</MenuItem>
            </Select>
            <IconButton onClick={openMenu}>
                <MenuIcon />
            </IconButton>
            {/* <Tooltip title="Filter list">
                <IconButton>
                    <FilterListIcon />
                </IconButton>
            </Tooltip> */}
            <Menu open={isMenuOpen} anchorEl={menuAnchor} onClose={closeMenu}>
                <MenuList>
                    <MenuItem onClick={handleLogout}>
                        <LogoutIcon />
                        <ListItemText>Log out</ListItemText>
                    </MenuItem>
                </MenuList>
            </Menu>
        </Toolbar>
    );
};

interface WineListTableHeadProps {
    orderedColumn: WineDataKeys[];
    onRequestSort: (event: React.MouseEvent<unknown>, property: WineDataKeys) => void;
    sortOrder: { key: WineDataKeys; order: Order };
}

const WineListTableHead = (props: WineListTableHeadProps) => {
    const { orderedColumn, sortOrder, onRequestSort } = props;
    const createSortHandler = (property: WineDataKeys) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
    };

    const toTitleCase = (text: WineDataKeys): string => {
        if (text === 'price_with_tax') return 'Price';
        return text
            .toLowerCase()
            .split('_')
            .map(function (word: string) {
                return word.replace(word[0], word[0].toUpperCase());
            })
            .join('');
    };
    // MYMEMO(後日): add filter

    return (
        <TableHead>
            <TableRow>
                {orderedColumn.map(column => (
                    <TableCell key={column} align="left" padding="normal" sortDirection={sortOrder.key === column ? sortOrder.order : false}>
                        <TableSortLabel
                            active={sortOrder.key === column}
                            direction={sortOrder.key === column ? sortOrder.order : 'asc'}
                            onClick={createSortHandler(column as WineDataKeys)}
                        >
                            {toTitleCase(column)}
                            {sortOrder.key === column ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {sortOrder.order === 'desc' ? 'sorted descending' : 'sorted ascending'}
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
        orderedColumn,
        setOrderedColumn,
        selectedCellarId,
        setSelectedCellarId,
        sortOrder,
        setSortOrder,
        handleRequestSort,
        rowsCount,
        visibleRows,
        selectedWine,
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
                            setSortOrder={setSortOrder}
                            setOrderedColumn={setOrderedColumn}
                            cellarList={cellarList}
                            handleLogout={handleLogout}
                        />
                    </div>
                    <TableContainer sx={{ maxHeight: tableHeight }}>
                        <Table stickyHeader sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="small">
                            <WineListTableHead orderedColumn={orderedColumn} sortOrder={sortOrder} onRequestSort={handleRequestSort} />
                            <TableBody>
                                {visibleRows.map((row, index) => {
                                    const labelId = `enhanced-table-checkbox-${index}`;
                                    const rowData = {
                                        ...row,
                                        tag_texts: row.tag_texts.join(', '),
                                        cepages: getCepageAbbreviations(row.cepages),
                                    };

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
                                            {/* MYMEMO(後日): make cepages look like tags */}
                                            {orderedColumn.map(key => {
                                                let content = rowData[key as WineDataKeys];
                                                if (key === 'name') {
                                                    return (
                                                        <TableCell component="th" id={labelId} scope="row">
                                                            {content}
                                                        </TableCell>
                                                    );
                                                }
                                                return <TableCell>{content}</TableCell>;
                                            })}
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

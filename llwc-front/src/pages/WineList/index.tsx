import React, { useContext, useState, useRef, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
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
import NoteIcon from '@mui/icons-material/Note';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import { visuallyHidden } from '@mui/utils';
import useWineListPage, { COLUMN_ORDER, Order } from '../../hooks/useWineListPage';
import { WineDataKeys } from '../../contexts/wine-context';
import useUserAPI from '../../hooks/useUserAPI';
import { CellarContext } from '../../contexts/cellar-context';
import { UserContext } from '../../contexts/user-context';
import WineDialog from './WineDialog/WineDialog';
import { WineContext } from '../../contexts/wine-context';
import AppIcon from '../../components/AppIcon';
import Loading from '../Loading';

// Originally copied from https://mui.com/material-ui/react-table/#sorting-amp-selecting

interface WineListToolbarProps {
    setSortOrder: React.Dispatch<React.SetStateAction<{ key: WineDataKeys; order: Order }>>;
    setOrderedColumn: React.Dispatch<React.SetStateAction<WineDataKeys[]>>;
    handleLogout: () => Promise<void>;
}

const WineListToolbar = (props: WineListToolbarProps) => {
    const { setSortOrder, setOrderedColumn, handleLogout } = props;

    const cellarContext = useContext(CellarContext);
    const wineContext = useContext(WineContext);

    const [drunkOnly, setDrunkOnly] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(menuAnchor);

    const pageTitle = useMemo(() => {
        let title = 'Wines';
        if (drunkOnly) return 'Drunk' + title;

        if (wineContext.wineListQuery.cellarId !== 'NOT_IN_CELLAR') {
            const cellarCapacity = wineContext.wineList.length;
            const winesInCellarCount = wineContext.wineList.filter(wine => wine.name !== '').length;
            title += ` (${winesInCellarCount}/${cellarCapacity})`;
        }
        return title;
    }, [wineContext.wineListQuery.cellarId, drunkOnly, wineContext.wineList]);

    const toggleListMode = () => {
        const checked = !drunkOnly;
        setDrunkOnly(checked);
        if (checked) {
            wineContext.setWineListQuery({ isDrunk: true, cellarId: '' });
            setSortOrder({ key: 'drunk_at', order: 'desc' });
            setOrderedColumn(COLUMN_ORDER.drunk);
        } else {
            wineContext.setWineListQuery({ isDrunk: false, cellarId: cellarContext.cellarList[0].id });
            setSortOrder({ key: 'position', order: 'asc' });
            setOrderedColumn(COLUMN_ORDER.default);
        }
    };

    const handleCellarSelect = (event: SelectChangeEvent) => {
        wineContext.setWineListQuery(curr => {
            return { ...curr, cellarId: event.target.value };
        });
        closeMenu();
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
            <Link to="/">
                <AppIcon height={36} />
            </Link>
            <Typography sx={{ flex: '1 1 10%' }} variant="h6" id="tableTitle" component="div">
                {pageTitle}
            </Typography>
            <IconButton onClick={toggleListMode}>{drunkOnly ? <WarehouseIcon /> : <DescriptionIcon />}</IconButton>
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
                    <MenuItem>
                        <Select id="cellar-select" value={wineContext.wineListQuery.cellarId} onChange={handleCellarSelect}>
                            {cellarContext.cellarList.map(cellar => (
                                <MenuItem key={cellar.id} value={cellar.id}>
                                    {cellar.name}
                                </MenuItem>
                            ))}
                            <MenuItem value="NOT_IN_CELLAR">NOT_IN_CELLAR</MenuItem>
                        </Select>
                    </MenuItem>
                    <MenuItem>
                        <NoteIcon />
                        <Link to="/wine-memos" style={{ color: 'rgba(0, 0, 0, 0.87)', textDecorationLine: 'none' }}>
                            Memos
                        </Link>
                    </MenuItem>
                    <MenuItem>
                        <SettingsIcon />
                        <Link to="/settings" style={{ color: 'rgba(0, 0, 0, 0.87)', textDecorationLine: 'none' }}>
                            Settings
                        </Link>
                    </MenuItem>
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
        if (text === 'price') return 'Price';
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
        sortOrder,
        setSortOrder,
        handleRequestSort,
        rowsCount,
        visibleRows,
        selectedWine,
        wineDialogState,
        handleClickRow,
        closeWineDialog,
        emptyRows,
        rowsPerPage,
        page,
        handleChangePage,
        handleChangeRowsPerPage,
        getCepageAbbreviations,
        isLoading,
    } = useWineListPage();

    const tableHeight =
        toolbarRef.current && paginationRef.current
            ? `${window.innerHeight - toolbarRef.current!.clientHeight - paginationRef.current!.clientHeight - 16}px`
            : '70vh';

    if (userContext.isLoggedIn === false) {
        return <Navigate to="/login" />;
    }
    if (isLoading) {
        return <Loading />;
    }
    return (
        <div>
            <Box sx={{ width: '100%' }}>
                <Paper sx={{ width: '100%', mb: 2 }}>
                    <div ref={toolbarRef}>
                        <WineListToolbar setSortOrder={setSortOrder} setOrderedColumn={setOrderedColumn} handleLogout={handleLogout} />
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
                                            {orderedColumn.map(column => {
                                                let content = rowData[column as WineDataKeys];
                                                if (column === 'name') {
                                                    return (
                                                        <TableCell component="th" id={labelId} scope="row" key={row.id + column}>
                                                            {content}
                                                        </TableCell>
                                                    );
                                                }
                                                return <TableCell key={row.id + column}>{content}</TableCell>;
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
                            rowsPerPageOptions={[25, 50, 100, 200]}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </div>
                </Paper>
            </Box>
            {selectedWine && (
                <WineDialog
                    isOpen={wineDialogState.open}
                    handleClose={closeWineDialog}
                    selectedWine={selectedWine}
                    action={wineDialogState.action}
                ></WineDialog>
            )}
        </div>
    );
};

import { useContext, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TablePagination,
    TableRow,
    Paper,
} from '@mui/material';
import useWineSearchPage, { COLUMN_ORDER } from '../../hooks/useWineSearchPage';
import { WineDataKeys } from '../../contexts/wine-context';
import useUserAPI from '../../hooks/useUserAPI';
import { UserContext } from '../../contexts/user-context';
import WineDialog from './WineDialog/WineDialog';
import Loading from '../Loading';
import { WineSearchToolbar } from './WineSearchToolbar';
import { WineSearchTableHead } from './WineSearchTableHead';

// Originally copied from https://mui.com/material-ui/react-table/#sorting-amp-selecting

export const WineSearch = () => {
    const userContext = useContext(UserContext);

    const toolbarRef = useRef<HTMLDivElement>(null);
    const paginationRef = useRef<HTMLDivElement>(null);
    // MYMEMO(後日): 全ページでこれだけするのは違和感
    const { handleLogout } = useUserAPI();
    const {
        sortOrder,
        handleRequestSort,
        rowsCount,
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
        getCepageAbbreviations,
        isLoading,
        initializeWineSearch,
    } = useWineSearchPage();

    const tableHeight =
        toolbarRef.current && paginationRef.current
            ? `${window.innerHeight - toolbarRef.current!.clientHeight - paginationRef.current!.clientHeight}px`
            : '70vh';

    useEffect(() => {
        initializeWineSearch();
    }, [initializeWineSearch])

    if (userContext.isLoggedIn === false) {
        return <Navigate to="/login" />;
    }
    if (isLoading) {
        return <Loading />;
    }
    return (
        <div>
            <Box sx={{ width: '100%' }}>
                <Paper sx={{ width: '100%' }}>
                    <div ref={toolbarRef}>
                        <WineSearchToolbar handleLogout={handleLogout} openCreateWineDialog={openCreateWineDialog} />
                    </div>
                    <TableContainer sx={{ maxHeight: tableHeight }}>
                        <Table stickyHeader sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="small">
                            <WineSearchTableHead sortOrder={sortOrder} onRequestSort={handleRequestSort} />
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
                                            {COLUMN_ORDER.map(column => {
                                                const content = rowData[column as WineDataKeys];
                                                if (column === 'name') {
                                                    return (
                                                        <TableCell component="th" id={labelId} scope="row" key={row.id + column}>
                                                            {content}
                                                        </TableCell>
                                                    );
                                                }
                                                return <TableCell key={row.id + column}>{content}</TableCell>;
                                            })}
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
            {wineDialogState.open && (
                <WineDialog
                    isOpen={wineDialogState.open}
                    handleClose={closeWineDialog}
                    selectedWine={selectedWine}
                    action={wineDialogState.action}
                />
            )}
        </div>
    );
};

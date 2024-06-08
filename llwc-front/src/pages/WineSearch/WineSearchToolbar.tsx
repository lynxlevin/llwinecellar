import React, { useContext, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Toolbar, Typography, Menu, MenuList, MenuItem, ListItemText, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import NoteIcon from '@mui/icons-material/Note';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityUpdateGoodIcon from '@mui/icons-material/SecurityUpdateGood';
import { WineContext } from '../../contexts/wine-context';
import AppIcon from '../../components/AppIcon';
import WineSearchDialog from './WineSearchDialog';

interface WineSearchToolbarProps {
    handleLogout: () => Promise<void>;
    openCreateWineDialog: () => void;
}

export const WineSearchToolbar = (props: WineSearchToolbarProps) => {
    const { handleLogout, openCreateWineDialog } = props;

    const wineContext = useContext(WineContext);

    const [isWineSearchDialogOpen, setIsWineSearchDialogOpen] = useState<boolean>(false);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(menuAnchor);

    const pageTitle = useMemo(() => {
        let title = 'Wines';

        if (wineContext.wineListQuery.cellarId !== 'NOT_IN_CELLAR') {
            const cellarCapacity = wineContext.wineList.length;
            const winesInCellarCount = wineContext.wineList.filter(wine => wine.name !== '').length;
            title += ` (${winesInCellarCount}/${cellarCapacity})`;
        }
        return title;
    }, [wineContext.wineListQuery.cellarId, wineContext.wineList]);

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
                maxHeight: '56px',
            }}
        >
            <Link to='/'>
                <AppIcon height={36} />
            </Link>
            <Typography sx={{ flex: '1 1 10%' }} variant='h6' id='tableTitle' component='div'>
                {pageTitle}
            </Typography>
            <Tooltip title='Add wine'>
                <IconButton onClick={openCreateWineDialog}>
                    <AddIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title='Filter list'>
                <IconButton onClick={() => setIsWineSearchDialogOpen(true)}>
                    <FilterListIcon />
                </IconButton>
            </Tooltip>
            <IconButton onClick={openMenu}>
                <MenuIcon />
            </IconButton>
            <Menu open={isMenuOpen} anchorEl={menuAnchor} onClose={closeMenu}>
                <MenuList>
                    <MenuItem>
                        <NoteIcon />
                        <Link to='/wine-memos' style={{ color: 'rgba(0, 0, 0, 0.87)', textDecorationLine: 'none' }}>
                            Memos
                        </Link>
                    </MenuItem>
                    <MenuItem>
                        <SettingsIcon />
                        <Link to='/settings' style={{ color: 'rgba(0, 0, 0, 0.87)', textDecorationLine: 'none' }}>
                            Settings
                        </Link>
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            window.location.reload();
                        }}
                    >
                        <SecurityUpdateGoodIcon />
                        バージョンアップ
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                        <LogoutIcon />
                        <ListItemText>Log out</ListItemText>
                    </MenuItem>
                </MenuList>
            </Menu>
            <WineSearchDialog isOpen={isWineSearchDialogOpen} handleClose={() => setIsWineSearchDialogOpen(false)} />
        </Toolbar>
    );
};

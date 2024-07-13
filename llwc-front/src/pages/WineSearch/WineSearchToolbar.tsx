import React, { useContext, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Toolbar, Typography, Menu, MenuList, MenuItem, ListItemText, IconButton, Tooltip, ToggleButton, ToggleButtonGroup } from '@mui/material';
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
import { CellarContext } from '../../contexts/cellar-context';
import useWineContext from '../../hooks/useWineContext';

interface WineSearchToolbarProps {
    handleLogout: () => Promise<void>;
    openCreateWineDialog: () => void;
}

export const WineSearchToolbar = (props: WineSearchToolbarProps) => {
    const { handleLogout, openCreateWineDialog } = props;

    const wineContext = useContext(WineContext);
    const cellarContext = useContext(CellarContext);
    const { searchWine } = useWineContext();

    const [cellarSelect, setCellarSelect] = useState<string>(wineContext.wineSearchQuery.cellarId);
    const [isWineSearchDialogOpen, setIsWineSearchDialogOpen] = useState<boolean>(false);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(menuAnchor);

    const pageTitle = useMemo(() => {
        const winesInCellarCount = wineContext.wineList.filter(wine => wine.name !== '').length;
        if (!['-', 'NOT_IN_CELLAR'].includes(wineContext.wineSearchQuery.cellarId)) {
            const cellarCapacity = wineContext.wineList.length;
            return `${winesInCellarCount}/${cellarCapacity}`;
        }
        return winesInCellarCount;
    }, [wineContext.wineSearchQuery.cellarId, wineContext.wineList]);

    const onCellarSelect = (_: React.MouseEvent<HTMLElement, MouseEvent>, newSelection: string | null) => {
        if (newSelection === null) return;
        setCellarSelect(newSelection);
        searchWine({ ...wineContext.wineSearchQuery, cellarId: newSelection });
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
                maxHeight: '56px',
            }}
        >
            <Link to='/'>
                <AppIcon height={36} />
            </Link>
            <Typography sx={{ flex: '1 1 10%' }} variant='h6' id='tableTitle' component='div'>
                {pageTitle}
            </Typography>
            {cellarContext.cellarList.length < 3 && (
                <ToggleButtonGroup value={cellarSelect} exclusive onChange={onCellarSelect}>
                    {cellarContext.cellarList.map((cellar, i) => (
                        <ToggleButton key={cellar.id} value={cellar.id}>
                            {i + 1}
                        </ToggleButton>
                    ))}
                    <ToggleButton value='NOT_IN_CELLAR'>-</ToggleButton>
                    <ToggleButton value='-'>⚪︎</ToggleButton>
                </ToggleButtonGroup>
            )}
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
            {isWineSearchDialogOpen && <WineSearchDialog isOpen={isWineSearchDialogOpen} handleClose={() => setIsWineSearchDialogOpen(false)} />}
        </Toolbar>
    );
};

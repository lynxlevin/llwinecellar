import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import SettingsIcon from '@mui/icons-material/Settings';
import { AppBar, IconButton, ListItemText, Menu, MenuItem, MenuList, Toolbar } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import AppIcon from '../../components/AppIcon';

interface WineMemosAppBarProps {
    handleLogout: () => Promise<void>;
}

const WineMemosAppBar = (props: WineMemosAppBarProps) => {
    const { handleLogout } = props;

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();

    const isMenuOpen = Boolean(menuAnchor);

    const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMenuAnchor(event.currentTarget);
    };

    const closeMenu = () => {
        setMenuAnchor(null);
    };

    return (
        <AppBar position='fixed' sx={{ bgcolor: 'primary.light' }}>
            <Toolbar>
                <Link to="/">
                    <AppIcon height={36} />
                </Link>
                <div style={{ flexGrow: 1 }} />
                <IconButton
                    onClick={() => {
                        window.scroll({ top: 0 });
                        navigate('/wine-list');
                    }}
                    sx={{ mr: 2, color: 'rgba(0,0,0,0.67)' }}
                >
                    <WarehouseIcon />
                </IconButton>
                <IconButton onClick={openMenu}>
                    <MenuIcon />
                </IconButton>
                <Menu open={isMenuOpen} anchorEl={menuAnchor} onClose={closeMenu}>
                    <MenuList>
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
        </AppBar>
    );
};
export default WineMemosAppBar;

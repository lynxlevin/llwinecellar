import { Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import useUserAPI from '../hooks/useUserAPI';

const Header = () => {
    const { handleLogout } = useUserAPI();

    return (
        <header className="App-header">
            <Link to="/">Top</Link>
            <Box sx={{ mt: 1 }}>
                <Button onClick={handleLogout} type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                    Sign out
                </Button>
            </Box>
        </header>
    );
};

export default Header;

import { Box, Container } from '@mui/material';
import appIcon from '../assets/icon.png';

const Loading = () => {
    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <img srcSet={`${appIcon}?w=16&h=16&fit=crop&auto=format&dpr=16 16x`} src={`${appIcon}?w=16&h=16&fit=crop&auto=format`} alt="app_icon" />
            </Box>
        </Container>
    );
};

export default Loading;

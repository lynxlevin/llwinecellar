import { Box, Container } from '@mui/material';
import AppIcon from '../components/AppIcon';

const Loading = () => {
    return (
        <Container component='main' maxWidth='xs'>
            <Box
                sx={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <AppIcon height={64} />
            </Box>
        </Container>
    );
};

export default Loading;

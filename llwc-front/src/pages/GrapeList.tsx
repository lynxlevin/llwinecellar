import { Link } from 'react-router-dom';
import { AppBar, Box, Container, Toolbar, Paper, Button, Typography } from '@mui/material';
import AppIcon from '../components/AppIcon';

export const GrapeList = () => {
    const grapeList = ['a', 'b'];

    return (
        <>
            <AppBar
                position="absolute"
                color="default"
                elevation={0}
                sx={{
                    position: 'relative',
                    borderBottom: t => `1px solid ${t.palette.divider}`,
                }}
            >
                <Toolbar>
                    <Link to="/">
                        <AppIcon height={36} />
                    </Link>
                    <Typography sx={{ flex: '1 1 10%' }} variant="h6" color="inherit" noWrap>
                        GrapeList
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                    {grapeList.map(grape => {
                        return <>{grape}</>;
                    })}
                </Paper>
            </Container>
        </>
    );
};

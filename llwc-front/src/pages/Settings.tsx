import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Box, Container, Toolbar, Paper, Button, Typography, MenuItem } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';

export const Settings = () => {
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
                    <Typography sx={{ flex: '1 1 10%' }} variant="h6" color="inherit" noWrap>
                        Settings
                    </Typography>
                    <MenuItem>
                        <ViewListIcon />
                        <Link to="/wine-list" style={{ color: 'rgba(0, 0, 0, 0.87)', textDecorationLine: 'none' }}>
                            Wine List
                        </Link>
                    </MenuItem>
                </Toolbar>
            </AppBar>
            <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
                <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                    <Typography component="h1" variant="h4" align="center">
                        Checkout
                    </Typography>
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="contained" sx={{ mt: 3, ml: 1 }}>
                                test
                            </Button>
                        </Box>
                    </>
                </Paper>
            </Container>
        </>
    );
};

import React from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Avatar, Button, TextField, Box, Typography, Container, CssBaseline } from '@mui/material';
import useLoginPage from '../hooks/useLoginPage';

const Login = () => {
    const { login, logout } = useLoginPage();

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                Sign in
                </Typography>
                <Box component="form" onSubmit={login} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                    {/* <Grid container>
                        <Grid item xs>
                        <Link href="#" variant="body2">
                            Forgot password?
                        </Link>
                        </Grid>
                        <Grid item>
                        <Link href="#" variant="body2">
                            {"Don't have an account? Sign Up"}
                            </Link>
                            </Grid>
                        </Grid> */}
                </Box>
                {/* MYMEMO: delete later */}
                <Box component="form" onSubmit={logout} noValidate sx={{ mt: 1 }}>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign out
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;
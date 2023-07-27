import React from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Avatar, Button, TextField, Box, Typography, Container, CssBaseline } from '@mui/material';
import useLoginPage from '../hooks/useLoginPage';
import { Navigate } from 'react-router-dom';

const Login = () => {
    const { isLoggedIn, handleLogin, handleEmailInput, handlePasswordInput } = useLoginPage();

    if (isLoggedIn) {
        return <Navigate to="/" />;
    }
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
                <Box sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        onChange={handleEmailInput}
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
                        onChange={handlePasswordInput}
                    />
                    <Button fullWidth variant="contained" onClick={handleLogin} sx={{ mt: 3, mb: 2 }}>
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
            </Box>
        </Container>
    );
};

export default Login;

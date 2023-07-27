import React, { useEffect } from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Avatar, Button, TextField, Box, Typography, Container, CssBaseline } from '@mui/material';
import { UserAPI } from '../apis/UserAPI';

const Login = () => {
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            email: data.get('email'),
            password: data.get('password'),
        });
        // MYMEMO: credentials hard coded
        // MYMEMO: handle errors
        await UserAPI.login({email: 'test@test.com', password: 'test'});
        const session_res = await UserAPI.session();
        console.log(session_res);
        // MYMEMO: add redirect
    };

    const handleLogout = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await UserAPI.logout();
        const session_res = await UserAPI.session();
        console.log(session_res);
    };

    useEffect(() => {
        void (async () => {
            const session_res = await UserAPI.session();
            console.log(session_res);
        })();
    }, []);

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
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
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
                <Box component="form" onSubmit={handleLogout} noValidate sx={{ mt: 1 }}>
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
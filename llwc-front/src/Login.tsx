import React, { useEffect, useState } from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Avatar, Button, TextField, Box, Typography, Container, CssBaseline } from '@mui/material';
import { UserAPI } from './apis/UserAPI';

const Login = () => {
    const [cSRFToken, setCSRFToken] = useState<string>('')
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            email: data.get('email'),
            password: data.get('password'),
        });
        // MYMEMO: credentials hard coded
        await UserAPI.login({email: 'test@test.com', password: 'test'}, cSRFToken);
        // MYMEMO: add redirect
    };

    useEffect(() => {
        void (async () => {
            const res = await UserAPI.getCSRF();
            setCSRFToken(res.headers['x-csrftoken']);
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
            </Box>
        </Container>
    );
};

export default Login;
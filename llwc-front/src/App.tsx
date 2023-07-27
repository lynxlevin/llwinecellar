import React from 'react';
import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import { Button, Box } from '@mui/material';
import Login from './pages/Login';
import { UserAPI } from './apis/UserAPI';

function App() {
    const handleLogout = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await UserAPI.logout();
    };

    return (
        <div className="App">
            <header className="App-header">
                <Link to="/">Top</Link>
                <Box component="form" onSubmit={handleLogout} noValidate sx={{ mt: 1 }}>
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                        Sign out
                    </Button>
                </Box>
            </header>
            <Routes>
                <Route
                    path="/"
                    element={
                        <>
                            <Link to="/login">Login</Link>
                        </>
                    }
                />
                <Route path="/login" element={<Login />} />
            </Routes>
        </div>
    );
}

export default App;

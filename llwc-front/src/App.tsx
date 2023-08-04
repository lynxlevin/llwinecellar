import React from 'react';
import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import { WineList } from './pages/WineList';
import { type Cellar, CellarContext } from './contexts/cellar-context';
import { UserContext } from './contexts/user-context';
import Header from './pages/Header';

function App() {
    const [isLoggedIn, setIsLoggedIn] = React.useState<boolean | null>(null);
    // MYMEMO: CellarContext を準備するのはまだ早いかも
    const [list, setList] = React.useState<Cellar[]>([]);

    return (
        <div className="App">
            <UserContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
                <CellarContext.Provider value={{ list, setList }}>
                    <Header></Header>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <>
                                    <Link to="/login">Login</Link>
                                    <Link to="/wine-list">Wine List</Link>
                                </>
                            }
                        />
                        <Route path="/login" element={<Login />} />
                        <Route path="/wine-list" element={<WineList />} />
                    </Routes>
                </CellarContext.Provider>
            </UserContext.Provider>
        </div>
    );
}

export default App;

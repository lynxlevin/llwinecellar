import React, { useState } from 'react';
import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import { WineList } from './pages/WineList';
import { type Cellar, CellarContext } from './contexts/cellar-context';
import { UserContext } from './contexts/user-context';
import Header from './pages/Header';
import { WineContext, WineData } from './contexts/wine-context';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    // MYMEMO: CellarContext を準備するのはまだ早いかも
    const [list, setList] = useState<Cellar[]>([]);
    const [wineList, setWineList] = useState<WineData[]>([]);

    return (
        <div className="App">
            <UserContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
                <CellarContext.Provider value={{ list, setList }}>
                    <WineContext.Provider value={{ wineList, setWineList }}>
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
                    </WineContext.Provider>
                </CellarContext.Provider>
            </UserContext.Provider>
        </div>
    );
}

export default App;

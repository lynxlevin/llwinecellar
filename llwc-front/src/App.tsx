import React, { useState } from 'react';
import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import { WineList } from './pages/WineList';
import { type Cellar, CellarContext } from './contexts/cellar-context';
import { UserContext } from './contexts/user-context';
import Header from './pages/Header';
import { WineContext, WineData, WineListQuery } from './contexts/wine-context';
import { WineTagContext } from './contexts/wine-tag-context';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    // MYMEMO(後日): CellarContext を準備するのはまだ早いかも
    const [list, setList] = useState<Cellar[]>([]);
    const [wineList, setWineList] = useState<WineData[]>([]);
    const [wineListQuery, setWineListQuery] = useState<WineListQuery>({ is_drunk: false });
    const [wineTagList, setWineTagList] = useState<string[]>([]);

    return (
        <div className="App">
            <UserContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
                <CellarContext.Provider value={{ list, setList }}>
                    <WineContext.Provider value={{ wineList, setWineList, wineListQuery, setWineListQuery }}>
                        <WineTagContext.Provider value={{ wineTagList, setWineTagList }}>
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
                        </WineTagContext.Provider>
                    </WineContext.Provider>
                </CellarContext.Provider>
            </UserContext.Provider>
        </div>
    );
}

export default App;

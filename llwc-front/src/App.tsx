import React, { useState } from 'react';
import './App.css';
import { Link, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import { WineList } from './pages/WineList';
import { type Cellar, CellarContext } from './contexts/cellar-context';
import { UserContext } from './contexts/user-context';
import { WineContext, WineData, WineListQuery } from './contexts/wine-context';
import { WineTagContext } from './contexts/wine-tag-context';
import { Settings } from './pages/Settings';

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
                            <Routes>
                                <Route
                                    path="/"
                                    element={
                                        <>
                                            <p></p>
                                            <Link to="/wine-list">Wine List</Link>
                                            <p></p>
                                            <Link to="/settings">Settings</Link>
                                        </>
                                    }
                                />
                                <Route path="/login" element={<Login />} />
                                <Route path="/wine-list" element={<WineList />} />
                                <Route path="/settings" element={<Settings />} />
                            </Routes>
                        </WineTagContext.Provider>
                    </WineContext.Provider>
                </CellarContext.Provider>
            </UserContext.Provider>
        </div>
    );
}

export default App;

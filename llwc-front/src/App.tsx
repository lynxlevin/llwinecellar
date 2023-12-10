import React, { useState } from 'react';
import './App.css';
import { Link, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import { WineList } from './pages/WineList';
import { CellarContext, type Cellar } from './contexts/cellar-context';
import { UserContext } from './contexts/user-context';
import { WineContext, WineData, WineListQuery } from './contexts/wine-context';
import { WineTagContext } from './contexts/wine-tag-context';
import { WineRegionContext } from './contexts/wine-region-context';
import { Settings } from './pages/Settings';
import { GrapeList } from './pages/GrapeList';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    // MYMEMO(後日): CellarContext を準備するのはまだ早いかも
    const [cellarList, setCellarList] = useState<Cellar[]>([]);
    const [wineList, setWineList] = useState<WineData[]>([]);
    const [wineListQuery, setWineListQuery] = useState<WineListQuery>({ isDrunk: false, cellarId: undefined });
    const [wineTagList, setWineTagList] = useState<string[]>([]);
    const [wineRegionList, setWineRegionList] = useState<string[]>([]);

    return (
        <div className="App">
            <UserContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
                <CellarContext.Provider value={{ cellarList, setCellarList }}>
                    <WineContext.Provider value={{ wineList, setWineList, wineListQuery, setWineListQuery }}>
                        <WineTagContext.Provider value={{ wineTagList, setWineTagList }}>
                            <WineRegionContext.Provider value={{ wineRegionList, setWineRegionList }}>
                                <Routes>
                                    <Route
                                        path="/"
                                        element={
                                            <>
                                                <p></p>
                                                <Link to="/wine-list">Wine List</Link>
                                                <p></p>
                                                <Link to="/settings">Settings</Link>
                                                <p></p>
                                                <Link to="/grape-list">GrapeList</Link>
                                            </>
                                        }
                                    />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/wine-list" element={<WineList />} />
                                    <Route path="/settings" element={<Settings />} />
                                    <Route path="/grape-list" element={<GrapeList />} />
                                </Routes>
                            </WineRegionContext.Provider>
                        </WineTagContext.Provider>
                    </WineContext.Provider>
                </CellarContext.Provider>
            </UserContext.Provider>
        </div>
    );
}

export default App;

import React, { useState } from 'react';
import './App.css';
import { Link, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import { WineSearch } from './pages/WineSearch/WineSearch';
import { CellarContext, type Cellar } from './contexts/cellar-context';
import { UserContext } from './contexts/user-context';
import { WineContext, WineData, WineListQuery, WineSearchQuery } from './contexts/wine-context';
import { WineTagContext } from './contexts/wine-tag-context';
import { WineRegionContext } from './contexts/wine-region-context';
import { GrapeMaster, GrapeMasterContext } from './contexts/grape-master-context';
import { Settings } from './pages/Settings';
import { GrapeList } from './pages/GrapeList';
import WineMemos from './pages/WineMemos';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [cellarList, setCellarList] = useState<Cellar[]>([]);
    const [wineList, setWineList] = useState<WineData[]>([]);
    const [wineListQuery, setWineListQuery] = useState<WineListQuery>({ cellarId: undefined });
    const [wineSearchQuery, setWineSearchQuery] = useState<WineSearchQuery>({ show_drunk: true, show_stock: true });
    const [wineTagList, setWineTagList] = useState<string[]>([]);
    const [wineRegionList, setWineRegionList] = useState<string[]>([]);
    const [grapeMasterList, setGrapeMasterList] = useState<GrapeMaster[]>([]);

    return (
        <div className='App'>
            <UserContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
                <CellarContext.Provider value={{ cellarList, setCellarList }}>
                    <WineContext.Provider value={{ wineList, setWineList, wineListQuery, setWineListQuery, wineSearchQuery, setWineSearchQuery }}>
                        <WineTagContext.Provider value={{ wineTagList, setWineTagList }}>
                            <WineRegionContext.Provider value={{ wineRegionList, setWineRegionList }}>
                                <GrapeMasterContext.Provider value={{ grapeMasterList, setGrapeMasterList }}>
                                    <Routes>
                                        <Route
                                            path='/'
                                            element={
                                                <div style={{ fontSize: '24px' }}>
                                                    <br />
                                                    <Link to='/wine-search'>Wine Search</Link>
                                                    <br />
                                                    <br />
                                                    <Link to='/wine-memos'>WineMemo</Link>
                                                    <br />
                                                    <br />
                                                    <Link to='/settings'>Settings</Link>
                                                    <br />
                                                    <br />
                                                    <Link to='/grape-list'>GrapeList</Link>
                                                </div>
                                            }
                                        />
                                        <Route path='/login' element={<Login />} />
                                        <Route path='/wine-search' element={<WineSearch />} />
                                        <Route path='/wine-memos' element={<WineMemos />} />
                                        <Route path='/settings' element={<Settings />} />
                                        <Route path='/grape-list' element={<GrapeList />} />
                                    </Routes>
                                </GrapeMasterContext.Provider>
                            </WineRegionContext.Provider>
                        </WineTagContext.Provider>
                    </WineContext.Provider>
                </CellarContext.Provider>
            </UserContext.Provider>
        </div>
    );
}

export default App;

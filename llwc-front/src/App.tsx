import React from 'react';
import './App.css';
import {Routes, Route, Link} from 'react-router-dom';
import Login from './pages/Login';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Link to="/">Top</Link>
      </header>
      <Routes>
        <Route path="/" element={(
          <>
            <Link to="/login">Login</Link>
          </>
        )} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;

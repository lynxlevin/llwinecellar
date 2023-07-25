import React from 'react';
import logo from './logo.svg';
import './App.css';
import TestPage from './testPage';
import {Routes, Route, Link} from 'react-router-dom';
import Login from './Login';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        header
      </header>
      <Routes>
        <Route path="/" element={(
          <>
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Edit <code>src/App.tsx</code> and save to reload.
            </p>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
            <Link to="/test">Click Me!</Link>
            <Link to="/login">Login</Link>
          </>
        )} />
        <Route path="/test" element={
          <TestPage />
        } />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;

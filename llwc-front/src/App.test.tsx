import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';

test('renders top link', () => {
    render(
        <Router>
            <App />
        </Router>,
    );
    const linkElement = screen.getByText(/Top/i);
    expect(linkElement).toBeInTheDocument();
});

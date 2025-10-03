import React from 'react';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

// Simple test components
const HomePage = () => (
  <div style={{ padding: '20px' }}>
    <h1>Home Page - Working!</h1>
    <p>If you can see this, React is working.</p>
    <Link to="/browse">Go to Browse</Link>
  </div>
);

const BrowsePage = () => (
  <div style={{ padding: '20px' }}>
    <h1>Browse Page - Working!</h1>
    <p>If you can see this, routing is working.</p>
    <Link to="/">Go Home</Link>
  </div>
);

const SimpleApp = () => (
  <BrowserRouter>
    <div>
      <nav style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '20px' }}>Home</Link>
        <Link to="/browse">Browse</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
      </Routes>
    </div>
  </BrowserRouter>
);

export default SimpleApp;


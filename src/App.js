// src/App.js
import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LDashboard from './Layout/LDashboard';
import LLandingpage from './Layout/LLandingpage';
import LLogin from './Layout/LLogin';
import LRegister from './Layout/LRegister';
import LForgetpassword from './Layout/LForgetpassword';
import { useTheme } from "./ThemeContext";

function App() {
  const { isDarkMode } = useTheme()
  return (
    <Router>
      <div className={`App ${isDarkMode ? 'bg-dark' : ''}`}>
        <Routes>
          <Route path="/" element={<LLandingpage />} />
          <Route path="/home" element={<LLandingpage />} />
          <Route path="/login" element={<LLogin />} />
          <Route path="/register" element={<LRegister />} />
          <Route path="/forgetpass" element={<LForgetpassword />} />
          <Route path="/dashboard" element={<LDashboard />} />

        </Routes>
      </div>
    </Router>
  );
}
export default App;

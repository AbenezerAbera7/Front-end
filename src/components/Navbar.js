import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { FaUserCircle, FaSun, FaMoon } from 'react-icons/fa';
import { isAuthenticated, removeToken } from '../services/authService';
import { useTheme } from "../ThemeContext";

const Navbar = () => {
    const navigate = useNavigate();
    const { isDarkMode, setIsDarkMode } = useTheme()
    const themeClass = isDarkMode ? 'bg-dark text-light' : 'light'

    const handleLogout = () => {
        removeToken();
        navigate('/');
    };

    return (
        <nav className={`navbar navbar-expand-lg fixed-top ${isDarkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-light'}`}>
            <div className="container-fluid">
                <div className="top-bar fixed-top d-flex align-items-center justify-content-between w-100">
                    <div className="left-section d-flex align-items-center">
                        <div className="profile-icon me-2">
                            <FaUserCircle size={40} />
                        </div>
                        <Link to="/home" className="navbar-brand mb-0">Pipsqueak</Link>
                    </div>
                    <Button
                        variant={isDarkMode ? 'outline-light' : 'outline-dark'}
                        onClick={() => setIsDarkMode((prev) => !prev)}
                        className="dark-mode-toggle me-2"
                    >
                        {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
                    </Button>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;

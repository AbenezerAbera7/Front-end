// src/utils/auth.js

import axios from 'axios';

export const isAuthenticated = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        // Replace with your verification API endpoint
        const response = await axios.get('http://localhost:5000/api/verify', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.status === 200; // Assume 200 means the token is valid
    } catch (error) {
        return false; // If error, consider the token invalid
    }
};

export const logout = () => {
    localStorage.removeItem('token');
};

import { jwtDecode } from 'jwt-decode';

export const getToken = () => localStorage.getItem('token');

export const setToken = (token) => localStorage.setItem('token', token);

export const removeToken = () => localStorage.removeItem('token');

export const isTokenExpired = (token) => {
    if (!token) return true;

    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    return decoded.exp < currentTime;
};

export const isAuthenticated = () => {
    const token = getToken();
    return token && !isTokenExpired(token);
};

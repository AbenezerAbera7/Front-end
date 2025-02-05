import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css';
import { Alert, Spinner, Button, Form, Container, Row, Col } from 'react-bootstrap';
import { FiLock, FiMail, FiRefreshCw } from 'react-icons/fi';
import { getToken, isAuthenticated } from '../services/authService';
import { useTheme } from "../ThemeContext";

const Login = () => {
    const [error, setError] = useState('');
    const [step2, setStep2] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [timer, setTimer] = useState(900); // 15 minutes in seconds
    const [isCodeExpired, setIsCodeExpired] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { isDarkMode, toggleDarkMode } = useTheme()
    const themeClass = isDarkMode ? 'bg-dark text-light' : 'light'

    // Countdown timer for code expiration
    useEffect(() => {
        let countdown;
        if (isCodeSent && timer > 0) {
            countdown = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer <= 1) {
                        clearInterval(countdown);
                        setIsCodeExpired(true);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
        }
        return () => clearInterval(countdown);
    }, [isCodeSent, timer]);

    const handleResendCode = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const response = await axios.post('http://localhost:5000/api/resend-login', { email });
            setIsCodeExpired(false);
            setTimer(900);
            setIsCodeSent(true);
            setMessage(response.data.message);
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to resend code. Try again.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const credentials = { email, password };

        try {
            const token = getToken();
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Unexpected error occurred!');
            } else {
                setStep2(true);
                setMessage(data.message);
                setIsCodeExpired(false);
                setTimer(900);
                setIsCodeSent(true);
            }
        } catch (error) {
            setError(error.message || 'Something went wrong, please try again later.');
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const response = await axios.post('http://localhost:5000/api/verify-login', { email, password, code });
            localStorage.setItem('token', response.data.token);
            setMessage(response.data.message);
            navigate('/dashboard');
        } catch (error) {
            setError(error.response?.data?.error || 'Something is wrong please try again later.');
        }
    };

    useEffect(() => {
        if (isAuthenticated()) {
            navigate('/dashboard');
        }
    }, [navigate]);

    return (
        <Container fluid className={`login-container d-flex align-items-center justify-content-center min-vh-100 ${themeClass}`}>
            <Row className="w-100 justify-content-center">
                <Col md={6} lg={4}>
                    <div className={`p-5 rounded shadow ${themeClass}`}>
                        {!step2 ? (
                            <>
                                <h3 className={`text-center mb-4 ${themeClass}`}>Login</h3>
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3" controlId="formEmail">
                                        <Form.Label>
                                            <FiMail className={`me-2 ${themeClass}`} /> Email
                                        </Form.Label>
                                        <Form.Control
                                            className={`${themeClass} form-control`}
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => {
                                                setError('');
                                                setMessage('');
                                                setEmail(e.target.value);
                                            }}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="formPassword">
                                        <Form.Label>
                                            <FiLock className={`me-2 ${themeClass}`} /> Password
                                        </Form.Label>
                                        <Form.Control
                                            className={`${themeClass} form-control`}
                                            type="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => {
                                                setError('');
                                                setMessage('');
                                                setPassword(e.target.value);
                                            }}
                                            required
                                        />
                                    </Form.Group>
                                    <div className="text-center mb-3">
                                        <Link to="/forgetpass">Forgot password?</Link>
                                    </div>
                                    <Button type="submit" variant="primary" className="w-100">
                                        Login
                                    </Button>
                                </Form>
                                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                                <div className="text-center mt-3">
                                    <Link to="/register">Don't have an account? Sign up here</Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className={`text-center mb-4 ${themeClass}`}>Verification</h3>
                                {message && <Alert variant="success" className="text-center">{message}</Alert>}
                                <Form onSubmit={handleVerify}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Verification Code</Form.Label>
                                        <div className="d-flex">
                                            <Form.Control
                                                type="number"
                                                placeholder="Enter your code"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value)}
                                                required
                                            />
                                            <Button
                                                onClick={handleResendCode}
                                                variant="outline-primary"
                                                className="ms-2"
                                                disabled={!isCodeExpired}
                                            >
                                                <FiRefreshCw className="me-1" />
                                                Resend
                                            </Button>
                                        </div>
                                    </Form.Group>
                                    <Button type="submit" variant="primary" className="w-100">
                                        Verify
                                    </Button>
                                </Form>
                                <div className="text-center mt-2">
                                    {!isCodeExpired ? (
                                        <p>Time remaining: {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}</p>
                                    ) : (
                                        <p className="text-danger">Code expired. Please resend.</p>
                                    )}
                                </div>
                                {error && <Alert variant="danger">{error}</Alert>}
                            </>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;

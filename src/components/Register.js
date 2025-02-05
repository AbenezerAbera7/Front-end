import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FiMail, FiLock, FiRefreshCw, FiUser, FiBriefcase } from 'react-icons/fi';
import './Register.css';
import { useTheme } from "../ThemeContext";


const Register = () => {
    const [credentials, setCredentials] = useState({
        organization: '',
        firstname: '',
        lastname: '',
        email: '',
        confirmemail: '',
        password: '',
        confirmpassword: ''
    });
    const [emailError, setEmailError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [timer, setTimer] = useState(900); // 15 minutes in seconds
    const [error, setError] = useState('');
    const [isCodeExpired, setIsCodeExpired] = useState(false);
    const [step, setStep] = useState(1);
    const { isDarkMode, toggleDarkMode } = useTheme()
    const themeClass = isDarkMode ? 'bg-dark text-light' : 'light'
    const navigate = useNavigate();

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

    const handleChange = (e) => {
        setError('');
        setEmailError(false);
        setPasswordError(false);
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (credentials.password !== credentials.confirmpassword) {
            setError("Passwords don't match.");
            setPasswordError(true);
            return;
        }
        if (credentials.confirmemail !== credentials.email) {
            setError("Emails don't match.");
            setEmailError(true);
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/register', credentials);
            setIsCodeSent(true);
            setStep(2);
        } catch (error) {
            if (error.response) {
                setError(`Registration failed: ${error.response.data.error}`);
            } else {
                setError('Registration failed: Server is down. Try again later.');
            }
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post('http://localhost:5000/api/verify', {
                organization: credentials.organization,
                email: credentials.email,
                code: verificationCode,
                firstname: credentials.firstname,
                lastname: credentials.lastname,
                password: credentials.password,
            });
            setStep(3); // Move to the next step
            navigate('/login');
        } catch (error) {
            setError(error.response?.data?.error || 'Verification failed. Try again.');
        }
    };

    const handleResendCode = async () => {
        try {
            await axios.post('http://localhost:5000/api/resend', { email: credentials.email });
            setIsCodeExpired(false);
            setTimer(900);
            setIsCodeSent(true);
        } catch (error) {
            setError('Failed to resend code. Try again.');
        }
    };

    return (
        <Container fluid className={`d-flex align-items-center justify-content-center min-vh-100 ${themeClass}`}>
            <Row className="w-100 justify-content-center">
                <Col md={6} lg={5}>
                    <div className={`${themeClass} p-4 rounded shadow`}>
                        <h3 className={`text-center mb-4 ${themeClass}`}>Register</h3>
                        {step === 1 && (
                            <Form onSubmit={handleRegister}>
                                <Form.Group className={`mb-3 ${themeClass}`}>
                                    <Form.Label>
                                        <FiBriefcase className="me-2" /> Organization Name
                                    </Form.Label>
                                    <Form.Control
                                        className={`${themeClass} form-control`}
                                        type="text"
                                        name="organization"
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <FiUser className="me-2" /> First Name
                                    </Form.Label>
                                    <Form.Control
                                        className={`${themeClass} form-control`}
                                        type="text"
                                        name="firstname"
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <FiUser className="me-2" /> Last Name
                                    </Form.Label>
                                    <Form.Control
                                        className={`${themeClass} form-control`}
                                        type="text"
                                        name="lastname"
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <FiMail className="me-2" /> Email
                                    </Form.Label>
                                    <Form.Control
                                        className={`${themeClass} form-control`}
                                        type="email"
                                        name="email"
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <FiMail className="me-2" /> Confirm Email
                                    </Form.Label>
                                    <Form.Control
                                        className={`${themeClass} form-control`}
                                        type="email"
                                        name="confirmemail"
                                        onChange={handleChange}
                                        required
                                        isInvalid={emailError}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <FiLock className="me-2" /> Password
                                    </Form.Label>
                                    <Form.Control
                                        className={`${themeClass} form-control`}
                                        type="password"
                                        name="password"
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <FiLock className="me-2" /> Confirm Password
                                    </Form.Label>
                                    <Form.Control
                                        className={`${themeClass} form-control`}
                                        type="password"
                                        name="confirmpassword"
                                        onChange={handleChange}
                                        required
                                        isInvalid={passwordError}
                                    />
                                </Form.Group>
                                {error && <Alert variant="danger">{error}</Alert>}
                                <Button type="submit" variant="primary" className="w-100">
                                    Continue
                                </Button>
                            </Form>
                        )}

                        {step === 2 && (
                            <div className="text-center">
                                <h4 className={`${themeClass} `}>Verification Code Sent</h4>
                                <Form onSubmit={handleVerify}>
                                    <Form.Group className={`${themeClass} mb-3`}>
                                        <Form.Control
                                            className={`${themeClass} form-control`}
                                            type="text"
                                            placeholder="Enter verification code"
                                            value={verificationCode}
                                            onChange={(e) => {
                                                setError('');
                                                setVerificationCode(e.target.value);
                                            }}
                                            required
                                        />
                                    </Form.Group>
                                    {error && <Alert variant="danger">{error}</Alert>}
                                    <Button type="submit" variant="primary" className="w-100">
                                        Verify
                                    </Button>
                                </Form>
                                {isCodeExpired && (
                                    <Button variant="secondary" onClick={handleResendCode} className="mt-3">
                                        <FiRefreshCw className={`${themeClass} me-2`} />
                                        Resend Code
                                    </Button>
                                )}
                                <p className={`${themeClass} mt-3`}>
                                    Time remaining: {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}
                                </p>
                            </div>
                        )}

                        {step === 3 && <p className="text-success">Registration complete. Redirecting...</p>}

                        <div className="text-center mt-3">
                            <Link to="/login">Already have an account? Login here</Link>
                        </div>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;

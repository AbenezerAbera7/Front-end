import React, { useState, useEffect } from "react";
import { FaBars, FaSignOutAlt, FaCogs, FaCog, FaCloudUploadAlt, FaHome, FaMoon, FaSun, FaUserCircle, FaArrowLeft } from "react-icons/fa";
import './dashboard.css';
import { useNavigate } from "react-router-dom";
import JSONFileUploader from "./JsonFileUploader";
import AdminPanel from "./AdminPanel";
import OrganizationList from "./OrganizationList";
import { Spinner, Button, Card, Container, Row, Col, Alert, Modal } from "react-bootstrap";
import { isAuthenticated } from "../services/authService";
import Profile from "./Profile";
import { useTheme } from "../ThemeContext";

function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeMenu, setActiveMenu] = useState('Home');
    const { isDarkMode, setIsDarkMode } = useTheme()
    const [showLogoutModel, setShowLogoutModel] = useState(false)
    const navigate = useNavigate();
    const themeClass = isDarkMode ? 'dark bg-dark text-light' : 'light'

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json(); // Only call .json() once
            if (!response.ok) {
                setError(data.error || "An unexpected error occurred");
                setLoading(false);
                return;
            }
            setDashboardData(data);
            setLoading(false); // Data fetched successfully, stop loading spinner
        } catch (error) {
            setError(error.message);
            setLoading(false); // Stop loading on error
        }
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
        } else {
            fetchDashboardData(); // Only fetch data if authenticated
        }
    }, []);

    const handleLogout = () => {
        setShowLogoutModel(true)
    };
    const Logout = () => {
        localStorage.removeItem('token');
        setShowLogoutModel(false)
        navigate('/login');

    }

    const handleMenuClick = (menu) => {
        setActiveMenu(menu);
    };

    const renderContent = () => {
        switch (activeMenu) {
            case 'Home':
                return <OrganizationList />;
            case 'Upload':
                return <JSONFileUploader />;
            case 'Adminpanel':
                return <AdminPanel />;
            case 'Profile':
                return <Profile username={dashboardData.name} email={dashboardData.email} />;
            default:
                return <OrganizationList />;
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center " style={{ minHeight: '100vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    const cancelLogout = () => {

        setShowLogoutModel(false)

    };

    return (
        <div className={`app ${isDarkMode ? 'bg-dark text-light' : ''}`}>

            <div className="top-bar">
                <div className="left-section">

                    <div className="brand-name">
                        <h2>Pipsqueak</h2>
                    </div>
                </div>
                <div>

                    <Button
                        variant={isDarkMode ? 'outline-light' : 'outline-dark'}
                        onClick={() => setIsDarkMode(prev => !prev)}
                        className="dark-mode-toggle m-2"
                    >
                        {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
                    </Button>
                    <Button variant="outline-light" onClick={toggleSidebar}>
                        <FaUserCircle size={20} />
                    </Button>
                </div>
            </div>

            <div className={`sidebar ${sidebarOpen ? "open" : "close"}  ${themeClass}`}>
                <div className={`sidebar-header text-center `}>
                    <button className="toggle-btn right" onClick={toggleSidebar}>
                        {sidebarOpen ? <FaArrowLeft size={24} /> : <FaBars size={24} />}
                    </button>
                    <span style={{ height: '100%', padding: '20px', fontSize: '24px', fontWeight: 'bolder' }}>
                        Dashboard
                    </span>
                </div>

                <div className={`profile-section`}>
                    <div className="profile-info">
                        <div className="profile-pic">
                            <FaUserCircle size={80} />
                        </div>
                        <div className="profile-name">
                            <p>{dashboardData?.name || "Guest"}</p>
                        </div>
                    </div>
                </div>

                <ul className={`sidebar-links`}>
                    <li
                        className={activeMenu === "Home" ? "active p-2" : "p-2"}
                        onClick={() => handleMenuClick("Home")}
                    >
                        <FaHome size={18} />
                        <span>Home</span>
                    </li>
                    <li
                        className={activeMenu === "Upload" ? "active p-2" : "p-2"}
                        onClick={() => handleMenuClick("Upload")}
                    >
                        <FaCloudUploadAlt size={18} />
                        <span>Upload</span>
                    </li>
                    {dashboardData?.isadmin === 1 && (
                        <li
                            className={activeMenu === "Adminpanel" ? "active p-2" : "p-2"}
                            onClick={() => handleMenuClick("Adminpanel")}
                        >
                            <FaCog size={18} />
                            <span>Admin Panel</span>
                        </li>
                    )}
                    <li
                        className={activeMenu === "Profile" ? "active p-2" : "p-2"}
                        onClick={() => handleMenuClick("Profile")}
                    >
                        <FaCogs size={18} />
                        <span>Profile</span>
                    </li>
                    <li className="p-2" onClick={handleLogout}>
                        <FaSignOutAlt size={18} />
                        <span>Logout</span>
                    </li>
                </ul>
            </div>

            <div className={`main-content mt-3 ${themeClass}`}>
                {error && <Alert variant={'danger'} style={{ maxWidth: '300px' }} >{error}</Alert>}
                <Container className={isDarkMode ? 'bg-dark' : ''}>
                    <Row className={isDarkMode ? 'bg-dark' : ''}>
                        <Col lg={12} md={12} sm={12}>
                            <Card className={isDarkMode ? 'bg-dark dashboard-card' : "dashboard-card"}>
                                <Card.Body>
                                    {renderContent()}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Modal show={showLogoutModel} onHide={cancelLogout}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Logout</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to Logout?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={cancelLogout}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={Logout}>
                        Logout
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Dashboard;

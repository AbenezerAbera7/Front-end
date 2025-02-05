import React, { useEffect, useState } from 'react';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import './Profile.css'
import { useTheme } from "../ThemeContext";
const axios = require('axios')


const Profile = ({username,email}) => {
   
  const [showOldPass,setShowOldPass]=useState(false)
  const {isDarkMode}=useTheme()
  const [error,setError]=useState('')
  const themeClass = isDarkMode ? 'bg-dark text-light' : 'light'

  // State to store the user's profile data
  const [profileData, setProfileData] = useState({
    name: username,
    email:email,
    password: '',
    confirmPassword: '',
    oldPassword:''
  });

  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    e.preventDefault()
    const { name, value } = e.target;

    setProfileData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
   
    
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    // Basic validation
    if (profileData.password !== profileData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try { 
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/update',{
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
      },
      body:JSON.stringify({ "email": profileData.email,"password":profileData.password,"oldPassword":profileData.oldPassword})

      });
      const data = await response.json(); 
      if (!response.ok) {
          setError(data.error || "An unexpected error occurred");
          return;
      }
      setMessage(data.message)
      
  } catch (error) {
      setError(error.response?.data?.error || 'Something is wrong please try again later.');
  }
  };

  useEffect(()=>{
    setTimeout(()=>{
        setError()
        setMessage()
    },4000)
  },[error,message])

  

  return (
    <Container className="mt-5">
      <Row>
        <Col md={6} sm={12}>
          <div className={`text-center mb-4 ${themeClass}`}>
            <FaUserCircle size={100} />
            <h2>Update Profile</h2>
          </div>

          {message && (
            <Alert variant={'success'}>
              {message}
            </Alert>
          )}
           {error && (
            <Alert variant={'danger'}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formName">
              <Form.Label className={`${themeClass} mb-2`} >Name</Form.Label>
              <Form.Control
              readOnly
              className={`${themeClass} form-control mb-3`}
                type="text"
                placeholder="Enter your name"
                name="name"
                value={profileData.name}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formName">
              <Form.Label className={`${themeClass} mb-2`} >Email</Form.Label>
              <Form.Control
              readOnly
              className={`${themeClass} form-control mb-3`}
                type="email"
                placeholder="Enter your name"
                name="email"
                value={profileData.email}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="formOldPassword">
              <Form.Label className={`${themeClass}`} >Current Password</Form.Label>
              <Form.Control
              required
              className={`${themeClass} form-control`}
                type="password"
                placeholder="Enter your current password"
                name="oldPassword"
                value={profileData.oldPassword}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formPassword">
              <Form.Label className={`${themeClass} mt-3`} >Password</Form.Label>
              <Form.Control
                required
                className={`${themeClass} form-control`}
                type="password"
                placeholder="Enter your new password"
                name="password"
                value={profileData.password}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group controlId="formConfirmPassword">
              <Form.Label className={`${themeClass}`} >Confirm Password</Form.Label>
              <Form.Control
              className={`${themeClass} form-control`}
                type="password"
                placeholder="Confirm your password"
                name="confirmPassword"
                value={profileData.confirmPassword}
                onChange={handleChange}
              />
            </Form.Group>

              <Button variant="primary" type="submit" className="mt-3">
              Save Changes
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;

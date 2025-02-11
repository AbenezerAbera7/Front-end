import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported
import { toast } from 'react-toastify';
import { TbArrowsExchange } from "react-icons/tb";
import { FaBan, FaUserCheck } from "react-icons/fa";
import { Button, Tooltip,OverlayTrigger, Spinner, Modal, Table } from 'react-bootstrap';
import { useTheme } from "../ThemeContext";
import { MdDeleteSweep } from "react-icons/md";


import './AdminPanel.css'
function AdminPanel() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user'); // Default to 'user'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usererror, setUserError] = useState(null);
  const [orgerror, setOrgError] = useState(null);
  const [showForm, setShowForm] = useState(false); // To toggle the form visibility
  const [organizations, setOrganizations] = useState([]);
  const [organizationName, setOrganizationName] = useState('');
  const [userOrganization,setUserOrganization]=useState('')
  const [showOrgForm,setShowOrgForm]=useState(false)
  const [message,setMessage]=useState('')
  const [orgmessage,setOrgMessage]=useState('')
  const [usermessage,setUserMessage]=useState('')
  const [error,setError]=useState(null)
  const [userIdToDelete, setUserIdToDelete] = useState(null); 
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State for delete confirmation modal
  const [showUnbanModal, setShowUnbanModal] = useState(false); // State for delete confirmation modal
  const [showDeletePermanentModal,setShowDeletePermanentModal]=useState(false)
  const [reloadUser,setReloadUser]=useState(false)
  const [showChangeRoleModel, setShowChangeRoleModel] = useState(false); 
  const [userIdToChange, setUserIdToChange] = useState(null); 
  const { isDarkMode, toggleDarkMode } = useTheme()
  const themeClass = isDarkMode ? 'bg-dark text-light' : 'light'

  


  // Fetch current users from the API
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://16.170.235.27:5000/api/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Include token in the Authorization header
          },
        });

        if (!response.ok) {
          setUserError('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data); // Store the fetched data
      } catch (error) {
        setUsers(error.message); // Store error message if the fetch fails
      } finally {
        setLoading(false); // Stop loading in either case
      }
    };

    fetchUsers();
  }, [token,reloadUser]); 
  
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('http://16.170.235.27:5000/api/organizations', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, 
          },
        });

        if (!response.ok) {
          setOrgError('Failed to fetch organizations');
          return 
        }
        const data = await response.json();
        setOrganizations(data.organizations);
        if (data.organizations){
          setUserOrganization(data.organizations[0].id)
        }
      } catch (err) {
        toast.error(err.message)
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);


  const CreateOrganization = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://16.170.235.27:5000/api/create_organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify({name:organizationName}),
      });

      const data = await response.json();
      if (!response.ok) {
        setOrgError("can't create orgnization")
      }
      else{

          // Assuming the new user is returned from the API
          setOrganizations((prevOrg) => [...prevOrg, data['organization']]);
    
          // Reset form fields
          setOrganizationName('');
          
      }

    } catch (error) {
      setOrgError(`Error creating user ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission to create a new user
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newUser = { username, email, password, userType,organization_id: userOrganization };

    setLoading(true);
    try {
      const response = await fetch('http://16.170.235.27:5000/api/create_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();
      if (!response.ok) {
        setUserError(data['error'])
      }
      else{

          // Assuming the new user is returned from the API
          setUsers((prevUsers) => [...prevUsers, data['user']]);
    
          // Reset form fields
          setUsername('');
          setEmail('');
          setPassword('');
          setUserType('user');
          setShowForm(false); 
      }

    } catch (error) {
      setUserError('Error creating user');
    } finally {
      setLoading(false);
    }
  };


const handleInvertRole = (user_id, role) => {
  
  const updateRole = role === 1 ? 0 : 1;
  
  // Create a new array to avoid mutating the state directly
  const updatedUsers = users.map(user => {
      if (user.user_id === user_id) {
          return { ...user, isadmin: updateRole };
      }
      return user;
  });

  const countadmins = updatedUsers.filter(user => user.isadmin === 1).length;

  // If there are no admins left, show an alert
  if (countadmins === 0) {
      toast.error("Can't change role, at least one admin is mandatory!");
  } else {
      // Update the state to show the role change modal
      setUserIdToChange(user_id);
      setShowChangeRoleModel(true);
  }
};

useEffect(()=>{
  setTimeout(()=>{
    setMessagesAnderror()
  },4000)
},[error,message,orgerror,usererror,usermessage,orgmessage])
  const setMessagesAnderror=()=>{
    setError('')
    setMessage('')
    setOrgError('')
    setUserError()
    setUserMessage('')
    setOrgMessage('')

  }


  const handleDelete = (user_id,current_ban_status) => {
    setUserIdToDelete(user_id); //user to ban or unban
    if (current_ban_status==1){
      setShowUnbanModal(true)
    }else{
      setShowDeleteModal(true); 
    }
  };

  const handleDeletePermanent = (user_id) => {
    setUserIdToDelete(user_id); //user to ban or unban
    setShowDeletePermanentModal(true)
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://16.170.235.27:5000/api/users/${userIdToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const Data = await response.json();
      if (!response.ok) {
        setUserError(Data.error || "An unexpected error occurred");
        return
       
      }
      
      setReloadUser(prev=>!prev)
      setShowDeleteModal(false); // Close the modal after deletion
      setShowUnbanModal(false)
      setUserMessage(Data.message || "Changes successfully applied")
    } catch (error) {
      setError(error.message);
      setShowDeleteModal(false); // Close the modal if error occurs
      setShowUnbanModal(false)
    }
  };

  const confirmDeletePermanently = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://16.170.235.27:5000/api/users/remove/${userIdToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const Data = await response.json();
      if (!response.ok) {
        setUserError(Data.error || "An unexpected error occurred");
        return
       
      }
      
      setReloadUser(prev=>!prev)
      setUserMessage(Data.message || "Changes successfully applied")
      setShowDeletePermanentModal(false)
    } catch (error) {
      setError(error.message);
      
    }

   
  };

  const cancelDelete = () => {
    setShowDeleteModal(false); 
    setShowUnbanModal(false)
    setShowChangeRoleModel(false)
    setShowDeletePermanentModal(false)
    
  };

  const confirmRole = async ()=>{
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://16.170.235.27:5000/api/users/role/${userIdToChange}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const Data = await response.json();
      if (!response.ok) {
        setUserError(Data.error || "An unexpected error occurred");
      }


      setReloadUser(prev=>!prev)
      setShowChangeRoleModel(false)
      setUserMessage(Data.message || "Changes successfully applied")
    } catch (error) {
      setError(error.message);
      setShowChangeRoleModel(false); 
    }
  }

  
  const banTooltip = <Tooltip id="ban-tooltip">Temporarily Ban</Tooltip>;
  const removeTooltip = <Tooltip id="ban-tooltip">Permanently Remove</Tooltip>;
  const unbanTooltip = <Tooltip id="unban-tooltip">Lift Ban</Tooltip>;
  const adminTooltip = <Tooltip id="unban-tooltip">Promote to Admin </Tooltip>;
  const userTooltip = <Tooltip id="unban-tooltip">Demote to User</Tooltip>;


  if (loading) { return (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
  <Spinner animation="border" variant="primary" />
</div>)
  }  

  return (
    <div className={`${themeClass} container mt-4`}>
      <h2 className={`${themeClass} mb-3`}>Admin Panel</h2>
      {error && <p className="text-danger">{error}</p>}

      <h3  className={`${themeClass} mt-4`} >Organizations</h3>
      {orgerror && <p className="text-danger">{orgerror}</p>}
      <Table variant={isDarkMode?'dark':'light'} className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Created Date</th>
  
          </tr>
        </thead>
        <tbody> 
          {organizations.map((organization, index) => (
            <tr key={index}>
              <td>{organization.name}</td>
              <td>{organization.created_date!=='now'?new Date(organization.created_date).toLocaleString():'Just Now'}</td>
            </tr>
          ))}
        </tbody>
      </Table>

       <button
        className="btn btn-primary mb-2"
        onClick={() => setShowOrgForm((prev) => !prev)}
      >
        {showOrgForm ? 'Cancel' : 'New Organization'}
      </button>
      {showOrgForm && (
          <div className="form-container">
          <h2>Create Organization</h2>
    
          <form onSubmit={CreateOrganization} className="create-org-form">
            <div className="form-group" style={{width:'100%',maxWidth:'300px'}}>
              <label htmlFor="name" className="form-label">Organization Name</label>
              <input className={`${themeClass} form-control`}
                type="text"
                id="name"
                value={organizationName}
                onChange={(e)=>setOrganizationName(e.target.value)}
                placeholder="Enter organization name"
                required
               
              />
            </div>
    
            <button type="submit" className="btn btn-success mt-3" disabled={loading}>
              {loading ? 'Creating...' : 'Create Organization'}
            </button>
          </form>
    
          {orgerror && <p className="error-message">{orgerror}</p>}
          {message && <p className="success-message">{message}</p>}
        </div>
      )}

      

      <h3  className={`${themeClass} mt-5`}>Users</h3>
      {usererror && <p className="text-danger">{usererror}</p>}
      {usermessage && <p className="text-success">{usermessage}</p>}


      <Table variant={isDarkMode?'dark':'light'} className="table table-striped">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>User Type</th>
            <th>Created At</th>
            <th>Invert Role</th> 
            <th>Ban user</th> 
            <th>Remove</th> 
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.isadmin == 1 ? 'Admin' : 'User'}</td>
              <td>{user.created_at!=='now'?new Date(user.created_at).toLocaleString():'now'}</td>
              <td>
              <OverlayTrigger placement="top" overlay={user.isadmin == 0?adminTooltip:userTooltip}> 
                   <Button  variant="outline-success"   onClick={() => handleInvertRole(user.user_id,user.isadmin)} >       
                        <TbArrowsExchange  style={{fontSize: '20px'}} /> 
                    </Button>
              </OverlayTrigger>
              </td>

              <td> 
                <OverlayTrigger placement="top" overlay={user.banned == 1?unbanTooltip:banTooltip}>
                  <Button  variant={user.banned==0?"outline-danger":'outline-success'}   onClick={() => handleDelete(user.user_id,user.banned)} >                                                             { user.banned==1?
                                    (<div>
                                      <FaUserCheck style={{fontSize: '20px' }} />
                                      </div>):
                                      <div>
                                        <FaBan style={{fontSize: '20px' }} /> 
                                      </div>
                                  }
                  </Button>
                </OverlayTrigger>
            </td>
            <td> 
                <OverlayTrigger placement="top" overlay={removeTooltip}>
                  <Button  variant="outline-danger"  onClick={() => handleDeletePermanent(user.user_id)} >                                                             
                        <MdDeleteSweep />   
                  </Button>
                </OverlayTrigger>
            </td>
            </tr>
          ))}
        </tbody>
      </Table>

       <button
        className="btn btn-primary mb-2"
        onClick={() => setShowForm((prev) => !prev)}
      >
        {showForm ? 'Cancel' : 'New User'}
      </button>

    
     {showForm && (
  <div className={`${themeClass} card p-1`} style={{width:'100%',maxWidth:'300px'}}>
    <h4 className="mb-1">Create New User</h4>
    <form onSubmit={handleSubmit}>
      
      {/* Username Field */}
      <div className={`${themeClass} mb-1`}>
        <label htmlFor="username" className={`${themeClass} form-label`}>Username</label>
        <input
          type="text"
          id="username"
          className={`${themeClass} form-control`}
          value={username}
          onChange={(e) => {
              setUserError('')
              setUsername(e.target.value)}}
          required
        />
      </div>

      {/* Email Field */}
      <div className="mb-1">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          type="email"
          id="email"
          className={`${themeClass} form-control`}
          value={email}
          onChange={(e) => {
              setEmail(e.target.value)
              setUserError('')}
          }
          required
        />
      </div>

      {/* Password Field */}
      <div className="mb-1">
        <label htmlFor="password" className="form-label">Password</label>
        <input
          type="password"
          id="password"
          className={`${themeClass} form-control`}
          value={password}
          onChange={(e) => {
              setUserError('')
              setPassword(e.target.value)}}
          required
        />
      </div>
      <div className="mb-1">
        <label htmlFor="organization" className="form-label">Organization</label>
        <select
  id="organization"
  className={`${themeClass} form-select`}
  value={userOrganization}
  onChange={(e) => {
    setUserError('');
    setUserOrganization(e.target.value);
  }}
  required
>
  {organizations.map((org, index) => (
    <option key={org.id} value={org.id}>
      {org.name}
    </option>
  ))}
</select>
      </div>

      {/* User Type Field */}
      <div className="mb-1">
        <label htmlFor="userType" className="form-label">User Type</label>
        <select
          id="userType"
          className={`${themeClass} form-select`}
          value={userType}
          onChange={(e) => {
              setUserError('')
              setUserType(e.target.value)}}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      

      {/* Submit Button */}
      <button
        type="submit"
        className="btn btn-success"
        disabled={loading}
      >
        {loading ? 'Adding...' : 'Add User'}
      </button>
      {usererror && <p className="text-danger">{usererror}</p>}
    </form>
  </div>
)}

<Modal  show={showDeleteModal} onHide={cancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Ban</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to ban this user?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Confirm ban
          </Button>
        </Modal.Footer>
      </Modal>
<Modal show={showUnbanModal} onHide={cancelDelete}>
  <Modal.Header closeButton>
    <Modal.Title>Confirm Unban</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p>Are you sure you want to unban this user?</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={cancelDelete}>
      Cancel
    </Button>
    <Button variant="primary" onClick={confirmDelete}>
      Confirm Unban
    </Button>
  </Modal.Footer>
</Modal>

<Modal show={showChangeRoleModel} onHide={cancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Role Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to change this user Role?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmRole}>
            Confirm Change
          </Button>
        </Modal.Footer>
</Modal>

<Modal  show={showDeletePermanentModal} onHide={cancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Remove</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to remove this user Permanently?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeletePermanently}>
            Remove User
          </Button>
        </Modal.Footer>
</Modal>

    </div>
  );
}

export default AdminPanel;

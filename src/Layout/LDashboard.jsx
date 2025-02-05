import React,{useEffect,useState} from 'react'
import { isAuthenticated } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
function LDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const verifyAuth = async () => {
      const authStatus = await isAuthenticated();
      if (!authStatus) {
        navigate('/login');
      } else {
        setLoading(false); // Set loading to false if not authenticated
      }
    };

    verifyAuth();
  }, [navigate]);
  if (loading) return <p>Loading...</p>;
  return (
    <div style={{paddingTop:'100px'}}>
        <Dashboard />
    </div>
  )
}

export default LDashboard
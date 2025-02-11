import React, { useState, useEffect } from "react";
import PastScans from "./PastScans";
import { Spinner, Table } from 'react-bootstrap';
import { useTheme } from "../ThemeContext";


const OrganizationList = () => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem('token');
  const { isDarkMode } = useTheme()
  const themeClass = isDarkMode ? 'bg-dark text-light' : 'light'

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
          throw new Error('Failed to fetch organizations');
        }
        const data = await response.json();
        setOrganizations(data.organizations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleOrgClick = (orgId) => {
    setSelectedOrgId(orgId === selectedOrgId ? null : orgId); // Toggle selection
  };

  return (
    <div className={`container mt-5 ${themeClass}`}>
      <h2 className="text-center mb-4">Organizations</h2>
      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : error ? (
        <p className="text-danger text-center">{error}</p>
      ) : (
        <>
          <div className="table-responsive">
            <Table variant={isDarkMode?'dark':'light'} className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Organization Name</th>
                  <th>Updated date</th>
                  <th>Created date</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org, index) => (
                  <tr key={org.id} onClick={() => handleOrgClick(org.id)} style={{ cursor: 'pointer' }}>
                    <td>{index + 1}</td>
                    <td>{org.name}</td>
                    <td>{new Date(org.update_date).toLocaleString()}</td>
                    <td>{new Date(org.created_date).toLocaleString()}</td>
                    <td>
                      {selectedOrgId === org.id ? "Hide scans" : "Show scans"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {selectedOrgId && <PastScans organizationid={selectedOrgId} />}
        </>
      )}
    </div>
  );
};

export default OrganizationList;
